import { GoogleUser } from '@/auth/strategies/google.strategy';

export class GoogleAuthCommand {
  constructor(public readonly user: GoogleUser) {}
}
