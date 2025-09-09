import { Router } from "express"; 
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// 📌 Получить заказы текущего пользователя (покупатель)
router.get("/my", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { book: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

// 📌 Создать новый заказ (покупатель)
router.post("/", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { items } = req.body as { items: { bookId: number; qty: number }[] };

    // подтягиваем цены книг
    const bookIds = items.map((i) => i.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, price: true },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: items.map((it) => {
            const book = books.find((b) => b.id === it.bookId);
            return {
              bookId: it.bookId,
              qty: it.qty,
              price: book ? book.price : 0,
            };
          }),
        },
      },
      include: {
        items: { include: { book: true } },
      },
    });

    res.json(order);
  } catch (e) {
    next(e);
  }
});

// 📌 Продавец/админ видит все заказы
router.get("/", requireAuth, requireRole("seller", "admin"), async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: { include: { book: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (e) {
    next(e);
  }
});

// 📌 Обновить статус заказа (seller/admin)
router.put("/:id/status", requireAuth, requireRole("seller", "admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(order);
  } catch (e) {
    next(e);
  }
});

// 📌 Пересчитать цены заказа по актуальным данным из book
router.put("/:id/fix-prices", requireAuth, requireRole("seller", "admin"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // находим заказ с его items
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    // получаем id всех книг
    const bookIds = order.items.map((it) => it.bookId);
    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, price: true },
    });

    // обновляем все order_item
    for (const item of order.items) {
      const book = books.find((b) => b.id === item.bookId);
      if (book) {
        await prisma.order_item.update({
          where: { id: item.id },
          data: { price: book.price },
        });
      }
    }

    // возвращаем обновлённый заказ
    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { book: true } },
        user: true,
      },
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

export { router as ordersRouter };

// 📌 Отменить заказ (покупатель)
router.put("/:id/cancel", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const userId = req.user!.id

    // проверяем, что заказ принадлежит покупателю
    const order = await prisma.order.findUnique({ where: { id } })
    if (!order || order.userId !== userId) {
      return res.status(403).json({ error: "Нет доступа к заказу" })
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: "Заказ уже обработан и не может быть отменён" })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    })

    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// 📌 Покупатель отменяет свой заказ
router.put("/:id/cancel", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== userId) {
      return res.status(403).json({ error: "Нет доступа к заказу" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ error: "Заказ уже нельзя отменить" });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
});
