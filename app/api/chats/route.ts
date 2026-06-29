import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

async function getCollection() {
  const client = await clientPromise;
  const db = client.db('callmissed');
  return db.collection('conversations');
}

export async function GET() {
  try {
    const collection = await getCollection();
    const chats = await collection.find({}).sort({ updatedAt: -1 }).toArray();
    
    // Map out the MongoDB internal _id object from standard serialization
    const serializedChats = chats.map(({ _id, ...chat }) => chat);
    return NextResponse.json(serializedChats);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to retrieve conversation history from MongoDB." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { chat } = await req.json();
    if (!chat || !chat.id) {
      return NextResponse.json({ error: "Chat object is missing or invalid." }, { status: 400 });
    }

    const collection = await getCollection();
    await collection.updateOne(
      { id: chat.id },
      { $set: { ...chat, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to save conversation to MongoDB." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { chatId, title } = await req.json();
    if (!chatId || !title) {
      return NextResponse.json({ error: "chatId or title parameters are missing." }, { status: 400 });
    }

    const collection = await getCollection();
    await collection.updateOne(
      { id: chatId },
      { $set: { title: title.trim(), updatedAt: new Date().toISOString() } }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to rename conversation in MongoDB." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');
    
    if (!chatId) {
      return NextResponse.json({ error: "chatId parameter is missing." }, { status: 400 });
    }

    const collection = await getCollection();
    await collection.deleteOne({ id: chatId });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete conversation from MongoDB." },
      { status: 500 }
    );
  }
}
