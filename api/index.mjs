import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ── Mongoose User Model ───────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    phone:       { type: String, required: true, unique: true, trim: true },
    password:    { type: String, required: true, select: false },
    country:     { type: String, default: "" },
    countryCode: { type: String, default: "" },
    address:     { type: String, default: "" },
    city:        { type: String, default: "" },
    profilePic:  { type: String, default: "" }, // base64 data URL
    role:        { type: String, enum: ["farmer", "admin"], default: "farmer" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

// Avoid model re-registration in serverless warm starts
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ── MongoDB connection (cached for serverless) ────────────────────────────────
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
  });
  isConnected = true;
}

// ── Express App ───────────────────────────────────────────────────────────────
const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Multer — memory storage (Vercel has no writable disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Images only"));
  },
});

// Helper to convert buffer → base64 data URL
function bufferToDataUrl(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

const JWT_SECRET = process.env.JWT_SECRET;
const signToken = (id) => jwt.sign({ id }, JWT_SECRET, { expiresIn: "7d" });

// Middleware to verify JWT
async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "লগইন করুন" });
    const decoded = jwt.verify(header.split(" ")[1], JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "ব্যবহারকারী পাওয়া যায়নি" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "টোকেন অকার্যকর" });
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Health
app.get("/api/health", async (req, res) => {
  await connectDB();
  res.json({ status: "ok", db: mongoose.connection.readyState });
});

// Register
app.post("/api/auth/register", upload.single("profilePic"), async (req, res) => {
  try {
    await connectDB();
    const { name, phone, password, country, countryCode, city, address } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ message: "নাম, ফোন নম্বর ও পাসওয়ার্ড আবশ্যিক" });
    if (password.length < 6)
      return res.status(400).json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" });

    if (await User.findOne({ phone: phone.trim() }))
      return res.status(409).json({ message: "এই ফোন নম্বরে আগে থেকেই অ্যাকাউন্ট আছে" });

    const profilePic = req.file ? bufferToDataUrl(req.file) : "";
    const user = await User.create({ name, phone: phone.trim(), password, country: country||"", countryCode: countryCode||"", city: city||"", address: address||"", profilePic });
    res.status(201).json({ token: signToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "রেজিস্ট্রেশন ব্যর্থ" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    await connectDB();
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ message: "ফোন নম্বর ও পাসওয়ার্ড দিন" });
    const user = await User.findOne({ phone: phone.trim() }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়" });
    res.json({ token: signToken(user._id), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "লগইন ব্যর্থ" });
  }
});

// Me
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  await connectDB();
  res.json({ user: req.user });
});

// Update profile
app.put("/api/auth/profile", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    await connectDB();
    const updates = {};
    ["name", "country", "countryCode", "city", "address"].forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    if (req.file) updates.profilePic = bufferToDataUrl(req.file);
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ user: user.toSafeObject() });
  } catch {
    res.status(500).json({ message: "প্রোফাইল আপডেট ব্যর্থ" });
  }
});

// Logout (stateless JWT — client just deletes token)
app.post("/api/auth/logout", authMiddleware, (req, res) => {
  res.json({ message: "লগআউট সফল" });
});

export default app;
