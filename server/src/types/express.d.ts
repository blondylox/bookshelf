import "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      login: string;
      role: string;
    }

    interface Request {
      user?: User;
    }
  }
}
