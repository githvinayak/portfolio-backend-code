import ErrorHandler, { TryCatch } from "../middlewares/error.js";
import { Message } from "../models/message.js";

export const sendMessage = TryCatch(async (req, res, next) => {
  const { senderName, email, message } = req.body;
  if (!senderName || !email || !message) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const data = await Message.create({ senderName, email, message });
  res.status(201).json({
    success: true,
    message: "Message Sent",
    data,
  });
});

export const deleteMessage = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  if (!message) {
    return next(new ErrorHandler("Message Already Deleted!", 400));
  }
  await message.deleteOne();
  res.status(201).json({
    success: true,
    message: "Message Deleted",
  });
});

export const getAllMessages = TryCatch(async (req, res, next) => {
  const messages = await Message.find({}).sort({createdAt: -1 });
  // products = await Product.find({}).sort({ createdAt: -1 }).limit(5)
  res.status(201).json({
    success: true,
    messages,
  });
});
