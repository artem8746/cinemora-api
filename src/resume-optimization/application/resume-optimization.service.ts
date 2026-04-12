import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResumeAnalysis } from '../resume-analysis.entity';
import {
  ResumeAnalysisStatus,
  type CompletedAnalysisPayload,
} from '../presentation/types/resume-analysis';

@Injectable()
export class ResumeOptimizationService {
  private readonly logger = new Logger(ResumeOptimizationService.name);

  constructor(
    @InjectRepository(ResumeAnalysis)
    private readonly analysisRepository: Repository<ResumeAnalysis>,
  ) {}

  async upsertAnalysis(
    userId: string,
    vacancyId: string,
    sourceResumeId: string,
  ): Promise<ResumeAnalysis> {
    this.logger.log(
      `Upserting analysis for user=${userId}, vacancy=${vacancyId}`,
    );

    const existing = await this.analysisRepository.findOne({
      where: { userId, vacancyId },
    });

    if (existing) {
      existing.status = ResumeAnalysisStatus.PROCESSING;
      existing.sourceResumeId = sourceResumeId;
      existing.initialAtsScore = null;
      existing.initialMatchScore = null;
      existing.keySkillsMatch = null;
      existing.strengths = null;
      existing.improvements = null;
      existing.suggestedContent = null;
      existing.sectionChanges = null;
      existing.errorMessage = null;

      return this.analysisRepository.save(existing);
    }

    const analysis = this.analysisRepository.create({
      userId,
      vacancyId,
      sourceResumeId,
      status: ResumeAnalysisStatus.PROCESSING,
    });

    return this.analysisRepository.save(analysis);
  }

  async completeAnalysis(
    id: string,
    payload: CompletedAnalysisPayload,
  ): Promise<ResumeAnalysis> {
    this.logger.log(`Completing analysis id=${id}`);

    const analysis = await this.analysisRepository.findOneOrFail({
      where: { id },
    });

    analysis.status = ResumeAnalysisStatus.COMPLETED;
    analysis.initialAtsScore = payload.analysis.initialAtsScore;
    analysis.initialMatchScore = payload.analysis.initialMatchScore;
    analysis.keySkillsMatch = payload.analysis.keySkillsMatch;
    analysis.strengths = payload.analysis.strengths;
    analysis.improvements = payload.analysis.improvements;
    analysis.suggestedContent = payload.suggestedContent ?? null;
    analysis.sectionChanges = payload.sectionChanges ?? null;

    return this.analysisRepository.save(analysis);
  }

  async failAnalysis(id: string, errorMessage: string): Promise<void> {
    this.logger.error(`Analysis failed id=${id}: ${errorMessage}`);

    await this.analysisRepository.update(id, {
      status: ResumeAnalysisStatus.FAILED,
      errorMessage,
    });
  }

  async findByUserAndVacancy(
    userId: string,
    vacancyId: string,
  ): Promise<ResumeAnalysis | null> {
    return await this.analysisRepository.findOne({
      where: { userId, vacancyId },
    });
  }

  async updateStatusForUserAndAnalysisId(
    userId: string,
    analysisId: string,
    status: ResumeAnalysisStatus,
  ): Promise<ResumeAnalysis | null> {
    const analysis = await this.analysisRepository.findOne({
      where: { id: analysisId, userId },
    });

    if (!analysis) {
      return null;
    }

    analysis.status = status;
    return await this.analysisRepository.save(analysis);
  }

  async findById(id: string): Promise<ResumeAnalysis | null> {
    return await this.analysisRepository.findOne({ where: { id } });
  }
}
