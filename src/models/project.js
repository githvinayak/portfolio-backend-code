import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  gitRepoLink: String,
  projectLink: String,
  technologies: [
    {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
    },
  ],
  stack: {
    type: String,
    required: true,
  },
  deployed: String,
  projectBanner: {
    type: String,
    required: true,
  },
});

export const Project = mongoose.model("Project", projectSchema);
