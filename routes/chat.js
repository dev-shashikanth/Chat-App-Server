import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChat,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachement,
} from "../controllers/chat.js";
import { attachementMulter } from "../middlewares/multer.js";
import {
  addMemberValidator,
  chatIdValidator,
  groupChatValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachementValidator,
  validateHandler,
} from "../lib/validators.js";

const app = express.Router();

//After here user must be logged into access the routes
app.use(isAuthenticated);

app.post("/new", groupChatValidator(), validateHandler, newGroupChat);

app.get("/my", getMyChat);

app.get("/my/groups", getMyGroups);

app.put("/addmembers", addMemberValidator(), validateHandler, addMembers);

app.put(
  "/removemember",
  removeMemberValidator(),
  validateHandler,
  removeMember
);

app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup);

app.post(
  "/message",
  attachementMulter,
  sendAttachementValidator(),
  validateHandler,
  sendAttachement
);

app.get("/message/:id", chatIdValidator(), validateHandler, getMessages);

app
  .route("/:id")
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

export default app;
