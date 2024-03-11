import { Response, NextFunction } from "express"
import Ajv, { ValidateFunction } from "ajv"
import addFormats from "ajv-formats"
import addErrors from "ajv-errors"
import { verifyToken } from "../shared/jwt"
import { roles } from "../utils/constants"

export const ajv_validate = (req: any, schema: any, source: string) => {
  const ajv = new Ajv({
    allErrors: true,
    strict: "log",
  })
  addFormats(ajv)
  addErrors(ajv)
  const validate: ValidateFunction = ajv.compile(schema)
  return { valid: validate(req[source]), validate }
}

export const requestValidator = (schema: any, is_ondc_req = true, source = "body") => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const { valid, validate } = ajv_validate(req, schema, source)

      if (!valid) {
        let result = {}
        if (is_ondc_req) {
          const errors =
            validate.errors?.map((error: any) => ({
              message: error?.message,
              dataPath: error.schemaPath,
            })) || []
          result = { context: req.body.context, message: { ack: { status: "NACK" } }, error: errors }
        } else {
          const message = validate.errors?.map((error: any) => error?.message)?.join(", ")
          result = { status: false, error: message }
        }

        return res.status(400).json(result)
      } else {
        return next()
      }
    } catch (error: any) {
      let result = {}
      if (is_ondc_req) {
        result = { context: req.body.context, message: { ack: { status: "NACK" } }, error: error?.message }
      } else {
        result = { status: false, error: error?.message }
      }

      return res.status(400).json(result)
    }
  }
}

/**
 *  INFO: Middleware function for route authentication
 * */
export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")

  if (!token) {
    return res.status(401).json({ status: false, message: "Unauthorized - Token missing" })
  }

  try {
    const user = verifyToken(token)
    if (user) {
      req.user = user
      return next()
    } else {
      return res.status(403).json({ status: false, message: "Forbidden - Invalid token" })
    }
  } catch (err) {
    return res.status(403).json({ status: false, message: "Forbidden - Invalid token" })
  }
}

/**
 *  INFO: Middleware function for route authentication
 * */
export const authenticateAdminToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")

  if (!token) {
    return res.status(401).json({ status: false, message: "Unauthorized - Token missing" })
  }

  try {
    const user = verifyToken(token)
    if (user) {
      if (user.role == roles.ADMIN) {
        req.user = user
        return next()
      } else {
        return res
          .status(403)
          .json({ status: false, message: "Forbidden - Required admin access to perform this action" })
      }
    } else {
      return res.status(403).json({ status: false, message: "Forbidden - Invalid token" })
    }
  } catch (err) {
    return res.status(403).json({ status: false, message: "Forbidden - Invalid token" })
  }
}
