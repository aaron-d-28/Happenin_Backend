import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
      console.log("File uploaded temproraily to server in directory :")
    }
  })
  
  export const upload = multer({ storage,})
  // Note You can also send data thrught mutler  for form data 
  //eg router.route('/change-password').patch(upload.none(), changeCurrentPassword);