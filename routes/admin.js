import express from "express";
import {
  adminLogin,
  adminLogout,
  getAdminData,
  getAllChats,
  getAllMessages,
  getAllUsers,
  getDashboardStats,
} from "../controllers/admin.js";
import { adminLoginValidator, validateHandler } from "../lib/validators.js";
import { isAdmin } from "../middlewares/auth.js";

const app = express.Router();

app.post("/verify", adminLoginValidator(), validateHandler, adminLogin);

app.post("/logout", adminLogout);

//Only admin can access these routess

app.use(isAdmin);

app.get("/", getAdminData);

app.get("/users", getAllUsers);

app.get("/chats", getAllChats);

app.get("/messages", getAllMessages);

app.get("/stats", getDashboardStats);

export default app;
