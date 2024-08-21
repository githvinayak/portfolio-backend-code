import ErrorHandler, { TryCatch } from "../middlewares/error.js";
import { Timeline } from "../models/timeline.js";

export const postTimeline = TryCatch(async (req, res, next) => {
  const { title, description, from, to,location } = req.body;
  const newTimeline = await Timeline.create({
    title,
    description,
    timeline: { from, to },
    location
  });
  res.status(200).json({
    success: true,
    message: "Timeline Added!",
    newTimeline,
  });
});

export const deleteTimeline = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  let timeline = await Timeline.findById(id);
  if (!timeline) {
    return next(new ErrorHandler("Timeline not found", 404));
  }
  await timeline.deleteOne();
  res.status(200).json({
    success: true,
    message: "Timeline Deleted!",
  });
});

export const getAllTimelines = TryCatch(async (req, res, next) => {
  const timelines = await Timeline.find();
  res.status(200).json({
    success: true,
    timelines,
  });
});