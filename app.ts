import "dotenv/config"
import express, { Application, Request, Response, NextFunction } from "express"
import helmet from "helmet"
import userRoutes from "./routes/user"
import HttpException, { sanitize } from "./shared/http-exception"
import locals from "./shared/locals.json"

const createServer = (): express.Application => {
  const app: Application = express()
  app.use(helmet())
  // Body parsing Middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use("/user", userRoutes)

  // eslint-disable-next-line no-unused-vars
  app.get("/", async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: "The server is running",
    })
  })

  // eslint-disable-next-line no-unused-vars
  app.get("/health", async (_req: Request, res: Response): Promise<Response> => {
    return res.status(200).send({
      success: true,
      message: "The server is running",
    })
  })

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  app.use((_req: any, _res: any) => {
    throw new HttpException(locals.notFound, 404)
  })

  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    err = sanitize(err)
    return res.status(err.status).json({ status: false, message: err?.message })
  })
  return app
}

export default createServer
