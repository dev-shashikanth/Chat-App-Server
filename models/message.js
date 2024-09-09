import mongooose, { Schema, Types, model } from "mongoose";

const schema = new Schema(
  {
    content: {
      type: String,
    },
    attachements: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongooose.models.Message || model("Message", schema);
