import jwt from "jsonwebtoken";
import userModel from "../service/user/schema.js";

export const JWTAuthenticate = async (user) => {
  const tokenGenerate = await generateJWT({ _id: user._id });
  const refreshTokenGenerate = await refreshGenerateJWT({ _id: user._id });

  user.refreshToken = refreshTokenGenerate;

  await user.save();

  return { tokenGenerate, refreshTokenGenerate };
};

const generateJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1s" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

export const verifyJWT = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );

//Refresh

const refreshGenerateJWT = (payload) =>
  new Promise((resolve, reject) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    )
  );

const verifyRefreshJWT = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET_REFRESH, (err, decodedToken) => {
      if (err) reject(err);
      resolve(decodedToken);
    })
  );

export const verifyRefresh = async (actualRefreshToken) => {
  const decodedRefreshToken = await verifyRefreshJWT(actualRefreshToken);

  const user = await userModel.findById(decodedRefreshToken);

  if (!user) throw new Error("User not found");

  if (user.refreshToken === actualRefreshToken) {
    const { tokenGenerate, refreshToken } = await JWTAuthenticate(user);
    return { tokenGenerate, refreshToken };
  } else {
    throw createHttpError(401, "Refresh Token not valid!");
  }
};
