import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { deleteTimeline, getAllTimelines, postTimeline } from "../controllers/timeline.js";

const app = express.Router();

app.post("/add", isAuthenticated, postTimeline);
app.delete("/delete/:id", isAuthenticated, deleteTimeline);
app.get("/all", getAllTimelines);

export default app;
