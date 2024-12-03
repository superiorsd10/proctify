import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "@repo/utils";
import { HttpStatusCode } from "@repo/utils";

export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.code).json({ error: err.message, success: false });
    return;
  }

  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: err.message,
    success: false,
  });
};
