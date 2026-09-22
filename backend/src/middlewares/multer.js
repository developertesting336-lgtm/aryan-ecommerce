// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename(req, file, cb) {
//     const ext = path.extname(file.originalname);
//     cb(null, Date.now() + ext);
//   },
// });

// export const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// fileFilter(req, file, cb) {
//   const allowedExtensions = [
//     ".jpg",
//     ".jpeg",
//     ".png",
//     ".webp",
//     ".jfif"
//   ];

//   const ext = path.extname(file.originalname).toLowerCase();

//   if (
//     file.mimetype.startsWith("image/") ||
//     allowedExtensions.includes(ext)
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images allowed"));
//   }
// }
// });

import fs from "fs";
import path from "path";
import multer from "multer";
import crypto from "crypto";

const uploadPath = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

filename: function (req, file, cb) {
  const uniqueName =
    `${crypto.randomUUID()}-${file.originalname}`;  
  cb(null, uniqueName);
}
});

export const upload = multer({ storage }).array("images", 10);