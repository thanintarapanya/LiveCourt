import express from "express";
import path from "path";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase for the server
const firebaseConfig = JSON.parse(
  readFileSync(path.join(__dirname, "firebase-applet-config.json"), "utf8")
);
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint for LINE Mini App to create reservations
app.post("/api/reservations", async (req, res) => {
  try {
    const { courtId, customerName, lineUserId, startTime, endTime } = req.body;

    // Basic validation
    if (!courtId || !customerName || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields" });
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

    console.log("Reservation created with ID: ", docRef.id);
    res.status(201).json({ 
      message: "Reservation accepted", 
      id: docRef.id 
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Specific endpoint for Livecourt sync
app.post("/api/sync/livecourt", async (req, res) => {
  try {
    // Assuming Livecourt sends an array of bookings or a single booking
    const data = req.body;
    
    if (Array.isArray(data)) {
      const results = [];
      for (const item of data) {
        const docRef = await addDoc(collection(db, "reservations"), {
          ...item,
          source: "livecourt",
          createdAt: serverTimestamp(),
        });
        results.push(docRef.id);
      }
      return res.status(201).json({ message: "Sync successful", ids: results });
    } else {
      const docRef = await addDoc(collection(db, "reservations"), {
        ...data,
        source: "livecourt",
        createdAt: serverTimestamp(),
      });
      return res.status(201).json({ message: "Sync successful", id: docRef.id });
    }
  } catch (error) {
    console.error("Livecourt sync error:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  import("vite").then(({ createServer: createViteServer }) => {
    createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    }).then(vite => {
      app.use(vite.middlewares);
    });
  });
} else if (!process.env.VERCEL) {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Export for Vercel
export default app;

// Start server if not running as a serverless function
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
