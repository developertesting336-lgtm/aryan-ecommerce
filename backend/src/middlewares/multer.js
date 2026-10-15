
// import fs from "fs";
// import path from "path";
// import multer from "multer";
// import crypto from "crypto";

// const uploadPath = path.join(process.cwd(), "public", "temp");

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },

// filename: function (req, file, cb) {
//   const uniqueName =
//     `${crypto.randomUUID()}-${file.originalname}`;  
//   cb(null, uniqueName);
// }
// });

// export const upload = multer({ storage }).array("images", 10);

// export const uploadMedia = multer({
//   storage,

//   limits: {
//     fileSize: 50 * 1024 * 1024, // 50 MB per file
//   },

//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype.startsWith("image/") ||
//       file.mimetype.startsWith("video/")
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image and video files are allowed!"), false);
//     }
//   },
// }).fields([
//   { name: "images", maxCount: 10 },
//   { name: "videos", maxCount: 5 },
// ]);




import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import crypto from "node:crypto";

// Use Vercel's writable temporary directory in production.
// Use public/temp for local development.
const uploadPath = process.env.VERCEL
  ? "/tmp/uploads"
  : path.join(process.cwd(), "public", "temp");

// Create the directory if it does not exist.
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      `${crypto.randomUUID()}-${path.basename(file.originalname)}`;

    cb(null, uniqueName);
  },
});

// Multiple image uploads: maximum 10 images.
export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
}).array("images", 10);

// Image and video uploads.
export const uploadMedia = multer({
  storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"));
    }
  },
}).fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);
