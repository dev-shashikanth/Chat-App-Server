import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/utility.js";
import { adminSecretkey } from "../app.js";
import { CHAT_ADMIN_TOKEN } from "../constants/events.js";
import { CHAT_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";

const isAuthenticated = async (req, res, next) => {
  const token = req.cookies[CHAT_TOKEN];

  if (!token)
    return next(new ErrorHandler("Please login to access this route", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  req.user = decodedData._id;

  console.log(decodedData);
  next();
};

const isAdmin = async (req, res, next) => {
  const token = req.cookies[CHAT_ADMIN_TOKEN];

  if (!token)
    return next(new ErrorHandler("Only admin can access this route", 401));

  const secretKey = jwt.verify(token, process.env.JWT_SECRET);

  const isMatched = secretKey === adminSecretkey;

  if (!isMatched) {
    return next(new ErrorHandler("Only admin can access this route", 401));
  }
  next();
};

const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);

    const authToken = socket.request.cookies[CHAT_TOKEN];

    if (!authToken)
      return next(new ErrorHandler("Please login to access this route", 401));

    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

    const user = await User.findById(decodedData._id);

    if (!user)
      return next(new ErrorHandler("Please login to access this route", 401));

    socket.user = user;

    return next();
  } catch (error) {
    console.log("socket authenticator error", error);
    return next(new ErrorHandler("Please login to access this route", 401));
  }
};

export { isAuthenticated, isAdmin, socketAuthenticator };
