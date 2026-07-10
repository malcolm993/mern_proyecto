import {Types } from "mongoose";

export interface Message extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}