import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  proficiency: {
    type: Number,
  },
  color: {
    type: String,
    required: true,
  },
});

const KnowledgeSchema = new mongoose.Schema({
  frontend: [SkillSchema],
  backend: [SkillSchema],
  devops: [SkillSchema],
});

export const Knowledge = mongoose.model("Knowledge", KnowledgeSchema);
