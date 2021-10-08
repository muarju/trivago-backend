import createHttpError from "http-errors";

export const roleCheckMiddleware = (req, res, next) => {
  if (req.user.role === "host") {
    next();
  } else {
    next(createHttpError(403, "Unauthorized!."));
  }
};
