import { NextRequest, NextResponse } from "next/server";
import { AuditLog, connectDB } from "@/lib/db";
import { Types } from "mongoose";

interface MongooseAuditLogLean {
  _id: Types.ObjectId;
  admin_id: Types.ObjectId;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  timestamp: Date;
  ip_address?: string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");

    const query: Record<string, unknown> = {};
    if (action) {
      query.action = action;
    }
    if (entityType) {
      query.entity_type = entityType;
    }

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      logs: (logs as unknown as MongooseAuditLogLean[]).map((log) => ({
        id: log._id?.toString(),
        admin_id: log.admin_id?.toString(),
        admin_name: log.admin_name,
        action: log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        details: log.details,
        timestamp: log.timestamp.toISOString(),
        ip_address: log.ip_address,
      }))
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { admin_id, admin_name, action, entity_type, entity_id, details, ip_address } = await req.json();

    if (!admin_id || !admin_name || !action || !entity_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const log = await AuditLog.create({
      admin_id,
      admin_name,
      action,
      entity_type,
      entity_id,
      details,
      ip_address,
    });

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    );
  }
}
