import multer from "multer";
import { v4 as uuid } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    if (file.fieldname === "avatar") {
      callback(null, "uploads/avatars");
    } else if (file.fieldname === "document") {
      callback(null, "uploads/resumes");
    } else if (file.fieldname === "projectBanner") {
      callback(null, "uploads/project-banners");
    } else if (file.fieldname === "technologies") {
      callback(null, "uploads/tech-images");
    } else if (file.fieldname === "imagePath") {
      callback(null, "uploads/skillset-images");
    }
  },
  filename(req, file, callback) {
    const id = uuid();
    const extName = path.extname(file.originalname);
    callback(null, `${id}${extName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type for avatar. Use JPEG or PNG."), false);
    }
  } else if (file.fieldname === "document") {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type for resume. Use PDF or DOC/DOCX."),
        false
      );
    }
  } else if (file.fieldname === "projectBanner" || file.fieldname === "technologies" || file.fieldname === "imagePath") {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/gif") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type for images. Use JPEG, PNG, or GIF."), false);
    }
  } else {
    cb(new Error("Unexpected field"), false);
  }
};

export const uploads = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
}).fields([
  { name: "avatar", maxCount: 5 },
  { name: "document", maxCount: 5 },
  { name: "projectBanner", maxCount: 1 },
  { name: "technologies", maxCount: 10 },
  { name: "imagePath", maxCount: 25 },
]);