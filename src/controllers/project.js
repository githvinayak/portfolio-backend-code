import ErrorHandler, { TryCatch } from "../middlewares/error.js";
import { Project } from "../models/project.js";
import { rm } from "fs";

export const addNewProject = TryCatch(async (req, res, next) => {
  if (!req.files || !req.files.projectBanner) {
    return next(new ErrorHandler("Project Banner Image Required!", 400));
  }

  const {
    title,
    description,
    gitRepoLink,
    projectLink,
    stack,
    deployed,
    techNames,
  } = req.body;
  console.log(req.body, req.files);

  if (!title || !description || !stack) {
    return next(new ErrorHandler("Please Provide All Required Details!", 400));
  }

  try {
    const projectBannerPath = req.files.projectBanner[0].path;
    let technologies = [];
    let techNamesArray = Array.isArray(techNames) ? techNames : [techNames];

    console.log("req.files.technologies:", req.files.technologies);
    console.log("techNamesArray:", techNamesArray);

    if (req.files.technologies) {
      if (
        !techNamesArray ||
        techNamesArray.length !== req.files.technologies.length
      ) {
        return next(
          new ErrorHandler(
            "Please provide names for all technology images!",
            400
          )
        );
      }
      technologies = req.files.technologies.map((file, index) => ({
        name: techNamesArray[index],
        image: file.path,
      }));
    }
    console.log(projectBannerPath);

    const project = await Project.create({
      title,
      description,
      gitRepoLink,
      projectLink,
      stack,
      technologies,
      deployed,
      projectBanner: projectBannerPath,
    });
    console.log(project);

    res.status(201).json({
      success: true,
      message: "New Project Added!",
      project,
    });
  } catch (error) {
    // In case of an error, you might want to delete the uploaded files
    // This is optional and depends on your error handling strategy
    return next(new ErrorHandler(error.message, 500));
  }
});

export const updateProject = TryCatch(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new ErrorHandler("Project not found", 404));
  }

  const newProjectData = {
    title: req.body.title || project.title,
    description: req.body.description || project.description,
    stack: req.body.stack || project.stack,
    deployed: req.body.deployed || project.deployed,
    projectLink: req.body.projectLink || project.projectLink,
    gitRepoLink: req.body.gitRepoLink || project.gitRepoLink,
  };

  // Handle project banner update
  if (req.files && req.files.projectBanner) {
    const deleteImage = (imagePath) => {
      rm(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting:`, err);
        } else {
          console.log(`Deleted ${imagePath} successfully.`);
        }
      });
    };
    deleteImage(project.projectBanner);
    newProjectData.projectBanner = req.files.projectBanner[0].path;
  }

  // Handle tech images update
  if (req.files && req.files.techImages) {
    // Remove old tech images
    const deleteImages = (imagesArray) => {
      imagesArray.forEach((imagePath) => {
        rm(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting :`, err);
          } else {
            console.log(`Deleted ${imagePath}  successfully.`);
          }
        });
      });
    };
    deleteImages(project.technologies);
    newProjectData.technologies = req.files.techImages.map((file) => file.path);
  } else if (req.body.technologies) {
    // If new tech image paths are provided without new files
    newProjectData.technologies = req.body.technologies;
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    newProjectData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: "Project Updated!",
    project: updatedProject,
  });
});

export const deleteProject = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    return next(new ErrorHandler("Project not found!", 404));
  }

  try {
    // Delete project banner file
    const deleteImage = (imagePath) => {
      rm(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting:`, err);
        } else {
          console.log(`Deleted ${imagePath} successfully.`);
        }
      });
    };
    deleteImage(project.projectBanner);
    // Delete technology image files
    const deleteImages = (imagesArray) => {
      imagesArray.forEach((imagePath) => {
        rm(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting :`, err);
          } else {
            console.log(`Deleted ${imagePath}  successfully.`);
          }
        });
      });
    };
    deleteImages(project.technologies);
    // Delete the project from the database
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project Deleted!",
    });
  } catch (error) {
    return next(new ErrorHandler("Error deleting project files", 500));
  }
});

export const getAllProjects = TryCatch(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(process.env.PRODUCT_PER_PAGE) || 5;
  const skip = (page - 1) * limit;

  const totalProjects = await Project.countDocuments();
  const projects = await Project.find().skip(skip).limit(limit);

  res.status(200).json({
    success: true,
    projects,
    currentPage: page,
    totalPages: Math.ceil(totalProjects / limit),
    hasMore: page * limit < totalProjects,
  });
});

export const getSingleProject = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
});
