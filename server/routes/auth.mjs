import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import User from "../models/User.mjs";
import authMiddleware from "../middleware/auth.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure uploads dir
const uploadsDir = path.join(__dirname, "../uploads/avatars");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("শুধুমাত্র ছবি আপলোড করুন"));
  },
});

const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, phone, password, country, countryCode, city, address } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({ message: "নাম, ফোন নম্বর ও পাসওয়ার্ড আবশ্যিক" });
    if (password.length < 6)
      return res.status(400).json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" });

    const existing = await User.findOne({ phone: phone.trim() });
    if (existing)
      return res.status(409).json({ message: "এই ফোন নম্বরে আগে থেকেই অ্যাকাউন্ট আছে" });

    const user = await User.create({
      name,
      phone: phone.trim(),
      password,
      country:     country     || "",
      countryCode: countryCode || "",
      city:        city        || "",
      address:     address     || "",
      profilePic:  req.file ? `/uploads/avatars/${req.file.filename}` : "",
    });

    res.status(201).json({ token: signToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে" });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "ফোন নম্বর ও পাসওয়ার্ড দিন" });

    const user = await User.findOne({ phone: phone.trim() }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়" });

    res.json({ token: signToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "লগইন ব্যর্থ হয়েছে" });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ── PUT /api/auth/profile ────────────────────────────────────────────────────
router.put("/profile", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const updates = {};
    ["name", "country", "countryCode", "city", "address"].forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.file) updates.profilePic = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: user.toSafeObject() });
  } catch {
    res.status(500).json({ message: "প্রোফাইল আপডেট ব্যর্থ" });
  }
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post("/logout", authMiddleware, (req, res) => {
  res.json({ message: "লগআউট সফল" });
});

export default router;
