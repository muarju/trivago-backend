import express from "express";
import createHttpError from "http-errors";
//middle
import { JWTAuthMiddleware } from "../../auth/token.js";
//schema
import AccommodationModel from "./schema.js";

const accomodationsRouter = express.Router();

accomodationsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accomodation = await AccommodationModel.findOne();
    res.send(accomodation);
  } catch (error) {
    console.log("error in accomodations router", error);
    next(error);
  }
});

accomodationsRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accomodation = await AccommodationModel.findById(req.params.id);
    //.populate("xxx")

    if (accomodation) {
      res.send(accomodation);
    } else {
      next(createHttpError(404, `Accomodation id ${req.params.id} not found`));
    }
  } catch (error) {
    console.log("error in accomodations router", error);
    next(error);
  }
});

// accomodationsRouter.post('/', JWTAuthMiddleware, async (req, res, next) => {
//   //have to add validation user vs admin as a middleware
//   try {
//     const newAccomodation = new AccommodationModel({
//       ...req.body,
//       host: req.user.id,
//     });
//     //is that correct?
//     const { _id } = await newAccomodation.save();
//     res.status(201).send({ _id });
//   } catch (error) {
//     console.log('error in accomodations router', error);
//     next(error);
//   }
// });
// accomodationsRouter.put('/', JWTAuthMiddleware, async (req, res, next) => {
//   try {
//     const updatedAccomodation = await AccommodationModel.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (updatedAccomodation) {
//       res.sendStatus(204);
//     } else {
//       next(
//         createHttpError(404, `Accomodation with id ${req.params.id} not found`)
//       );
//     }
//   } catch (error) {
//     console.log('error in accomodations router', error);
//     next(error);
//   }
// });

// accomodationsRouter.delete(
//   '/:id',
//   JWTAuthMiddleware,
//   async (req, res, next) => {
//     try {
//       const deletedAccomodation = await AccommodationModel.findByIdAndDelete(
//         req.params.id
//       );
//       if (deletedAccomodation) {
//         res.sendStatus(204);
//       } else {
//         next(
//           createHttpError(
//             404,
//             `Accomodation with id ${req.params.id} not found`
//           )
//         );
//       }
//     } catch (error) {
//       console.log('error in accomodations router', error);
//       next(error);
//     }
//   }
// );

export default accomodationsRouter;
