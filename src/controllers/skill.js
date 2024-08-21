import ErrorHandler, { TryCatch } from "../middlewares/error.js";
import { Knowledge } from "../models/skill.js";

export const adNewSkill = TryCatch(async (req, res, next) => {
  const { category, skillName, proficiency, imagePath, color } = req.body;

  if (!["frontend", "backend", "devops"].includes(category)) {
    return next(new ErrorHandler("Invalid category", 400));
  }
  const newSkill = { skillName, imagePath, proficiency, color };
  let knowledge = await Knowledge.findOne();
  if (!knowledge) {
    knowledge = new Knowledge({
      frontend: [],
      backend: [],
      devops: [],
    });
  }
  knowledge[category].push(newSkill);
  await knowledge.save();
  res
    .status(201)
    .json({ message: "Skill added successfully", skill: newSkill });
});

export const getAllSkills = TryCatch(async (req, res, next) => {
  const knowledge = await Knowledge.find();
  if (!knowledge) {
    return next(new ErrorHandler("Skill not found", 404));
  }
  res.json({ success: true, knowledge });
});

export const updateSkill = TryCatch(async (req, res, next) => {
  const { category, skillId, name, imagePath, proficiency } = req.body;
  if (!["frontend", "backend", "devops"].includes(category)) {
    return next(new ErrorHandler("Invalid category", 400));
  }

  const result = await Knowledge.findOneAndUpdate(
    { [`${category}._id`]: skillId },
    {
      $set: {
        [`${category}.$.name`]: name,
        [`${category}.$.imagePath`]: imagePath,
        [`${category}.$.proficiency`]: proficiency,
      },
    },
    { new: true }
  );

  if (!result) {
    return next(new ErrorHandler("Skill not found", 404));
  }

  res.json({
    message: "Skill updated successfully",
    updatedSkill: { name, imagePath, proficiency },
  });
});

export const deleteSkill = TryCatch(async (req, res, next) => {
  const { category, skillId } = req.params;

  if (!["frontend", "backend", "devops"].includes(category)) {
    return next(new ErrorHandler("Invalid category", 400));
  }

  const result = await Knowledge.findOneAndUpdate(
    {},
    { $pull: { [category]: { _id: skillId } } },
    { new: true }
  );

  if (!result) {
    return next(new ErrorHandler("Skill not found", 404));
  }

  res.json({ message: "Skill deleted successfully" });
});
