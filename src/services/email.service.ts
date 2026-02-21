export interface IEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: IEmailAttachment[];
}

export interface IEmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface IEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  send(options: IEmailOptions): Promise<IEmailResponse>;
}

export type EmailProviderType = 'smtp' | 'sendgrid' | 'console';

export interface EmailConfig {
  provider: EmailProviderType;
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
  };
  from: string;
  fromName?: string;
}

class ConsoleEmailProvider implements IEmailProvider {
  async send(options: IEmailOptions): Promise<IEmailResponse> {
    console.log('========== EMAIL ==========');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Body:', options.text || options.html);
    console.log('===========================');
    return { success: true, messageId: `console-${Date.now()}` };
  }
}

class EmailService {
  private provider: IEmailProvider;
  private from: string;
  private fromName: string;

  constructor() {
    const config = this.getEmailConfig();
    this.provider = this.createProvider(config);
    this.from = config.from;
    this.fromName = config.fromName || 'SaaS App';
  }

  private getEmailConfig(): EmailConfig {
    return {
      provider: (process.env.EMAIL_PROVIDER as EmailProviderType) || 'console',
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      fromName: process.env.EMAIL_FROM_NAME || 'SaaS App',
      smtp: process.env.SMTP_HOST ? {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      } : undefined,
      sendgrid: process.env.SENDGRID_API_KEY ? {
        apiKey: process.env.SENDGRID_API_KEY,
      } : undefined,
    };
  }

  private createProvider(config: EmailConfig): IEmailProvider {
    switch (config.provider) {
      case 'smtp':
        return new ConsoleEmailProvider();
      case 'sendgrid':
        return new ConsoleEmailProvider();
      case 'console':
      default:
        return new ConsoleEmailProvider();
    }
  }

  async send(options: IEmailOptions): Promise<IEmailResponse> {
    try {
      const emailOptions: IEmailOptions = {
        ...options,
        from: options.from || this.from,
      };

      const result = await this.provider.send(emailOptions);

      if (!result.success) {
        console.error('Email sending failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<IEmailResponse> {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    return this.send({
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Hello ${name},</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      `,
      text: `Hello ${name},\n\nPlease verify your email address by visiting: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<IEmailResponse> {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    return this.send({
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Hello ${name},</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Or copy and paste this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Hello ${name},\n\nYou requested a password reset. Visit: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<IEmailResponse> {
    return this.send({
      to: email,
      subject: 'Welcome to our SaaS App',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining our SaaS App. We're excited to have you on board!</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      `,
      text: `Welcome ${name}!\n\nThank you for joining our SaaS App. We're excited to have you on board!`,
    });
  }
}

export const emailService = new EmailService();
