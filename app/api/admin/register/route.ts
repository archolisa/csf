import { NextRequest, NextResponse } from "next/server";
import { Admin, connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existing = await Admin.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { error: "Admin already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password_hash: hashedPassword,
      name,
    });

    return NextResponse.json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
