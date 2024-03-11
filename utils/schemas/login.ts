const schema = {
  type: "object",
  properties: {
    username: { type: "string" },
    email: { type: "string", format: "email" },
    password: { type: "string" },
  },
  errorMessage: {
    properties: {
      username: "username should be valid, current value is ${/username}",
      email: "email should be valid, current value is ${/email}",
      password: "password should be valid, current value is ${/password}"
    },
  },
  required: ["password"],
}

export default schema
