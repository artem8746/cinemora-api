import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  async sendEmail(
    recipient: string,
    dynamicLink: string,
    type: 'confirm' | 'reset' | 'activation',
  ): Promise<void> {
    const { subject, text, html } = this.getEmailTemplate(type, dynamicLink);

    const mailOptions = {
      from: this.configService.getOrThrow('email.emailUser'),
      to: recipient,
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(mailOptions);
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
    type: 'confirm' | 'reset' | 'activation',
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

      case 'activation':
        return {
          subject: 'Activate your account',
          text: `Welcome! Please activate your account by clicking the following link: ${link}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to Cinemora!</h2>
              <p>Thank you for registering. To complete your registration and activate your account, please click the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Activate Account</a>
              </div>
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${link}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
          `,
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
