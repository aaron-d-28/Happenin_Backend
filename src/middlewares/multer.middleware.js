import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const tempDir = path.resolve(__dirname, "../public/temp");


if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true }); // Creates the directory and any necessary subdirectories
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempDir)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
      console.log("File uploaded temproraily to server in directory :", path.join(tempDir, file.originalname))
    }
  })
  
  export const upload = multer({ storage,})
  // Note You can also send data thrught mutler  for form data 
  //eg router.route('/change-password').patch(upload.none(), changeCurrentPassword);