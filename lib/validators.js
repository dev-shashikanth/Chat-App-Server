import { body, param, validationResult } from "express-validator";
import { ErrorHandler } from "../utils/utility.js";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(", ");
  if (errors.isEmpty()) return next();
  else next(new ErrorHandler(errorMessages, 400));
};

const registerValidator = () => [
  body("name", "Please Enter name").notEmpty(),
  body("username", "Please Enter Username").notEmpty(),
  body("bio", "Please Enter Bio").notEmpty(),
  body("password", "Please Enter password").notEmpty(),
];

const validateLogin = () => [
  body("username", "Please Enter Username").notEmpty(),
  body("password", "Please Enter password").notEmpty(),
];

const groupChatValidator = () => [
  body("name", "Please Enter Group Name").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please provide members")
    .isArray({ min: 2, max: 100 })
    .withMessage("Members must be min 2 and max 100"),
];

const addMemberValidator = () => [
  body("chatId", "Please Enter Chat Id").notEmpty(),
  body("members")
    .notEmpty()
    .withMessage("Please provide members")
    .isArray({ min: 1, max: 97 })
    .withMessage("Members must be min 1 and max 97"),
];

const removeMemberValidator = () => [
  body("chatId", "Please Enter Chat Id").notEmpty(),
  body("userId", "Please Enter user Id").notEmpty(),
];

const sendAttachementValidator = () => [
  body("chatId", "Please Enter Chat Id").notEmpty(),
];

const chatIdValidator = () => [param("id", "Please Enter Id").notEmpty()];

const renameValidator = () => [
  param("id", "Please Enter Id").notEmpty(),
  body("name", "Please Enter group name").notEmpty(),
];

const sendRequestValidator = () => [
  body("userId", "Please Enter user Id").notEmpty(),
];

const acceptRequestValidator = () => [
  body("requestId", "Please Enter request Id").notEmpty(),
  body("accept")
    .notEmpty()
    .withMessage('"Please Add Accept"')
    .isBoolean()
    .withMessage("Accept must be a boolean"),
];

const adminLoginValidator = () => [
  body("secretKey", "Please enter secret key").notEmpty(),
];

export {
  acceptRequestValidator,
  addMemberValidator,
  adminLoginValidator,
  chatIdValidator,
  groupChatValidator,
  registerValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachementValidator,
  sendRequestValidator,
  validateHandler,
  validateLogin,
};
