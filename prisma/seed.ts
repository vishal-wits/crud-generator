// prisma/seed.ts
import { PrismaClient, roles, status } from "@prisma/client"
import { hashPassword } from "../shared/bcrypt"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hashPassword("admin@123")
  const isExist = await prisma.entity.findFirst({ where: { username: "admin" }})
  if (isExist) await prisma.entity.delete({ where: { username: "admin" }})
  await prisma.entity.create({
    data: {
      username: "admin",
      email: "admin@admin.com",
      password: hashedPassword,
      first_name: "Admin",
      last_name: "User",
      mobile: "+1234567890",
      address: "123 Main St",
      country: "Country",
      gst_legal_entity_name: "Legal Entity",
      gst_business_address: "Business Address",
      gst_city_code: "City Code",
      gst_no: "123456",
      name_as_per_pan: "Name",
      pan_no: "ABCDE1234F",
      pan_date_of_incorporation: "2022-01-01",
      subscriber_id: "subscriber123",
      subscriber_type: "BPP",
      status: status.active,
      role: roles.admin,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
}

main().then(() => {})
