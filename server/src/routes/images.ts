import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// добавить обложку к книге
// POST /api/books/:id/images
router.post("/:id/images", requireAuth, requireRole("seller","admin"), async (req, res, next) => {
  try {
    const bookId = Number(req.params.id);
    const { url } = req.body;

    const image = await prisma.bookImage.create({
      data: {
        book: { connect: { id: bookId } },
        url,
      },
    });

    res.json(image);
  } catch (e) {
    next(e);
  }
});

// удалить обложку по её id
// DELETE /api/images/:id
router.delete("/:id", requireAuth, requireRole("seller","admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.bookImage.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export { router as imagesRouter };
