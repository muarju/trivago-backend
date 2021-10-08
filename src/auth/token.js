import createHttpError from 'http-errors';
import { verifyJWT } from './tools.js';
import userModel from '../service/user/schema.js';

export const JWTAuthMiddleware = async (req, res, next) => {
  // console.log(req.headers.authorization);

  if (!req.headers.authorization) {
    next(createHttpError('Please provide credentials in the header!'));
  } else {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');

      const decodedToken = await verifyJWT(token);

      const user = await userModel.findById(decodedToken._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(404, 'User not found'));
      }
    } catch (error) {
      next(createHttpError(401, 'Token not valid'));
    }
  }
};
