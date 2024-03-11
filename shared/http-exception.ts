import { Prisma } from "@prisma/client"
import locals from "./locals.json"
import { logger } from "./logger"

export default class HttpException extends Error {
  status: number = 500

  message: string = locals.errorInternal

  constructor(message: any = locals.errorInternal, status: number = 500) {
    super()

    this.status = status
    if (typeof message == "string") {
      this.message = message
    } else {
      this.message = prismaErrorValidator(message)
    }
  }
}

export class HttpDefaultException extends Error {
  status: number = 400

  message: string = locals.defaultError

  constructor(message: string = locals.defaultError, status: number = 400) {
    super()

    this.status = status

    this.message = message
  }
}

export function sanitize(error: any): HttpException {
  switch (true) {
    case error.status === 404:
      return error

    case error instanceof HttpException:
      return error

    default:
      logger.error("error sanitize: ", error)
      // eslint-disable-next-line no-case-declarations
      const message = prismaErrorValidator(error?.message)
      return new HttpDefaultException(message)
  }
}

const prismaErrorValidator = (error: any): string => {
  let errorMessage: string = error?.message || "Something went wrong!!!!"
  if (Prisma && error instanceof Prisma?.PrismaClientKnownRequestError) {
    switch (error?.code) {
      case "P1000":
        errorMessage = "Authentication failed against database server"
        break
      case "P1001":
        errorMessage = "Can't reach database server, Please make sure your database server is running"
        break
      case "P1002":
        errorMessage = "The database server was reached but timed out. Please try again"
        break
      case "P1003":
        errorMessage = "Some database does not exist where you are performing this action"
        break
      case "P1008":
        errorMessage = "Database operations timed out"
        break
      case "P1009":
        errorMessage = "Requested already exists on the database server"
        break
      case "P1010":
        errorMessage = "Requested user doesn't have database access"
        break
      case "P1011":
        errorMessage = "Error opening a TLS connection"
        break
      case "P1012":
        errorMessage =
          "Error in prisma upgrade, See the prisma upgradation from https://www.prisma.io/docs/guides/upgrade-guides/upgrading-versions/upgrading-to-prisma-4#upgrade-your-prisma-schema"
        break
      case "P1013":
        errorMessage = "The provided database string is invalid."
        break
      case "P1014":
        errorMessage = "There is some issue in requested schema."
        break
      case "P1015":
        errorMessage = "Your Prisma schema is using features that are not supported for the version of the database."
        break
      case "P1016":
        errorMessage = "Your raw query had an incorrect number of parameters."
        break
      case "P1017":
        errorMessage = "Server has closed the connection."
        break
      case "P2000":
        errorMessage =
          "The provided value for the column is too long for the column's type " + getPrismaCollection(error?.message)
        break
      case "P2001":
        errorMessage =
          "The record searched for, in the where condition does not exists" + getPrismaCollection(error?.message)
        break
      case "P2002":
        errorMessage = "Unique constraint failed " + getPrismaCollection(error?.message)
        break
      case "P2003":
        errorMessage = "Foreign key constraint failed " + getPrismaCollection(error?.message)
        break
      case "P2004":
        errorMessage = "A constraint failed " + getPrismaCollection(error?.message)
        break
      case "P2005":
        errorMessage = "The Value invalid for a field's type " + getPrismaCollection(error?.message)
        break
      case "P2006":
        errorMessage = "Provided value is not valid for a field's " + getPrismaCollection(error?.message)
        break
      case "P2007":
        errorMessage = "Data validation error " + getPrismaCollection(error?.message)
        break
      case "P2008":
        errorMessage = "Failed to parse the query " + getPrismaCollection(error?.message)
        break
      case "P2009":
        errorMessage = "Failed to validate the query " + getPrismaCollection(error?.message)
        break
      case "P2010":
        errorMessage = "Raw query failed " + getPrismaCollection(error?.message)
        break
      case "P2011":
        errorMessage = "Null constraint violation " + getPrismaCollection(error?.message)
        break
      case "P2012":
        errorMessage = "Missing a required value " + getPrismaCollection(error?.message)
        break
      case "P2013":
        errorMessage = "Missing the required argument " + getPrismaCollection(error?.message)
        break
      case "P2014":
        errorMessage =
          "The change you are trying to make would violate the required relation " + getPrismaCollection(error?.message)
        break
      case "P2015":
        errorMessage = "A related record could not be found " + getPrismaCollection(error?.message)
        break
      case "P2016":
        errorMessage = "Query interpretation error " + getPrismaCollection(error?.message)
        break
      case "P2017":
        errorMessage = "The records for relation models are not connected " + getPrismaCollection(error?.message)
        break
      case "P2018":
        errorMessage = "The required connected records were not found " + getPrismaCollection(error?.message)
        break
      case "P2019":
        errorMessage = "Input error " + getPrismaCollection(error?.message)
        break
      case "P2020":
        errorMessage = "Value out of range for the type " + getPrismaCollection(error?.message)
        break
      case "P2021":
        errorMessage = "The table does not exist " + getPrismaCollection(error?.message)
        break
      case "P2022":
        errorMessage = "The column does not exist " + getPrismaCollection(error?.message)
        break
      case "P2023":
        errorMessage = "Inconsistent column data " + getPrismaCollection(error?.message)
        break
      case "P2024":
        errorMessage = "Timed out fetching a new connection from the connection pool."
        break
      case "P2025":
        errorMessage =
          "An operation failed because it depends on one or more records that were required but not found " +
          getPrismaCollection(error?.message)
        break
      case "P2026":
        errorMessage =
          "The current database provider doesn't support a feature that the query used " +
          getPrismaCollection(error?.message)
        break
      case "P2027":
        errorMessage =
          "Multiple errors occurred on the database during query execution " + getPrismaCollection(error?.message)
        break
      case "P2028":
        errorMessage = "Transaction API error " + getPrismaCollection(error?.message)
        break
      case "P2030":
        errorMessage =
          "Cannot find a fulltext index to use for the search, try adding a @@fulltext([Fields...]) to your schema " +
          getPrismaCollection(error?.message)
        break
      case "P2033":
        errorMessage =
          "A number used in the query does not fit into a 64 bit signed integer " + getPrismaCollection(error?.message)
        break
      case "P2034":
        errorMessage =
          "Transaction failed due to a write conflict or a deadlock. Please retry your transaction " +
          getPrismaCollection(error?.message)
        break
      default:
        errorMessage = error?.message
        break
    }
  }

  return errorMessage
}

const getPrismaCollection = (errorMessage: any) => {
  return errorMessage?.match(/prisma\.(\w+)\./)?.length ? "in " + errorMessage?.match(/prisma\.(\w+)\./)[0] : ""
}
