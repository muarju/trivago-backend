import express from "express";
import userRouter from "./service/user/index.js";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import accomodationsRouter from "./service/accommodation/index.js";
import { errorMiddlewares } from "./errorMiddlewares.js";
import facebookStrategy from "./auth/f-oauth.js";
import passport from "passport";
// import usersRouter from "./service/user/accom.js";

const server = express();
const { PORT, MONGO_CONNECTION_STRING } = process.env;

//***********************passport************************ */

passport.use("facebook", facebookStrategy);

// ******************** MIDDLEWARES *************************+

server.use(cors());
server.use(express.json());
server.use(passport.initialize());

// ******************** ROUTES ******************************
server.use("/users", userRouter);
server.use("/accomodation", accomodationsRouter);

// ********************** ERROR HANDLERS *************************
server.use([errorMiddlewares]);

console.table(listEndpoints(server));
server.listen(PORT, async () => {
  try {
    await mongoose.connect(MONGO_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Server is running on ${PORT}  and connected to db`);
  } catch (error) {
    console.log("Db connection is failed ", error);
  }
});

server.on("error", (error) =>
  console.log(`❌ Server is not running due to : ${error}`)
);
