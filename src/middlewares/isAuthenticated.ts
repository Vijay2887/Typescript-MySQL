import { NextFunction, Request, Response } from "express";
import { RequestHandler } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ msg: "Please Authenticate first" });
  }
};
