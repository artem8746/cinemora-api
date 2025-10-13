import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { Request } from 'express';

export interface AuthenthicatedRequest extends Request {
  user: JwtSummaryDto;
}
