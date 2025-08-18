import { CreateToken } from '@/auth/dto/create-token.dto';

export class RegisterTokenCommand {
  constructor(public readonly createTokenPayload: CreateToken) {}
}
