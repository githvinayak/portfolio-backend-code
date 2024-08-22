export const generateToken = (user, message, statusCode, res) => {
  try {
    const token = user.generateJsonWebToken();
    res
      .status(statusCode)
      .cookie("token", token, {
        expires: new Date(
          Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ), // 5 days
        httpOnly: true,
        // sameSite: "None",
        // secure: true,
        // domain: 'https://portfolio-backend-code-yq7b.onrender.com'
      })
      .json({
        success: true,
        message,
        user,
        token,
      });
  } catch (error) {
    console.error("Error in generateToken:", error);
    throw error;
  }
};
