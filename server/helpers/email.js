import { convert } from 'html-to-text'
import nodemailer from 'nodemailer'
import nodemailerSendgrid from 'nodemailer-sendgrid'
import path from 'path'
import pug from 'pug'
import { fileURLToPath } from 'url'
import config from '../../config/config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const { emailFrom, sendridPass } = config
console.log('🚀 ~ file: email.js:12 ~ smtp:', config)

export default class Email {
  constructor (user, url, otp) {
    this.firstName = user.firstName
    this.to = user.email
    this.from = emailFrom
    this.url = url
    this.otp = otp
  }

  newTransport () {
    // if (process.env.NODE_ENV === 'production') {
    //   console.log('Hello')
    // }

    // return nodemailer.createTransport({
    //     service:smtp.service,
    //     host: smtp.host,
    //     port: smtp.port,
    //     secure: smtp.secure,
    //     auth: {
    //         user: smtp.user,
    //         pass: smtp.pass
    //     }
    // });

    // return nodemailer.createTransport({
    // //   service: 'gmail',
    //   host: 'smtp.sendgrid.net',
    //   port: 587,
    // //   secure: false,
    //   auth: {
    //     user: 'apikey',
    //     pass: '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'
    //   }
    // })

    return nodemailer.createTransport(
      nodemailerSendgrid({
        apiKey: sendridPass
      })
    )
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
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html
    }

    try {
      const info = await this.newTransport().sendMail(mailOptions)
      console.log(nodemailer.getTestMessageUrl(info))
    } catch (error) {
      console.log('🚀 ~ file: email.js:56 ~ Email ~ send ~ error:', error)
    }
    // Send email
  }

  async sendVerificationCode (
    template = 'verificationCode',
    subject = 'Your account verification code'
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
