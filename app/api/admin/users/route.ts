import { NextResponse } from "next/server";
import { Admin, connectDB } from "@/lib/db";
import { Types } from "mongoose";
import bcrypt from "bcryptjs";

interface MongooseAdminLean {
  _id: Types.ObjectId;
  name: string;
  email: string;
  role?: string;
  created_at: Date;
  last_login?: Date | null;
  is_active: boolean;
}

export async function GET() {
  try {
    await connectDB();

    const users = await Admin.find({ is_active: true })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({
      users: (users as unknown as MongooseAdminLean[]).map((user) => ({
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role || "reviewer",
        created_at: user.created_at.toISOString(),
        last_login: user.last_login ? user.last_login.toISOString() : null,
        is_active: user.is_active,
      }))
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await Admin.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      is_active: true,
      created_at: new Date(),
    });

    return NextResponse.json(
      { 
        message: "Admin user created successfully",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          is_active: newUser.is_active,
          created_at: newUser.created_at.toISOString(),
          last_login: null
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
