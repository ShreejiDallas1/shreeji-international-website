# 📧 Email Setup Guide for Verification Codes

## 🚀 Quick Setup (Gmail - Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification**
3. Follow the setup process to enable 2FA

### Step 2: Generate App Password
1. In Google Account Settings, go to **Security**
2. Under **2-Step Verification**, click **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Enter "Shreeji Website" as the name
5. Copy the generated 16-character password

### Step 3: Update Environment Variables
Edit your `.env.local` file:

```env
# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=Shreeji International <noreply@shreejimalta.com>
```

### Step 4: Test the Configuration
1. Restart your development server: `npm run dev`
2. Go to: `http://localhost:3001/test/password-reset`
3. Enter your email address
4. Click **"Test Email Configuration"**
5. Click **"Send Test Email"** to verify delivery
6. Click **"Send Verification Code"** to test the full system

---

## 🎨 Email Template Features

Your verification code emails now include:

### ✨ Professional Design
- **Modern gradient header** with Shreeji International branding
- **Responsive design** that works on all devices
- **Clean typography** using system fonts
- **Professional color scheme** with lime green accents

### 🔐 Security Features
- **Large, prominent verification code** (8 digits)
- **Clear expiry information** (15 minutes)
- **Security warnings** about not sharing the code
- **Professional security tips** section

### 📱 Mobile Optimized
- **Responsive layout** for mobile devices
- **Touch-friendly design** elements
- **Readable fonts** on small screens

### 🏢 Brand Consistency
- **Company branding** throughout the email
- **Professional footer** with company information
- **Consistent messaging** with your website

---

## 🔧 Alternative Email Services

### Option 1: SendGrid (Production Recommended)
```bash
npm install @sendgrid/mail
```

```env
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=Shreeji International <noreply@shreejimalta.com>
```

### Option 2: AWS SES
```bash
npm install aws-sdk
```

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EMAIL_FROM=Shreeji International <noreply@shreejimalta.com>
```

### Option 3: Mailgun
```bash
npm install mailgun-js
```

```env
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
EMAIL_FROM=Shreeji International <noreply@shreejimalta.com>
```

---

## 🧪 Testing Your Setup

### Development Testing
1. **Test Email Configuration**: Verifies SMTP connection
2. **Send Test Email**: Sends a simple test message
3. **Send Verification Code**: Tests the complete verification system

### Production Testing
1. Test with multiple email providers (Gmail, Yahoo, Outlook)
2. Check spam folders
3. Test on mobile devices
4. Verify email deliverability

---

## 📊 Email Analytics (Optional)

Track email performance by adding:

### Open Tracking
```html
<img src="https://your-domain.com/api/track/open?id=unique-id" width="1" height="1" />
```

### Click Tracking
```html
<a href="https://your-domain.com/api/track/click?url=encoded-url">Link</a>
```

---

## 🚨 Troubleshooting

### Common Issues:

#### "Authentication Failed"
- ✅ Check if 2FA is enabled
- ✅ Use App Password, not regular password
- ✅ Verify EMAIL_USER and EMAIL_PASS are correct

#### "Connection Timeout"
- ✅ Check firewall settings
- ✅ Try different EMAIL_PORT (587, 465, 25)
- ✅ Verify EMAIL_HOST is correct

#### "Emails Going to Spam"
- ✅ Set up SPF record: `v=spf1 include:_spf.google.com ~all`
- ✅ Set up DKIM authentication
- ✅ Use a professional FROM address
- ✅ Avoid spam trigger words

#### "Rate Limiting"
- ✅ Gmail: 500 emails/day for free accounts
- ✅ Add delays between emails if needed
- ✅ Consider upgrading to paid service

---

## 🎯 Production Checklist

Before going live:

- [ ] ✅ Email service configured and tested
- [ ] ✅ Professional FROM address set up
- [ ] ✅ SPF/DKIM records configured
- [ ] ✅ Email templates tested on multiple devices
- [ ] ✅ Spam folder testing completed
- [ ] ✅ Rate limiting considered
- [ ] ✅ Error handling implemented
- [ ] ✅ Email analytics set up (optional)
- [ ] ✅ Backup email service configured

---

## 📈 Current Status

### ✅ Implemented Features:
- Professional HTML email templates
- Real email sending with Nodemailer
- Gmail SMTP integration
- Development testing tools
- Error handling and logging
- Mobile-responsive design
- Security best practices

### 🔄 Ready for Production:
Your email system is now production-ready! Just configure your email credentials and you're good to go.

---

## 📞 Support

If you need help setting up email services:

1. **Gmail Issues**: Check Google Account security settings
2. **Other Providers**: Refer to their SMTP documentation
3. **Custom Domain**: Set up MX records with your hosting provider

The system will automatically fall back to development mode if email credentials aren't configured, so you can continue testing even without email setup.