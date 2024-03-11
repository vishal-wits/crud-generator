import { Response, Request } from "express"
import { PrismaClient } from "@prisma/client"
import wrap from "../../shared/async-handler"
import { generateRandomPassword } from "../../shared/utils"
import { comparePassword, hashPassword } from "../../shared/bcrypt"
import { sendForgetPasswordEmail, sendWelcomeEmail } from "../../shared/nodemailer"
import HttpException from "../../shared/http-exception"
import { signInToken } from "../../shared/jwt"
import { getOtpDetails, saveOtpDetails, updateOtpDetails } from "../../utils/services/user"
// import { constants } from "../../utils/constants"
const prisma = new PrismaClient()

const controller = {
  /**
   * INFO: Controller to register user
   */
  register: wrap(async (req: Request, res: Response): Promise<void | Response> => {
    const payload = req.body
    payload.username = payload.username?.toLowerCase()
    payload.email = payload.email?.toLowerCase()
    // Password handling
    const generatedPassword = payload.password ? payload.password : generateRandomPassword()
    const hashedPassword = await hashPassword(generatedPassword)

    const newUser = (await prisma.entity.create({
      data: {
        ...payload,
        password: hashedPassword,
      },
    })) as any

    // Send email with the generated password
    await sendWelcomeEmail(newUser.email, newUser.first_name)
    delete newUser?.password
    return res.status(201).json({ status: true, message: "User register successfully", data: newUser })
  }),

  /**
   * INFO: Controller to login user
   */
  login: wrap(async (req: Request, res: Response): Promise<void | Response> => {
    let { username, email, password } = req.body
    let where: any = {}
    if (username) {
      username = username?.toLowerCase()
      where = { ...where, username }
    } else {
      email = email?.toLowerCase()
      where = { ...where, email }
    } 
    const userDetails = (await prisma.entity.findFirst({ where })) as any
    const isValidPassword = await comparePassword(password, userDetails?.password)
    if (!isValidPassword) {
      throw new HttpException("Invalid password", 400)
    }

    delete userDetails?.password
    const token = signInToken(userDetails)
    return res
      .status(200)
      .json({ status: true, message: "User login successfully", data: { user: userDetails, token } })
  }),

  /**
   * INFO: Controller to forget password of user
   */
  forgetPassword: wrap(async (req: Request, res: Response): Promise<void | Response> => {
    const { username, email } = req.body
    let where: any = {}
    if (username) where = { ...where, username }
    else where = { ...where, email }
    const userDetails = (await prisma.entity.findFirst({ where })) as any
    const otp = await sendForgetPasswordEmail(userDetails?.email, userDetails?.first_name)
    await saveOtpDetails(userDetails?.id, otp)
    return res.status(200).json({ status: true, message: "We have sent the otp on email to set the password" })
  }),

  /**
   * INFO: Controller to set password of user
   */
  setPassword: wrap(async (req: Request, res: Response): Promise<void | Response> => {
    const { username, email, otp, password } = req.body
    let where: any = {}
    if (username) where = { ...where, username }
    else where = { ...where, email }
    const userDetails = (await prisma.entity.findFirst({ where })) as any
    const otpDetails = await getOtpDetails(userDetails?.id)
    let is_valid = false
    if (otpDetails && otpDetails?.otp) {
      is_valid = otpDetails.is_valid && new Date().getTime() - otpDetails.timestamp.getTime() < 5 * 60 * 1000
    } else {
      throw new HttpException("Invalid otp")
    }

    if (is_valid) {
      const hashedPassword = await hashPassword(password)
      await prisma.entity.update({
        where: { id: userDetails?.id } as any,
        data: {
          password: hashedPassword,
        },
      })
      await updateOtpDetails(userDetails?.id, otp)
      return res.status(200).json({ status: true, message: "Password set successfully!" })
    } else {
      throw new HttpException("Otp expired")
    }
  }),
}

export default controller
