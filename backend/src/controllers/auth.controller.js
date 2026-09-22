import { User } from "../models/index.js"
import { ApiError,ApiResponse } from "../utils/apiResponse.js";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import {sendEmailtoUser} from "../utils/mail.js"
export const register =async(req,res)=>{
    try {
            console.log("Register API hit");

        const {email,firstName,lastName,password,role}= req.body;
        const user = await User.findOne({email});
        
     if (user) {
  throw new ApiError(409, "User already exists");
}
         const newUser = await User.create({
      email,
      firstName,
      lastName,
      password,
      role
    });

        return res.status(200).json(
new ApiResponse(201,{newUser}, "User registered successfully"));
    } catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}

export const login=async(req,res)=>{
 try {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw new ApiError(409, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
  throw new ApiError(409, "password is incorrect");
}

const token = jwt.sign(
  {
    _id: user._id,
    email: user.email,
    role: user.role
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: "1d",
  }
);

return res.status(200).json(
  new ApiResponse(
    200,
    {
      user,
      token,
    },
    "User login successfully"
  )
);
 } catch (error) {
     console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
 }
}


export const getUserById = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }    
    
   
           return res.status(200).json(
new ApiResponse(200,{user}, "User fetched successfully"));
} catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}


