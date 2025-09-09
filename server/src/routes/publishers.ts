import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const publishersRouter = Router();

// список издательств
publishersRouter.get("/", async (_req, res, next) => {
  try {
    const publishers = await prisma.publisher.findMany();
    res.json(publishers);
  } catch (err) {
    next(err);
  }
});

// добавить издательство
publishersRouter.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const publisher = await prisma.publisher.create({ data: { name } });
    res.json(publisher);
  } catch (err) {
    next(err);
  }
});
