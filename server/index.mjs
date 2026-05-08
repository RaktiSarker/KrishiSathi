import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dynamic import of routes (must come after dotenv)
const { default: authRoutes } = await import("./routes/auth.mjs");

const app = express();
const PORT = process.env.SERVER_PORT;
const MONGO_URI = process.env.MONGO_URI;


// Middleware
app.use(cors({ origin: "http://localhost:8080", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded profile pictures
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", db: mongoose.connection.readyState }));

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected:", MONGO_URI);
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
