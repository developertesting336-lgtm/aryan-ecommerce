import express from "express";

import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../utils/validation.js";
import { upload } from "../middlewares/multer.js";
import { userImage,getAddresses,addAddress,updateAddress,deleteAddress, updateUser, getUserById } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express.Router();

// CREATE
router.patch("/update-user",verifyJWT,updateUser)
// router.post("/addImage",verifyJWT, upload.single("image"),userImage);
router.post("/addImage",verifyJWT, upload,userImage);
router.post("/address", verifyJWT, addAddress);

router.get("/address", verifyJWT, getAddresses);

router.put("/address/:addressId", verifyJWT, updateAddress);

router.delete("/address/:addressId", verifyJWT, deleteAddress);
router.get("/:id",getUserById);

export default router;