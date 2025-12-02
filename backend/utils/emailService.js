import nodemailer from 'nodemailer'
import logger from './logger.js'

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: `"Damage Display System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code - Damage Display System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Damage Display System</h2>
          <h3>Your One-Time Password</h3>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 36px; letter-spacing: 8px; color: #1e293b;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #64748b; font-size: 14px;">
            If you didn't request this OTP, please ignore this email.
          </p>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      logger.info(`OTP email sent to ${email}`)
      return true
    } catch (error) {
      logger.error('Email send error:', error)
      return false
    }
  }

  async sendDamageReportConfirmation(email, reportId) {
    const mailOptions = {
      from: `"Damage Display System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Damage Report Submitted - Damage Display System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Damage Report Submitted Successfully</h2>
          <p>Your damage report has been received and is being processed.</p>
          <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Report ID:</strong> ${reportId}</p>
            <p><strong>Status:</strong> Under Review</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Thank you for helping us track disaster damages.</p>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      logger.error('Confirmation email error:', error)
      return false
    }
  }
}

export const emailService = new EmailService()