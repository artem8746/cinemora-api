import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { VacancyStatus } from '@/vacancies/enums/vacancy-status.enum';

export interface UserVacancyRow {
  userId: string;
  vacancyId: string;
  status: VacancyStatus;
  position: number;
}

@Injectable()
export class UserVacancyOrderingService {
  async getNextPositionForStatus(params: {
    manager: EntityManager;
    userId: string;
    status: VacancyStatus;
  }): Promise<number> {
    const { manager, userId, status } = params;
    const raw = await manager
      .createQueryBuilder()
      .select('COALESCE(MAX(user_vacancy.position), -1) + 1', 'next_position')
      .from('user_vacancies', 'user_vacancy')
      .where('user_vacancy.user_id = :userId', { userId })
      .andWhere('user_vacancy.status = :status', { status })
      .getRawOne<{ next_position: string }>();

    return Number(raw?.next_position ?? 0);
  }

  async findUserVacancyOrFail(params: {
    manager: EntityManager;
    userId: string;
    vacancyId: string;
  }): Promise<UserVacancyRow> {
    const { manager, userId, vacancyId } = params;

    const row = await manager
      .createQueryBuilder()
      .select('user_vacancy.user_id', 'user_id')
      .addSelect('user_vacancy.vacancy_id', 'vacancy_id')
      .addSelect('user_vacancy.status', 'status')
      .addSelect('user_vacancy.position', 'position')
      .from('user_vacancies', 'user_vacancy')
      .where('user_vacancy.user_id = :userId', { userId })
      .andWhere('user_vacancy.vacancy_id = :vacancyId', { vacancyId })
      .getRawOne<{
        user_id: string;
        vacancy_id: string;
        status: VacancyStatus;
        position: string;
      }>();

    if (!row) {
      throw new NotFoundException(
        `Vacancy with ID ${vacancyId} not found or does not belong to user`,
      );
    }

    return {
      userId: row.user_id,
      vacancyId: row.vacancy_id,
      status: row.status,
      position: Number(row.position),
    };
  }

  async compactPositionsAfterDelete(params: {
    manager: EntityManager;
    userId: string;
    status: VacancyStatus;
    deletedPosition: number;
  }): Promise<void> {
    const { manager, userId, status, deletedPosition } = params;
    await manager.query(
      `UPDATE "user_vacancies"
       SET "position" = "position" - 1
       WHERE "user_id" = $1
         AND "status" = $2
         AND "position" > $3`,
      [userId, status, deletedPosition],
    );
  }

  async reorderUserVacancy(params: {
    manager: EntityManager;
    userVacancy: UserVacancyRow;
    targetStatus?: VacancyStatus;
    targetPosition?: number;
  }): Promise<void> {
    const { manager, userVacancy, targetStatus, targetPosition } = params;
    const nextStatus = targetStatus ?? userVacancy.status;

    if (nextStatus === userVacancy.status) {
      await this.reorderInSameStatus({ manager, userVacancy, targetPosition });
      return;
    }

    await this.moveAcrossStatuses({
      manager,
      userVacancy,
      nextStatus,
      targetPosition,
    });
  }

  private async reorderInSameStatus(params: {
    manager: EntityManager;
    userVacancy: UserVacancyRow;
    targetPosition?: number;
  }): Promise<void> {
    const { manager, userVacancy, targetPosition } = params;
    const sameStatusCount = await manager
      .createQueryBuilder()
      .from('user_vacancies', 'user_vacancy')
      .where('user_vacancy.user_id = :userId', { userId: userVacancy.userId })
      .andWhere('user_vacancy.status = :status', { status: userVacancy.status })
      .getCount();

    const maxPosition = Math.max(0, sameStatusCount - 1);
    const nextPosition = Math.min(
      Math.max(targetPosition ?? userVacancy.position, 0),
      maxPosition,
    );

    if (nextPosition === userVacancy.position) {
      return;
    }

    if (nextPosition < userVacancy.position) {
      await manager.query(
        `UPDATE "user_vacancies"
         SET "position" = "position" + 1
         WHERE "user_id" = $1
           AND "status" = $2
           AND "position" >= $3
           AND "position" < $4`,
        [
          userVacancy.userId,
          userVacancy.status,
          nextPosition,
          userVacancy.position,
        ],
      );
    } else {
      await manager.query(
        `UPDATE "user_vacancies"
         SET "position" = "position" - 1
         WHERE "user_id" = $1
           AND "status" = $2
           AND "position" <= $3
           AND "position" > $4`,
        [
          userVacancy.userId,
          userVacancy.status,
          nextPosition,
          userVacancy.position,
        ],
      );
    }

    await manager.query(
      `UPDATE "user_vacancies"
       SET "position" = $1
       WHERE "user_id" = $2
         AND "vacancy_id" = $3`,
      [nextPosition, userVacancy.userId, userVacancy.vacancyId],
    );
  }

  private async moveAcrossStatuses(params: {
    manager: EntityManager;
    userVacancy: UserVacancyRow;
    nextStatus: VacancyStatus;
    targetPosition?: number;
  }): Promise<void> {
    const { manager, userVacancy, nextStatus, targetPosition } = params;

    await manager.query(
      `UPDATE "user_vacancies"
       SET "position" = "position" - 1
       WHERE "user_id" = $1
         AND "status" = $2
         AND "position" > $3`,
      [userVacancy.userId, userVacancy.status, userVacancy.position],
    );

    const targetCount = await manager
      .createQueryBuilder()
      .from('user_vacancies', 'user_vacancy')
      .where('user_vacancy.user_id = :userId', { userId: userVacancy.userId })
      .andWhere('user_vacancy.status = :status', { status: nextStatus })
      .getCount();

    const nextPosition =
      targetPosition === undefined
        ? targetCount
        : Math.min(Math.max(targetPosition, 0), targetCount);

    await manager.query(
      `UPDATE "user_vacancies"
       SET "position" = "position" + 1
       WHERE "user_id" = $1
         AND "status" = $2
         AND "position" >= $3`,
      [userVacancy.userId, nextStatus, nextPosition],
    );

    await manager.query(
      `UPDATE "user_vacancies"
       SET "status" = $1,
           "position" = $2
       WHERE "user_id" = $3
         AND "vacancy_id" = $4`,
      [nextStatus, nextPosition, userVacancy.userId, userVacancy.vacancyId],
    );
  }
}
