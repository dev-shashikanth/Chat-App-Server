import express from "express";
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";
import { errorMiddleWare } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

//Routes
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import adminRoute from "./routes/admin.js";
import {
  CHAT_ADMIN_TOKEN,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  START_TYPING,
  STOP_TYPING,
} from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";

dotenv.config({
  path: "./.env",
});

const mongURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || "PRODUCTION";
const adminSecretkey = process.env.ADMIN_SECRET_KEY || "adfadfasdf";
const userSocketIDs = new Map();

const app = express();

const server = createServer(app);
const io = new Server(server, { cors: corsOptions });

app.set("io", io);

connectDB(mongURI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

//Using Middleware here

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// app.use("/login", login);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);

app.get("/", (req, res) => {
  res.send("Home page");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});
//socket connection
io.on("connection", (socket) => {
  const user = socket.user;
  console.log("user connected", user);
  userSocketIDs.set(user._id.toString(), socket.id);
  console.log(userSocketIDs);
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      _id: uuid(),
      sender: {
        _id: user._id,
        name: user.name,
      },
      chat: chatId,
      createAt: new Date().toISOString(),
    };
    const messageForDB = {
      content: message,
      sender: user._id,
      chat: chatId,
    };

    console.log("Emitting", messageForRealTime);

    const membersSocket = getSockets(members);

    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime,
    });

    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await Message.create(messageForDB);
    } catch (error) {
      console.log(errors);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    console.log("start typing socket", chatId);
    const membersSockets = getSockets(members);

    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    console.log("STOP typing socket", chatId);
    const membersSockets = getSockets(members);

    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    userSocketIDs?.delete(user._id.toString());
  });
});

app.use(errorMiddleWare);

server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${envMode} Mode`);
});

export { envMode, adminSecretkey, userSocketIDs };
