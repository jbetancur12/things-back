import { convert } from 'html-to-text'
import nodemailer from 'nodemailer'
import path from 'path'
import pug from 'pug'
import { fileURLToPath } from 'url'
import config from '../../config/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { emailFrom, smtp } = config

export default class Email {
  constructor (user, url, otp) {
    this.firstName = user.firstName
    this.to = user.email
    this.from = emailFrom
    this.url = url
    this.otp = otp
  }

  newTransport () {
    // return nodemailer.createTransport(
    //   nodemailerSendgrid({
    //     apiKey: sendridPass
    //   })
    // )
    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      auth: {
        user: smtp.user,
        pass: smtp.pass
      }
    })
  }

  async send (template, subject) {
    // Generate HTML template based on the template string
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url,
      otp: this.otp
    })
    // Create mailOptions
    const mailOptions = {
      from: `Plataforma Smaf <${this.from}>`,
      to: this.to,
      subject,
      text: convert(html),
      html
    }

    try {
      const info = await this.newTransport().sendMail(mailOptions)
      console.log('NODEMAILER: ', nodemailer.getTestMessageUrl(info))
    } catch (error) {
      console.log('🚀 ~ file: email.js:56 ~ Email ~ send ~ error:', error)
    }
    // Send email
  }

  async sendVerificationCode (
    template = 'verificationCode',
    subject = 'Activar Cuenta'
  ) {
    await this.send(template, subject)
  }

  async sendPasswordResetToken () {
    await this.send(
      'resetPassword',
      'Your password reset token (valid for only 10 minutes)'
    )
  }
}
