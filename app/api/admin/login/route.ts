import { NextRequest, NextResponse } from "next/server";
import { Admin, connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      ...(process.env.NODE_ENV === "production"
        ? { domain: ".cyrilandsusannafoundation.org" }
        : {}),
    };

    response.cookies.set("adminSession", JSON.stringify({
      adminId: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    }), cookieOptions);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
