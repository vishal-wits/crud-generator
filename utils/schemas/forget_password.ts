const schema = {
  type: "object",
  properties: {
    username: { type: "string" },
    email: { type: "string", format: "email" },
  },
}

export default schema
