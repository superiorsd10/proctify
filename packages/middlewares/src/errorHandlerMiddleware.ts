import { Request, Response, NextFunction } from "express";
import { ApiError } from "@repo/utils";
import { HttpStatusCode } from "@repo/utils";

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.code).json({ error: err.message, success: false });
  }

  return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: "Internal Server Error",
    success: false,
  });
};
