/* eslint-disable no-console */

import * as fs from 'fs';
import * as path from 'path';

interface GitLabVariable {
  key: string;
  value: string;
  masked?: boolean;
  protected?: boolean;
}

async function syncEnvFromGitLab() {
  const gitlabUrl = process.env.GITLAB_URL || 'https://gitlab.com';
  const projectId = process.env.GITLAB_PROJECT_ID;
  const accessToken = process.env.GITLAB_ACCESS_TOKEN;
  const envFile = process.env.ENV_FILE || '.env';

  if (!projectId || !accessToken) {
    console.error(
      '❌ Error: GITLAB_PROJECT_ID and GITLAB_ACCESS_TOKEN must be set',
    );
    process.exit(1);
  }

  try {
    const apiUrl = `${gitlabUrl}/api/v4/projects/${projectId}/variables`;
    const response = await fetch(apiUrl, {
      headers: {
        'PRIVATE-TOKEN': accessToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch variables (HTTP ${response.status})`;

      try {
        const errorJson = JSON.parse(errorText) as { message?: string };
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // ignore
      }

      throw new Error(errorMessage);
    }

    const variables = (await response.json()) as GitLabVariable[];

    if (variables.length === 0) {
      console.warn('⚠️  No variables found in GitLab project');
      process.exit(0);
    }

    const sortedVariables = [...variables].sort((a, b) =>
      a.key.localeCompare(b.key),
    );

    let envContent = `# Auto-generated from GitLab CI/CD Variables\n`;
    envContent += `# Generated at: ${new Date().toISOString()}\n\n`;

    sortedVariables.forEach((variable) => {
      let value = variable.value;
      value = value.replace(/\\/g, '\\\\');
      value = value.replace(/"/g, '\\"');
      value = value.replace(/\n/g, '\\n');
      value = value.replace(/\r/g, '\\r');
      envContent += `${variable.key}=${value}\n`;
    });

    const filePath = path.resolve(process.cwd(), envFile);
    fs.writeFileSync(filePath, envContent, 'utf-8');

    console.log(
      `✅ Created ${envFile} with ${variables.length} variable(s):\n`,
    );
    sortedVariables.forEach((variable) => {
      const masked = variable.masked ? '🔒' : '';
      const protectedFlag = variable.protected ? '🛡️' : '';
      const flags = masked || protectedFlag ? ` ${masked}${protectedFlag}` : '';
      console.log(`   ${variable.key}${flags}`);
    });
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void syncEnvFromGitLab();
