import jwt from "jsonwebtoken"
const secretKey: string = process.env.JWT_SECRET || ""
const tokenExpiration = "6h"

export const signInToken = (payload: any): string => {
  const token = jwt.sign(payload, secretKey, { expiresIn: tokenExpiration })

  return token
}

export const verifyToken = (token: string): any => {
  const data = jwt.verify(token, secretKey)
  return data || ""
}
