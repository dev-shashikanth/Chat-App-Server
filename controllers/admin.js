import { adminSecretkey } from "../app.js";
import { CHAT_ADMIN_TOKEN } from "../constants/events.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { cookieOption } from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatch = secretKey === adminSecretkey;

  if (!isMatch) {
    return next(new ErrorHandler("Invalid admin key", 401));
  }

  const token = jwt.sign(secretKey, process.env.JWT_SECRET);

  return res
    .status(200)
    .cookie(CHAT_ADMIN_TOKEN, token, {
      ...cookieOption,
      maxAge: 1000 * 60 * 15,
    })
    .json({
      success: true,
      message: "Authenticated successfully",
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie(CHAT_ADMIN_TOKEN, "", {
      ...cookieOption,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    admin: true,
  });
});

const getAllUsers = TryCatch(async (req, res) => {
  const users = await User.find({});

  const transformUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id }) => {
      const [groupCount, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        avatar: avatar.url,
        _id,
        friends,
        groupCount,
      };
    })
  );

  return res.status(200).json({
    success: true,
    users: transformUsers,
  });
});

const getAllChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = Message.countDocuments({ chat: _id });
      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || "None",
          avatar: creator?.avatar.url || "",
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({
    success: true,
    chats,
  });
});

const getAllMessages = TryCatch(async (req, res) => {
  const messages = await Message.find({})
    .populate("sender", "name avatar")
    .populate("chat", "groupChat");

  const transformedMessages = messages.map(
    ({ content, attachements, _id, sender, createdAt, chat }) => ({
      _id,
      attachements,
      content,
      createdAt,
      chat: chat._id,
      groupChat: chat.groupChat,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    })
  );

  return res.status(200).json({
    success: true,
    transformedMessages,
  });
});

const getDashboardStats = TryCatch(async (req, res) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

  const today = new Date();

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: {
      $gte: last7Days,
      $lte: today,
    },
  }).select("createdAt");

  const messages = new Array(7).fill(0);
  const dayInMilliSeconds = 1000 * 60 * 24;

  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMilliSeconds;

    const index = Math.floor(indexApprox);

    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };
  return res.status(200).json({
    success: true,
    stats,
  });
});

export {
  getAllUsers,
  getAllChats,
  getAllMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
