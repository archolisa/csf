import { NextResponse } from "next/server"
import boardMembers from "@/data/board_members.json";

export async function GET() {
  try {
    // Return the board members data from JSON file
    return NextResponse.json(boardMembers);
  } catch (error) {
    console.error("Error fetching board members:", error)
    return NextResponse.json({ error: "Failed to fetch board members" }, { status: 500 })
  }
}

