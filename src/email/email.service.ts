import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor(
    @Inject(ConfigService) private configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async sendEmail(
    recipient: string,
    dynamicLink: string,
    type: 'confirm' | 'reset',
  ): Promise<void> {
    const { subject, text, html } = this.getEmailTemplate(type, dynamicLink);

    const mailOptions = {
      from: this.configService.getOrThrow<string>('EMAIL_USER'),
      to: recipient,
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(mailOptions);
      this.logger.log(`${type} email sent to: ${recipient}`, EmailService.name);
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
