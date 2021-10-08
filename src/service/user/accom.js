import { Router } from "express";
import createHttpError from "http-errors";
import accoModel from "../accommodation/schema.js";

const usersRouter = Router();

usersRouter.get("/me/accommodation", async (req, res, next) => {
  try {
    const accommodation = await accoModel.find({ host: req.user._id });
    res.send(accommodation);
  } catch (error) {
    next(
      createHttpError(
        404,
        `😔Sorry ${req.user.name} we could NOT find your accommodation!!`
      )
    );
  }
});

usersRouter.post("/accommodation", async (req, res, next) => {
  try {
    const accommodation = await accoModel(req.body).seve();
    res.send(accommodation);
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/accommodation/:id", async (req, res, next) => {
  try {
    const accommodation = await accoModel.findOneAndUpdate(
      { _id: req.params.id, host: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (accommodation) {
      res.send(accommodation);
    } else {
      next(createHttpError(401, `💀 You are Unauthorized to change this`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/accommodation/:id", async (req, res, next) => {
  try {
    const accommodation = await accoModel.findOneAndDelete({
      _id: req.params.id,
      host: req.user._id,
    });
    if (accommodation) {
      res.send("🏌️‍♀️ Gone for good!!");
    } else {
      next(createHttpError(401, `💀 Unauthorized to delete this!!`));
    }
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
