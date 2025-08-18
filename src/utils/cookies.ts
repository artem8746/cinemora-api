import { CookieOptions } from 'express';
import { FastifyReply } from 'fastify';

const isDevelopment = process.env.NODE_ENV === 'development';

export const setCookie = (
  res: FastifyReply,
  name: string,
  value: string,
  path: string,
  options: CookieOptions = {},
): void => {
  res.setCookie(`${name}`, value, {
    path: path,
    secure: !isDevelopment,
    sameSite: isDevelopment ? false : 'none',
    httpOnly: true,
    ...options,
  });
};
