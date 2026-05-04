/* eslint-disable no-console */
/**
 * Starts ngrok for the API port, resolves the public HTTPS URL via the local
 * ngrok agent API, and writes PAYMENT_WEBHOOK_PUBLIC_URL into the chosen .env file
 * as {publicUrl}/api/payments/webhook/plata (matches create-invoice webhook URL shape).
 *
 * Prerequisites: ngrok CLI installed and authenticated (`ngrok config add-authtoken`).
 *
 * Env:
 * - ENV_FILE — target env file (default: .env)
 * - PORT — local API port override (otherwise read from ENV_FILE PORT=, default 3100)
 * - NGROK_AGENT_API — ngrok local API base (default: http://127.0.0.1:4040)
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, type ChildProcess } from 'child_process';

const WEBHOOK_PATH = '/api/payments/webhook/plata';
const POLL_MS = 400;
const POLL_TIMEOUT_MS = 60_000;

function readPortFromEnvFile(filePath: string): number | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const m = content.match(/^PORT=\s*(\d+)/m);
  if (!m || m[1] === undefined) {
    return undefined;
  }
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : undefined;
}

function upsertEnvLine(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(content)) {
    return content.replace(re, line);
  }
  const trimmed = content.replace(/\s*$/, '');
  if (trimmed.length === 0) {
    return `${line}\n`;
  }
  return `${trimmed}\n${line}\n`;
}

interface NgrokTunnelsResponse {
  tunnels?: Array<{ public_url?: string; proto?: string }>;
}

function pickHttpsPublicUrl(
  tunnels: NgrokTunnelsResponse['tunnels'],
): string | undefined {
  if (!tunnels?.length) {
    return undefined;
  }
  const https = tunnels.find((t) => t.proto === 'https' && t.public_url);
  if (https?.public_url) {
    return https.public_url;
  }
  const anyUrl = tunnels.find((t) => t.public_url);
  return anyUrl?.public_url;
}

async function waitForPublicUrl(agentApi: string): Promise<string> {
  const base = agentApi.replace(/\/$/, '');
  const url = `${base}/api/tunnels`;
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as NgrokTunnelsResponse;
        const publicUrl = pickHttpsPublicUrl(data.tunnels);
        if (publicUrl) {
          return publicUrl.replace(/\/$/, '');
        }
      }
    } catch {
      // Agent not ready yet
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  throw new Error(
    `Timed out after ${POLL_TIMEOUT_MS / 1000}s waiting for ngrok tunnel at ${url}`,
  );
}

function terminateChildGracefully(proc: ChildProcess) {
  if (proc.exitCode !== null || proc.signalCode !== null) {
    return;
  }
  proc.kill('SIGTERM');
}

async function main() {
  const envFile =
    process.env.ENV_FILE && process.env.ENV_FILE.length > 0
      ? process.env.ENV_FILE
      : '.env';
  const envPath = path.resolve(process.cwd(), envFile);
  const ngrokAgentApi =
    process.env.NGROK_AGENT_API?.replace(/\/$/, '') ?? 'http://127.0.0.1:4040';

  const portRaw = process.env.PORT;
  const port =
    portRaw !== undefined && portRaw !== ''
      ? parseInt(portRaw, 10)
      : (readPortFromEnvFile(envPath) ?? 3100);

  if (!Number.isFinite(port) || port <= 0) {
    console.error(`Invalid PORT: ${String(portRaw)}`);
    process.exit(1);
  }

  const shutdown = (childProc: ChildProcess) => () => {
    terminateChildGracefully(childProc);
    process.exit(0);
  };

  const child = spawn('ngrok', ['http', String(port)], {
    stdio: 'inherit',
    shell: false,
  });

  process.on('SIGINT', shutdown(child));
  process.on('SIGTERM', shutdown(child));

  child.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'ENOENT') {
      console.error(
        'ngrok executable not found. Install https://ngrok.com/download and ensure it is on PATH.',
      );
    } else {
      console.error('Failed to start ngrok:', err.message);
    }
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal === 'SIGINT' || signal === 'SIGTERM') {
      process.exit(0);
    }
    if (code !== null && code !== 0) {
      console.error(`ngrok exited with code ${String(code)}`);
      process.exit(code);
    }
  });

  try {
    const origin = await waitForPublicUrl(ngrokAgentApi);
    const webhookUrl = `${origin}${WEBHOOK_PATH}`;

    const previous = fs.existsSync(envPath)
      ? fs.readFileSync(envPath, 'utf-8')
      : '';
    const next = upsertEnvLine(
      previous,
      'PAYMENT_WEBHOOK_PUBLIC_URL',
      webhookUrl,
    );
    fs.writeFileSync(envPath, next, 'utf-8');

    console.log('');
    console.log(`Updated ${envFile}: PAYMENT_WEBHOOK_PUBLIC_URL=${webhookUrl}`);
    console.log(
      `(Restart the API if it is already running so it picks up the new value.)`,
    );
    console.log('');
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    terminateChildGracefully(child);
    process.exit(1);
  }
}

void main();
