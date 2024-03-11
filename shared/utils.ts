export const getUser = (): any => {
  return { name: "Test User", age: 24 }
}

export const generateRandomPassword = (): string => {
  return Math.random().toString(36).slice(-8)
}

/**
 * Generates a random 6-digit OTP.
 * @returns {string} The generated OTP.
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}