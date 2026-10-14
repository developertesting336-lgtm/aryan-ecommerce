import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiResponse.js";
import { User } from "../models/index.js";

export const verifyJWT = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // Find user from decoded id
    const user = await User.findById(decoded._id)
      .select("-password");

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid token");
  }
};


export const verifyAdmin = async (req,res,next)=>{
  try {
    if(req.user.role==="admin"){
     return next();
    }
      throw new ApiError(401,  "You are not Authrised")
  } catch (error) {
     throw new ApiError(401, error?.message);
  }
}