import { OtpDetail, PrismaClient } from "@prisma/client"
import { NextFunction, Response } from "express"
import locals from "../../shared/locals.json"
const prisma = new PrismaClient()

export const validateUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    let { username, email } = req.body
    username = username?.toLowerCase()
    email = email?.toLowerCase()
    const user = await prisma.entity.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
    })
    if (user) {
      let message = locals?.defaultError
      if (user?.email == email) {
        message = "Provided email already exists"
      }

      if (user?.username == username) {
        message = "Provided username already exists"
      }

      return res.status(400).json({ status: false, error: message })
    } else {
      return next()
    }
  } catch (error: any) {
    return res.status(400).json({ status: false, error: error?.message })
  }
}

export const validateUserExistance = async (req: any, res: Response, next: NextFunction) => {
  try {
    let { username, email } = req.body
    if (!username && !email) {
      return res.status(400).json({ status: false, error: "Please provide username or email" })
    }
    if (username) {
      username = username?.toLowerCase()
    } else {
      email = email?.toLowerCase()
    } 
    const user = await prisma.entity.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
    })

    if (user) {
      return next()
    } else {
      return res.status(400).json({ status: false, error: `Invalid ${username ? "username" : "email"}` })
    }
  } catch (error: any) {
    return res.status(400).json({ status: false, error: error?.message })
  }
}

export const saveOtpDetails = async (user_id: number, otp: string): Promise<void> => {
  await prisma.otpDetail.create({
    data: {
      otp,
      user_id,
    },
  })
}

export const updateOtpDetails = async (user_id: number, otp: string): Promise<void> => {
  const otpDetail = await prisma.otpDetail.findFirst({
    where: {
      user_id,
      otp,
      is_valid: true,
    },
  })
  if (otpDetail) {
    await prisma.otpDetail.update({
      where: {
        id: otpDetail.id,
      },
      data: {
        is_valid: false,
      },
    })
  }
}

export const getOtpDetails = async (user_id: number): Promise<OtpDetail | null> => {
  return prisma.otpDetail.findFirst({
    where: {
      user_id,
      is_valid: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  })
}
