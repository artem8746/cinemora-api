import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';

export class GenerateTokensCommand {
  constructor(public readonly payload: JwtSummaryDto) {}
}
