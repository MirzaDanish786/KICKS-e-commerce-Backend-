import multer from "multer";
import path from "path";
import fs from "fs";

 const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Default folder
    let folder = "uploads/general";

    console.log(req.url );
    // If user is signing up or updating profile
    if (req.originalUrl.includes("/auth/signup") || req.url.includes("/profile")) {
      folder = "uploads/users";
    }

    // If uploading product images
    if (req.originalUrl.includes("api/products")) {
      const category = req.body.category || "uncategorized";
      folder = `uploads/products/${category.toLowerCase().replace(/\s+/g, "-")}`;
    }

   
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);  
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);  
    const safeName = path.basename(file.originalname).replace(/\s+/g, "_");  
    const uniqueName = Date.now() + "-" + safeName; 
    cb(null, uniqueName);
  },
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error("Only .jpg, .jpeg, .png images are allowed"));
  }
};

// Export Multer instance
const upload = multer({ storage, fileFilter });

export default upload;
