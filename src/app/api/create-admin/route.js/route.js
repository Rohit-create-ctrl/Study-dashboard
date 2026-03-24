import connectDB from "@/lib/db"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    await connectDB()

    const existingUser = await User.findOne({ email: "admin@gmail.com" })
    if (existingUser) {
      return Response.json({ message: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash("123456", 10)

    const user = await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
    })

    return Response.json({ message: "Admin created successfully", user })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}