// Professional email templates for verification codes

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailTemplates {
  static getVerificationCodeTemplate(code: string, email: string): EmailTemplate {
    const currentYear = new Date().getFullYear();
    
    return {
      subject: 'Your Password Reset Verification Code',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Verification Code</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: #f0f9ff;
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .code-container {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border: 2px dashed #84cc16;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .code-label {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .verification-code {
            font-size: 36px;
            font-weight: 800;
            color: #1f2937;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .code-note {
            font-size: 14px;
            color: #6b7280;
            margin-top: 15px;
        }
        
        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .warning-box h3 {
            color: #92400e;
            font-size: 16px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        
        .warning-box p {
            color: #a16207;
            font-size: 14px;
            line-height: 1.6;
        }
        
        .security-tips {
            background-color: #f0f9ff;
            border: 1px solid #e0f2fe;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        
        .security-tips h3 {
            color: #0c4a6e;
            font-size: 16px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        
        .security-tips ul {
            list-style: none;
            padding: 0;
        }
        
        .security-tips li {
            color: #0369a1;
            font-size: 14px;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
        }
        
        .security-tips li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #16a34a;
            font-weight: bold;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .company-info {
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.5;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(132, 204, 22, 0.3);
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .verification-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
            
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Secure verification for your account</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello there! 👋
            </div>
            
            <div class="message">
                We received a request to reset the password for your Shreeji International account associated with <strong>${email}</strong>.
            </div>
            
            <div class="code-container">
                <div class="code-label">Your Verification Code</div>
                <div class="verification-code">${code}</div>
                <div class="code-note">
                    Enter this code on our website to continue with your password reset.
                    <br><strong>This code expires in 15 minutes.</strong>
                </div>
            </div>
            
            <div class="message">
                To complete your password reset:
                <ol style="margin: 15px 0; padding-left: 20px; color: #4b5563;">
                    <li>Return to the Shreeji International website</li>
                    <li>Enter the 8-digit code above</li>
                    <li>Create your new secure password</li>
                </ol>
            </div>
            
            <div class="warning-box">
                <h3>⚠️ Important Security Notice</h3>
                <p>
                    If you didn't request this password reset, please ignore this email. 
                    Your account remains secure and no changes will be made.
                </p>
            </div>
            
            <div class="security-tips">
                <h3>🛡️ Security Tips</h3>
                <ul>
                    <li>Never share this verification code with anyone</li>
                    <li>Our team will never ask for your verification code</li>
                    <li>This code is only valid for 15 minutes</li>
                    <li>Use a strong, unique password for your account</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>
                <strong>Shreeji International</strong><br>
                Your trusted partner for authentic Indian groceries
            </p>
            <div class="company-info">
                Dallas, Texas | www.shreejimalta.com<br>
                © ${currentYear} Shreeji International. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`,
      text: `
SHREEJI INTERNATIONAL - PASSWORD RESET VERIFICATION

Hello!

We received a request to reset the password for your Shreeji International account (${email}).

Your verification code is: ${code}

This code expires in 15 minutes.

To complete your password reset:
1. Return to the Shreeji International website
2. Enter the 8-digit code above
3. Create your new secure password

SECURITY NOTICE:
If you didn't request this password reset, please ignore this email. Your account remains secure.

Never share this verification code with anyone. Our team will never ask for your verification code.

---
Shreeji International
Dallas, Texas
www.shreejimalta.com
© ${currentYear} Shreeji International. All rights reserved.
      `.trim()
    };
  }
}