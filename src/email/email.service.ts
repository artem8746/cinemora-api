import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet, { Client } from 'node-mailjet';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailService {
  private readonly mailjet: Client;

  constructor(
    private configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.mailjet = Mailjet.apiConnect(
      this.configService.getOrThrow('email.mailjetApiKey'),
      this.configService.getOrThrow('email.mailjetSecretKey'),
    );
  }

  async sendEmail(
    recipient: string,
    dynamicLink: string,
    type: 'confirm' | 'reset',
  ): Promise<void> {
    const { subject, text, html } = this.getEmailTemplate(type, dynamicLink);

    const emailData = {
      Messages: [
        {
          From: {
            Email: this.configService.getOrThrow('email.emailUser'),
            Name: 'Cinemora Platform',
          },
          To: [
            {
              Email: recipient,
            },
          ],
          Subject: subject,
          TextPart: text,
          HTMLPart: html,
        },
      ],
    };

    try {
      await this.mailjet.post('send', { version: 'v3.1' }).request(emailData);
      this.logger.info(
        `${type} email sent to: ${recipient}`,
        EmailService.name,
      );
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }

  private getEmailTemplate(
    type: 'confirm' | 'reset',
    link: string,
  ): {
    subject: string;
    text: string;
    html: string;
  } {
    switch (type) {
      case 'confirm':
        return {
          subject: 'Confirm your email address',
          text: `Please confirm your email by clicking the following link: ${link}`,
          html: `<p>Please confirm your email by clicking <a href="${link}" target="_blank">here</a>.</p>`,
        };

      case 'reset':
        return {
          subject: 'Reset your password',
          text: `You requested to reset your password. Click the link: ${link}`,
          html: `<p>You requested to reset your password. Click <a href="${link}" target="_blank">here</a> to reset it.</p>`,
        };

      default:
        return {
          subject: 'Notification from Your App',
          text: `Click the link: ${link}`,
          html: `<p>Click <a href="${link}" target="_blank">here</a>.</p>`,
        };
    }
  }
}
