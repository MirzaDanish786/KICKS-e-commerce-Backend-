import multer from "multer";
import path from "path";

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // folder where files are saved
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); 
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
