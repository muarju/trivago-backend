import { Router } from "express";
import createHttpError from "http-errors";
import { JWTAuthMiddleware } from "../../auth/token.js";
import { JWTAuthenticate, verifyRefresh } from "../../auth/tools.js";
import userModel from "../user/schema.js";
import accoModel from "../accommodation/schema.js";
import passport from "passport";

const userRouter = Router();

userRouter.post("/register", async (req, res, next) => {
  const registerUser = await userModel.create(req.body);

  const { _id } = registerUser;

  res.status(201).send(_id);
});

userRouter.get("/", async (req, res, next) => {
  const getUsers = await userModel.find();

  res.send(getUsers);
});

userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userFound = await userModel.checkUser(email, password);

    if (userFound) {
      const { tokenGenerate, refreshTokenGenerate } = await JWTAuthenticate(
        userFound
      );
      res.send({ tokenGenerate, refreshTokenGenerate });
      next();
    } else {
      console.log("Credentials are not ok!");
      next();
    }
  } catch (error) {
    console.log(error);
  }
});

userRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { actualRefreshToken } = req.body;

    const { tokenGenerate, refreshToken } = await verifyRefresh(
      actualRefreshToken
    );

    res.send({ tokenGenerate, refreshToken });
  } catch (error) {
    console.log(error);
  }
});
userRouter.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
); //this will be used for login route and we are going to send our users to this route to login
//after successfully logged in facebook will redirect to below routes
userRouter.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook"),
  async (req, res, next) => {
    try {
      console.log("redirect");
      console.log(req.user.token);
      res.cookie("token", req.user.token, {
        httpOnly: true,
      })
      res.redirect(`${process.env.FRONTEND_URL}`);
    } catch (error) {
      next(error);
    }
  }
);

// passport.authenticate("facebook"), async (req, res, next) => {

// }
// function (req, res) {
//   console.log(req);
//   // Successful authentication, redirect home.
//   res.redirect("/");
// }
// );

userRouter.get(
  "/me/accommodation",
  JWTAuthMiddleware,
  async (req, res, next) => {
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
  }
);

userRouter.post("/accommodation", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accommodation = await accoModel(req.body).save();
    res.send(accommodation);
  } catch (error) {
    next(error);
  }
});

userRouter.put(
  "/accommodation/:id",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const accommodation = await accoModel.findOneAndUpdate(
        { _id: req.params.id, host: req.user._id },
        { ...req.body },
        { new: true }
      );
      console.log(req.params.id, req.user._id);
      if (accommodation) {
        res.send(accommodation);
      } else {
        next(createHttpError(401, `💀 You are Unauthorized to change this`));
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.delete(
  "/accommodation/:id",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const accommodation = await accoModel.findOneAndDelete({
        _id: req.params.id,
        host: req.user._id,
      });
      console.log(req.params.id, req.user._id);
      if (accommodation) {
        res.send("🏌️‍♀️ Gone for good!!");
      } else {
        next(createHttpError(401, `💀 Unauthorized to delete this!!`));
      }
    } catch (error) {
      next(error);
    }
  }
);

export default userRouter;
