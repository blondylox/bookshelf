import { Router } from "express";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// 📌 Получить корзину текущего покупателя
router.get("/", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const items = await prisma.cartItem.findMany({
      where: { userId },
      include: { book: { include: { images: true } } }
    });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// 📌 Добавить книгу в корзину
router.post("/", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { bookId, qty } = req.body;

    // если уже есть — обновляем количество
    const existing = await prisma.cartItem.findFirst({ where: { userId, bookId } });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + (qty || 1) }
      });
    } else {
      item = await prisma.cartItem.create({
        data: { userId, bookId, qty: qty || 1 }
      });
    }

    res.json(item);
  } catch (e) {
    next(e);
  }
});

// 📌 Удалить из корзины
router.delete("/:id", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.cartItem.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// 📌 Оформить заказ из корзины
router.post("/checkout", requireAuth, requireRole("buyer"), async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { book: true }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        items: {
          create: cartItems.map(ci => ({
            bookId: ci.bookId,
            qty: ci.qty,
            price: ci.book.price
          }))
        }
      },
      include: {
        items: { include: { book: true } }
      }
    });

    // очищаем корзину
    await prisma.cartItem.deleteMany({ where: { userId } });

    res.json(order);
  } catch (e) {
    next(e);
  }
});

export { router as cartRouter };
