import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Payment } from '../payment.entity';
import { PaymentPlan } from '../payment-plan.entity';
import { PaymentSettings } from '../payment-settings.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(PaymentPlan)
    private readonly plansRepository: Repository<PaymentPlan>,
    @InjectRepository(PaymentSettings)
    private readonly settingsRepository: Repository<PaymentSettings>,
  ) {}

  create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentsRepository.create(data);
    return this.paymentsRepository.save(payment);
  }

  findById(id: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({ where: { id } });
  }

  async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: Payment[]; total: number }> {
    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.userId = :userId', { userId })
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async update(id: string, data: Partial<Payment>): Promise<void> {
    await this.paymentsRepository.update(
      id,
      data as QueryDeepPartialEntity<Payment>,
    );
  }

  findActivePlans(): Promise<PaymentPlan[]> {
    return this.plansRepository.find({ where: { isActive: true } });
  }

  findPlanById(id: string): Promise<PaymentPlan | null> {
    return this.plansRepository.findOne({ where: { id, isActive: true } });
  }

  async getSettings(): Promise<PaymentSettings> {
    const settings = await this.settingsRepository.findOne({
      where: { id: true },
    });
    if (!settings) {
      throw new InternalServerErrorException(
        'Payment settings are not configured',
      );
    }
    return settings;
  }
}
