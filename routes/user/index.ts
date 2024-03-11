import express from "express"
import userController from "../../controllers/user"
import { requestValidator } from "../../middleware/index"
import entitySchema from "../../utils/schemas/entity"
import loginSchema from "../../utils/schemas/login"
import forgetSchema from "../../utils/schemas/forget_password"
import setPassSchema from "../../utils/schemas/set_password"
import { validateUser, validateUserExistance } from "../../utils/services/user"
const router = express.Router()

router.post("/register", requestValidator(entitySchema, false), validateUser, userController.register)
router.post("/login", requestValidator(loginSchema, false), validateUserExistance, userController.login)
router.post(
  "/forget-password",
  requestValidator(forgetSchema, false),
  validateUserExistance,
  userController.forgetPassword,
)
router.post("/set-password", requestValidator(setPassSchema, false), validateUserExistance, userController.setPassword)

export default router
