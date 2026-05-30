import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types/express";

export const authMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const secret = process.env.JWT_SECRET || "secretkey123";

      const decoded = jwt.verify(token, secret) as IJwtPayload;

      req.user = decoded; 

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  };
};