import { PrismaClient } from "@prisma/client"
import { logger } from "./shared/logger"
import createServer from "./app"

const port = process.env.PORT

const app = createServer()
const prisma: PrismaClient = new PrismaClient()

async function checkDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect()
    logger.info("Connected to the database")
  } catch (error) {
    logger.error(`Error checkDatabaseConnection:${(error as any)?.message}`)
  } finally {
    await prisma.$disconnect()
  }
}

try {
  app.listen(port, (): void => {
    logger.info(`Connected successfully on port ${port}`)
    checkDatabaseConnection()
  })
} catch (error) {
  logger.error(`Error occured: ${(error as any).message}`)
}
