import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// привязать жанр к книге (seller/admin)
router.post("/", requireAuth, requireRole("seller","admin"), async (req, res, next) => {
  try {
    const { bookId, genreId } = req.body;
    const link = await prisma.book_genre.create({
      data: { bookId: Number(bookId), genreId: Number(genreId) }
    });
    res.json(link);
  } catch (e) {
    next(e);
  }
});

// удалить привязку (если вдруг нужно убрать жанр)
router.delete("/", requireAuth, requireRole("seller","admin"), async (req, res, next) => {
  try {
    const { bookId, genreId } = req.body;
    await prisma.book_genre.delete({
      where: { bookId_genreId: { bookId: Number(bookId), genreId: Number(genreId) } }
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export { router as bookGenresRouter };
