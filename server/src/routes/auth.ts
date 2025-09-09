import { Router } from "express";
import { prisma } from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

router.post("/register", async (req, res, next) => {
  try {
    const { login, email, password, name } = req.body;
    if (!login || !email || !password) return res.status(400).json({ error: "missing fields" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { login, email, passwordHash, name }});
    res.json({ id: user.id, login: user.login, email: user.email });
  } catch(e){ next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: "missing" });
    const user = await prisma.user.findFirst({ where: { login }});
    if (!user) return res.status(401).json({ error: "invalid" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid" });
    const token = jwt.sign({ id: user.id, login: user.login, role: user.role }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token, user: { id: user.id, login: user.login, role: user.role }});
  } catch(e){ next(e); }
});

export { router as authRouter };
