import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// добавить жанр
router.post("/", requireAuth, requireRole("seller","admin"), async (req, res, next) => {
  try {
    const { name } = req.body;
    const genre = await prisma.genre.create({ data: { name } });
    res.json(genre);
  } catch (e) {
    next(e);
  }
});

// получить список жанров
router.get("/", async (_req, res, next) => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres);
  } catch (e) {
    next(e);
  }
});

export { router as genresRouter };
