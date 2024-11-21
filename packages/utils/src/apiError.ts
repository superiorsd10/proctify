import { HttpStatusCode } from "./httpStatusCode";

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(msg: string): ApiError {
    return new ApiError(HttpStatusCode.BAD_REQUEST, msg);
  }

  static unauthorized(msg: string): ApiError {
    return new ApiError(HttpStatusCode.UNAUTHORIZED, msg);
  }

  static notFound(msg: string): ApiError {
    return new ApiError(HttpStatusCode.NOT_FOUND, msg);
  }

  static internal(msg: string): ApiError {
    return new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, msg);
  }

  static gatewayTimeout(msg: string): ApiError {
    return new ApiError(HttpStatusCode.GATEWAY_TIMEOUT, msg);
  }
}
