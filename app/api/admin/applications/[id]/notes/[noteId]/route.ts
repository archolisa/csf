import { NextRequest, NextResponse } from "next/server";
import { ScholarshipApplication, connectDB } from "@/lib/db";
import { Types } from "mongoose";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();
    const { id, noteId } = await params;
    const { text } = await req.json();

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Note text is required" }, { status: 400 });
    }

    const application = await ScholarshipApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Find and update the specific note
    const note = application.notes.id(noteId);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    note.text = text;
    await application.save();

    return NextResponse.json({ success: true, notes: application.notes });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    await connectDB();
    const { id, noteId } = await params;

    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const application = await ScholarshipApplication.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Remove the note
    application.notes.pull({ _id: noteId });
    await application.save();

    return NextResponse.json({ success: true, notes: application.notes });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
