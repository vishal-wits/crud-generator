import nodemailer from "nodemailer"
import handlebars from "handlebars"
import { google } from "googleapis"
import fs from "fs"
import HttpException from "./http-exception"
import path from "path"
import { generateOTP } from "./utils"
const OAuth2 = google.auth.OAuth2
const adminEmail = process.env.ADMIN_EMAIL || ""

const createTransporter = async (): Promise<any> => {
  try {
    const oauth2Client = new OAuth2(
      process.env.NODEMAILER_CLIENT_ID,
      process.env.NODEMAILER_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground",
    )
    oauth2Client.setCredentials({
      refresh_token: process.env.NODEMAILER_REFRESH_TOKEN,
    })

    const accessToken = await oauth2Client.getAccessToken()

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.NODEMAILER_AUTH_USER,
        accessToken,
        clientId: process.env.NODEMAILER_CLIENT_ID,
        clientSecret: process.env.NODEMAILER_CLIENT_SECRET,
        refreshToken: process.env.NODEMAILER_REFRESH_TOKEN,
      },
    } as any)
    return transporter
  } catch (error: any) {
    throw new HttpException(error?.message)
  }
}

export const sendWelcomeEmail = async (sendTo: string, firstName: string): Promise<void> => {
  try {
    const templateSource = fs.readFileSync(path.join(__dirname, "../views/welcome_email_template.hbs"), "utf8")
    const template = handlebars.compile(templateSource)
    const emailContent = template({ firstName })
    let emailTransporter = await createTransporter()
    // Send the email
    await emailTransporter.sendMail({
      from: process.env.NODEMAILER_EMAIL_FROM,
      to: sendTo,
      subject: `Welcome to crud_generator ${firstName}!`,
      html: emailContent,
    })
  } catch (error: any) {
    throw new HttpException(error?.message)
  }
}

export const sendForgetPasswordEmail = async (sendTo: string, firstName: string): Promise<string> => {
  try {
    const templateSource = fs.readFileSync(path.join(__dirname, "../views/forget_password_template.hbs"), "utf8")
    const template = handlebars.compile(templateSource)
    const otp = generateOTP()
    const emailContent = template({ firstName, otp })
    let emailTransporter = await createTransporter()
    // Send the email
    await emailTransporter.sendMail({
      from: process.env.NODEMAILER_EMAIL_FROM,
      to: sendTo,
      subject: `Important: Reset Your crud_generator Password!`,
      html: emailContent,
    })
    return otp
  } catch (error: any) {
    throw new HttpException(error?.message)
  }
}

export const settlementFailureEmail = async (
  transaction_id: string,
  bap_id: string,
  bap_uri: string,
  number_of_retry: number,
  created_at: Date,
  last_retry_at: Date,
  sendTo: string = adminEmail,
): Promise<void> => {
  try {
    const templateSource = fs.readFileSync(path.join(__dirname, "../views/settlement_failure_template.hbs"), "utf8")
    const template = handlebars.compile(templateSource)
    const emailContent = template({ transaction_id, bap_id, bap_uri, number_of_retry, created_at, last_retry_at })
    let emailTransporter = await createTransporter()
    // Send the email
    await emailTransporter.sendMail({
      from: process.env.NODEMAILER_EMAIL_FROM,
      to: sendTo,
      subject: `Settlement Failure Report for transaction id - ${transaction_id}!`,
      html: emailContent,
    })
  } catch (error: any) {
    throw new HttpException(error?.message)
  }
}
