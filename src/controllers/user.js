import ErrorHandler, { TryCatch } from "../middlewares/error.js";
import crypto from "crypto";
import { User } from "../models/user.js";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendMail.js";

export const register = TryCatch(async (req, res, next) => {
  const avatar = req.files?.avatar?.[0];
  const document = req.files?.document?.[0];

  if (!avatar || !document) {
    return next(new ErrorHandler("Both avatar and resume are required", 400));
  }

  const {
    name,
    email,
    phone,
    aboutMe,
    password,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    linkedInURL,
    stats,
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !aboutMe ||
    !password ||
    !portfolioURL ||
    !stats ||
    !Array.isArray(stats) ||
    stats.length !== 3
  ) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const validatedStats = stats.map((stat) => {
    if (
      !stat.heading ||
      typeof stat.heading !== "string" ||
      !stat.value ||
      isNaN(Number(stat.value))
    ) {
      throw new ErrorHandler("Invalid stats format", 400);
    }
    return {
      heading: stat.heading,
      value: Number(stat.value),
    };
  });

  let user = await User.findOne({ email });
  if (user) {
    return res.status(200).json({
      success: true,
      message: `User with this email already exists`,
    });
  }

  user = await User.create({
    ...req.body,
    avatar: avatar.path,
    document: document.path,
    stats: validatedStats,
  });

  generateToken(user, "Registered successfully!", 201, res);
});

export const login = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Provide Email And Password!", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password!", 404));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password", 401));
  }
  generateToken(user, "Login Successfully!", 200, res);
});

export const logout = TryCatch(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      sameSite: "None",
      secure: true,
    })
    .json({
      success: true,
      message: "Logged Out!",
    });
});

export const getUser = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = TryCatch(async (req, res, next) => {
  const avatar = req.files?.avatar?.[0];
  const document = req.files?.document?.[0];

  const {
    name,
    email,
    phone,
    aboutMe,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    linkedInURL,
  } = req.body;

  if (!name || !email || !phone || !aboutMe || !portfolioURL) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const newUserData = {
    name,
    email,
    phone,
    aboutMe,
    portfolioURL,
    githubURL,
    instagramURL,
    twitterURL,
    linkedInURL,
  };

  // Handle avatar update
  if (avatar) {
    const user = await User.findById(req.user.id);
    // If there's an existing avatar, you might want to delete it here
    // await deleteFile(user.avatar);
    newUserData.avatar = avatar.path;
  }

  // Handle document (resume) update
  if (document) {
    const user = await User.findById(req.user.id);
    // If there's an existing document, you might want to delete it here
    // await deleteFile(user.document);
    newUserData.document = document.path;
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully!",
    user,
  });
});

export const updatePassword = TryCatch(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return next(new ErrorHandler("Please Fill All Fields.", 400));
  }
  const isPasswordMatched = await user.comparePassword(currentPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Incorrect Current Password!"));
  }
  if (newPassword !== confirmNewPassword) {
    return next(
      new ErrorHandler("New Password And Confirm New Password Do Not Match!")
    );
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Updated!",
  });
});

export const getUserForPortfolio = TryCatch(async (req, res, next) => {
  const id = "66c100a30b2a78f1a9a18176";
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    user,
  });
});

//FORGOT PASSWORD
export const forgotPassword = TryCatch(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.PORTFOLIO_URL}/password/reset/${resetToken}`;

  const message = `Your Reset Password Token is:- \n\n ${resetPasswordUrl}  \n\n If 
  You've not requested this email then, please ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Personal Portfolio Dashboard Password Recovery`,
      message,
    });
    res.status(201).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//RESET PASSWORD
export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset password token is invalid or has been expired.",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password & Confirm Password do not match"));
  }
  user.password = await req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  generateToken(user, "Reset Password Successfully!", 200, res);
});
