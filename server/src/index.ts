import express from "express"; 
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { booksRouter } from "./routes/books";
import { imagesRouter } from "./routes/images";
import { publishersRouter } from "./routes/publishers";
import { bookGenresRouter } from "./routes/bookGenres";
import { genresRouter } from "./routes/genres";
import { ordersRouter } from "./routes/orders";
import { cartRouter } from "./routes/cart";



dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/api/books", imagesRouter);   
app.use("/api/images", imagesRouter); 
app.use("/api/publishers", publishersRouter);
app.use("/api/book-genres", bookGenresRouter);
app.use("/api/genres", genresRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/cart", cartRouter);

// обработчик ошибок
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "server error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server on http://localhost:${port}`));
