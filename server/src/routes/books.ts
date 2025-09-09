import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// список книг с фильтрами и поиском
router.get("/", async (req, res, next) => {
  try {
    const { q, genre_id, publisher_id, genre, publisher, page = "1", limit = "12", sort } = req.query as any;

    const skip = (Number(page) - 1) * Number(limit);
    let orderBy: any = undefined;

    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "title_asc") orderBy = { title: "asc" };
    if (sort === "newest") orderBy = { id: "desc" };

    const where: any = {};

    // поиск по названию и описанию
    if (q) {
      where.OR = [
        { title: { contains: String(q) } },
        { description: { contains: String(q) } }
      ];
    }

    // фильтры по издательству
    if (publisher_id) where.publisherId = Number(publisher_id);
    if (publisher) {
      where.publisher = { name: { equals: String(publisher) } };
    }

    // фильтры по жанрам
    if (genre_id) where.genres = { some: { genreId: Number(genre_id) } };
    if (genre) {
      where.genres = { some: { genre: { name: { equals: String(genre) } } } };
    }

    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          publisher: true,
          images: true,
          genres: { include: { genre: true } },
          authors: { include: { author: true } }
        }
      }),
      prisma.book.count({ where })
    ]);

    res.json({ items, total });
  } catch (e) {
    next(e);
  }
});

// получить книгу по id
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        publisher: true,
        images: true,
        genres: { include: { genre: true } },
        authors: { include: { author: true } }
      }
    });
    if (!book) return res.status(404).json({ error: "not found" });
    res.json(book);
  } catch (e) {
    next(e);
  }
});

// добавить книгу (seller/admin)
router.post("/", requireAuth, requireRole("seller", "admin"), async (req, res, next) => {
  try {
    const { title, description, publisherId, publisher, price, quantity } = req.body;

    let finalPublisherId: number | null = null;

    if (publisherId) {
      finalPublisherId = Number(publisherId);
    } else if (publisher) {
      const pub = await prisma.publisher.upsert({
        where: { name: publisher },
        update: {},
        create: { name: publisher },
      });
      finalPublisherId = pub.id;
    }

    const book = await prisma.book.create({
      data: {
        title,
        description,
        publisherId: finalPublisherId,
        price: Number(price || 0),
        quantity: Number(quantity || 0),
      },
      include: {
        publisher: true,
        images: true,
        genres: { include: { genre: true } },
        authors: { include: { author: true } }
      }
    });

    res.json(book);
  } catch (e) {
    next(e);
  }
});

// обновить книгу
router.put("/:id", requireAuth, requireRole("seller", "admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { publisherId, publisher, ...rest } = req.body;

    let finalPublisherId: number | null | undefined = undefined;

    if (publisherId) {
      finalPublisherId = Number(publisherId);
    } else if (publisher) {
      const pub = await prisma.publisher.upsert({
        where: { name: publisher },
        update: {},
        create: { name: publisher },
      });
      finalPublisherId = pub.id;
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        ...rest,
        ...(finalPublisherId ? { publisherId: finalPublisherId } : {})
      },
      include: {
        publisher: true,
        images: true,
        genres: { include: { genre: true } },
        authors: { include: { author: true } }
      }
    });

    res.json(book);
  } catch (e) {
    next(e);
  }
});

// удалить книгу
router.delete("/:id", requireAuth, requireRole("seller", "admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.book.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export { router as booksRouter };
