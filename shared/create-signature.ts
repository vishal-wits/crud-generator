import { createAuthorizationHeader } from "ondc-crypto-sdk-nodejs"
import "dotenv/config"

const authorization = async (data: any): Promise<any> => {
  const header = await createAuthorizationHeader({
    message: data,
    privateKey: process.env.SIGNATURE_PRIVATE_KEY || "",
    bapId: process.env.SIGNATURE_BAPID || "",
    bapUniqueKeyId: process.env.SIGNATURE_UNIQUEKEY_ID || "",
  })

  return header
}

export default authorization
