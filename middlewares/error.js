import { envMode } from "../app.js";

const errorMiddleWare = (err, req, res, next) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  console.log(err);

  if (err.code === 11000) {
    const error = Object.keys(err.KeyPattern).join(",");
    err.message = `Duplicate field - ${error}`;
    err.statusCode = 400;
  }

  if (err.name === "CastError") {
    err.message = `Invalid format of ${err.path}`;
    err.statusCode = 400;
  }

  const response = {
    success: false,
    message: err.message,
  };

  if (envMode === "DEVELOPMENT") {
    response.error = err;
  }

  return res.status(err.statusCode).json(response);
};

// const TryCatch = (passedFunc) => async (req, res, next) => {
//   try {
//     await passedFunc(req, res, next);
//   } catch (error) {
//     next(error);
//   }
// };

const TryCatch = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export { errorMiddleWare, TryCatch };
