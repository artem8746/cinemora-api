import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';

export class ResetPasswordTokenCommand {
  constructor(public readonly payload: JwtSummaryDto) {}
}
