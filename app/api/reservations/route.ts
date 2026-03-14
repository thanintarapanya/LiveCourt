import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import firebaseConfig from "../../../firebase-applet-config.json";

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courtId, customerName, lineUserId, startTime, endTime } = body;

    // Basic validation
    if (!courtId || !customerName || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reservationData = {
      courtId,
      customerName,
      lineUserId: lineUserId || "anonymous",
      startTime,
      endTime,
      status: "pending",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reservations"), reservationData);

    return NextResponse.json({ 
      message: "Reservation accepted", 
      id: docRef.id 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
