import dotenv from 'dotenv';
import { configuration } from './configuration';
import { parseEnvironment } from './parseEnvironment';

dotenv.config();

export function getConfiguration() {
  const env = parseEnvironment(process.env);

  return configuration(env);
}

export type Configuration = ReturnType<typeof getConfiguration>;
