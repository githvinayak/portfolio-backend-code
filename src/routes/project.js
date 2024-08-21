import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploads } from "../middlewares/multer.js";
import {
  addNewProject,
  deleteProject,
  getAllProjects,
  getSingleProject,
  updateProject,
} from "../controllers/project.js";

const app = express.Router();

app.post("/add", isAuthenticated, uploads, addNewProject);
app.delete("/delete/:id", isAuthenticated, deleteProject);
app.put("/update/:id", isAuthenticated, uploads, updateProject);
app.get("/all", getAllProjects);
app.get("/get/:id", getSingleProject);

export default app;
