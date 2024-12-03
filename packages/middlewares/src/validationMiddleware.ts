import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { HttpStatusCode } from "@repo/utils";

export const validationMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Request validation failed", {
          error: error.errors,
        });
        res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Invalid request data",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
          success: false,
        });
      } else {
        console.error("Unexpected validation error", { error });
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
          message: "An unexpected error occurred",
          success: false,
        });
      }
    }
  };
};
