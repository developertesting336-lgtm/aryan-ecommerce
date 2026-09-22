import express from "express";
import {
    register,
    login,
    // getUsers,
    getUserById,
    // updateUser,
    // deleteUser
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../utils/validation.js";
const router = express.Router();

// CREATE
router.post("/register",validate(registerSchema), register);
router.post("/login",validate(loginSchema), login);
router.get("/user/:id", getUserById);



export default router;