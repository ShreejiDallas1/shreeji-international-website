// Real email sending service using Nodemailer
import nodemailer from 'nodemailer';
import { EmailTemplates } from './email-templates';

export class EmailSender {
  private static transporter: nodemailer.Transporter | null = null;

  // Initialize the email transporter
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      // Check if we're in development and don't have real email credentials
      const isDevelopment = process.env.NODE_ENV === 'development';
      const hasEmailConfig = process.env.EMAIL_USER && 
                            process.env.EMAIL_PASS && 
                            process.env.EMAIL_USER !== 'your-email@gmail.com';

      if (isDevelopment && !hasEmailConfig) {
        // Use console logging for development testing
        console.log('📧 Development Mode: Email credentials not configured');
        console.log('📧 Emails will be logged to console instead of being sent');
        
        // Create a test transporter that doesn't actually send emails
        this.transporter = nodemailer.createTransport({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        });
      } else {
        // Use real SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log('📧 Using configured SMTP server');
      }
    }
    return this.transporter!;
  }

  // Send verification code email
  static async sendVerificationCode(email: string, code: string): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    try {
      const transporter = this.getTransporter();
      const template = EmailTemplates.getVerificationCodeTemplate(code, email);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Shreeji International <noreply@shreejimalta.com>',
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
        // Add some email headers for better deliverability
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high'
        }
      };

      // Check if we're in development mode without real email config
      const isDevelopment = process.env.NODE_ENV === 'development';
      const hasEmailConfig = process.env.EMAIL_USER && 
                            process.env.EMAIL_PASS && 
                            process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                            process.env.EMAIL_USER !== 'your-actual-gmail@gmail.com';

      if (isDevelopment && !hasEmailConfig) {
        // Development mode: Just log the email content
        console.log('📧 [DEVELOPMENT MODE] Email would be sent to:', email);
        console.log('📧 [DEVELOPMENT MODE] Verification Code:', code);
        console.log('📧 [DEVELOPMENT MODE] Email Subject:', template.subject);
        console.log('📧 [DEVELOPMENT MODE] Email Content:');
        console.log(template.text);
        console.log('📧 [DEVELOPMENT MODE] To send real emails, update EMAIL_USER and EMAIL_PASS in .env.local');
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now()
        };
      }

      console.log(`📧 Sending verification code email to: ${email}`);
      
      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error: any) {
      console.error('❌ Email sending failed:', error);
      
      // Provide specific error messages
      let errorMessage = 'Failed to send email';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Email authentication failed. Please check your email credentials.';
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Failed to connect to email server. Please check your internet connection.';
      } else if (error.code === 'EMESSAGE') {
        errorMessage = 'Invalid email message. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Test email configuration
  static async testEmailConfig(): Promise<{
    success: boolean;
    error?: string;
    info?: any;
  }> {
    try {
      const transporter = this.getTransporter();
      
      console.log('🧪 Testing email configuration...');
      
      // Verify the connection
      const verified = await transporter.verify();
      
      if (verified) {
        console.log('✅ Email server connection verified!');
        return {
          success: true,
          info: {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            secure: false
          }
        };
      } else {
        return {
          success: false,
          error: 'Email server verification failed'
        };
      }
    } catch (error: any) {
      console.error('❌ Email configuration test failed:', error);
      return {
        success: false,
        error: error.message || 'Email configuration test failed'
      };
    }
  }

  // Send test email
  static async sendTestEmail(toEmail: string): Promise<{
    success: boolean;
    error?: string;
    messageId?: string;
  }> {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Shreeji International <noreply@shreejimalta.com>',
        to: toEmail,
        subject: '🧪 Test Email from Shreeji International',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #84cc16;">✅ Email Configuration Test</h2>
            <p>This is a test email to verify that your email configuration is working correctly.</p>
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Sent at: ${new Date().toLocaleString()}</li>
                <li>From: ${process.env.EMAIL_FROM}</li>
                <li>To: ${toEmail}</li>
                <li>Server: ${process.env.EMAIL_HOST}</li>
              </ul>
            </div>
            <p>If you received this email, your email service is configured correctly! 🎉</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Shreeji International<br>
              Dallas, Texas
            </p>
          </div>
        `,
        text: `
EMAIL CONFIGURATION TEST

This is a test email to verify that your email configuration is working correctly.

Test Details:
- Sent at: ${new Date().toLocaleString()}
- From: ${process.env.EMAIL_FROM}
- To: ${toEmail}
- Server: ${process.env.EMAIL_HOST}

If you received this email, your email service is configured correctly!

---
Shreeji International
Dallas, Texas
        `.trim()
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error: any) {
      console.error('❌ Test email failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send test email'
      };
    }
  }
}

export default EmailSender;