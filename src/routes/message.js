import express from "express";
import { deleteMessage, getAllMessages, sendMessage } from "../controllers/message.js";
import { isAuthenticated } from "../middlewares/auth.js";

const app = express.Router();

app.post("/send", sendMessage);
app.delete("/delete/:id", isAuthenticated, deleteMessage);
app.get("/all", getAllMessages);

export default app;