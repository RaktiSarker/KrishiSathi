import jwt from "jsonwebtoken";
import User from "../models/User.mjs";

const JWT_SECRET = process.env.JWT_SECRET;

export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "অনুগ্রহ করে লগইন করুন" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "ব্যবহারকারী পাওয়া যায়নি" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "টোকেন অকার্যকর। আবার লগইন করুন।" });
  }
}
