import axios, { AxiosError } from "axios"
// import HttpException from "./http-exception"
import { logger } from "../shared/logger"

export const axiosONDCPost = async (
  url: string,
  payload: any,
  bap_uri: string,
  authorization: any = null,
): Promise<any> => {
  let headers: any = { "Content-Type": "application/json" }
  if (authorization) {
    headers = { ...headers, Authorization: authorization }
  }
  try {
    logger.error(`axiosONDCPost - ${url}: Signature - ${JSON.stringify(authorization)}`)
    const response = await axios.post(`${bap_uri}${url}`, payload, { headers })
    return { status: response?.status || 200, data: response?.data }
  } catch (error: any) {
    logger.error(`axiosONDCPost - ${url}: Error - ${JSON.stringify(error)}`)
    if (axios.isAxiosError(error)) {
      // Axios error
      const axiosError = error as AxiosError
      // throw new HttpException(`${axiosError.message}`)
      return { status: axiosError?.response?.status || 400, data: axiosError?.response?.data };
    } else {
      // Generic error
      // throw new HttpException(`${error?.message}`)
      return { status: 500, data: null };
    }
  }
}
