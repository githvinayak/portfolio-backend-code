import express from "express";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./utils/connect.js";
//importing routes
import userRoute from "./routes/user.js";
import messageRoute from "./routes/message.js";
import timelineRoute from "./routes/timeline.js";
import projectRoute from "./routes/project.js";
import skilRoute from "./routes/skill.js";

config({
  path: "./.env",
});

//db connect
const port = process.env.PORT || 3000;
const mongoURI = process.env.DATABASE_URL || "";
dbConnection(mongoURI);
//creating instance of cache
export const myCache = new NodeCache();
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: process.env.PORTFOLIO_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Api is working with /api/v1");
});
//using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/timeline", timelineRoute);
app.use("/api/v1/skill", skilRoute);
app.use("/api/v1/project", projectRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => {
  console.log("server is literning on http://localhost:" + port);
});
