import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  redirect(url: string, status: number, context: ExecutionContext) {
    const reply = context.switchToHttp().getResponse<FastifyReply>();
    reply.redirect(url, status);
  }
}
