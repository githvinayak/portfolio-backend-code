import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import { uploads } from "../middlewares/multer.js";
import {
  adNewSkill,
  deleteSkill,
  getAllSkills,
  updateSkill,
} from "../controllers/skill.js";

const app = express.Router();

app.post("/add", isAuthenticated, uploads, adNewSkill);
app.delete("/delete/:id", isAuthenticated, deleteSkill);
app.put("/update/:id", isAuthenticated, uploads, updateSkill);
app.get("/all", getAllSkills);

export default app;
