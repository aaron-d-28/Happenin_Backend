import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CODE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  }); 


  const uploadonCloudinary = async(LocalFilePath)=>{ 
    try {
        if (!LocalFilePath) return null
        const uploadresult=await cloudinary.uploader.upload(LocalFilePath,{resource_type:"auto",folder:"Happenin"})
  console.log("File has been uploaded successfully!!!!!! ",uploadresult.url)
  fs.unlinkSync(LocalFilePath)
  return uploadresult
    } catch (error) {
        fs.unlink(LocalFilePath)//since an error remove the file in this project runnnin g on server
        console.log("Image or an asset was unable to be installed")
        return null
    }
  }

  const uploadonCloudinary_multiple=async(Multipleimgs)=>{
   try {
    const validFiles = Multipleimgs.filter(Multipleimgs => Multipleimgs.path);
     const multipleuploadpromise=validFiles.map(singleimg=>{
       return cloudinary.uploader.upload(singleimg.path,{
         folder:"Happenin"
       })
     })
     const uploadedimgs=await Promise.all(multipleuploadpromise)

     const uploadedurls=uploadedimgs.map(result=>result.secure_url)

     uploadedurls.forEach(url=>console.log(`Uploaded img:${url}`))
     return uploadedurls
   } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error; // Rethrow error for the caller to handle
 
   }

  }
export {uploadonCloudinary,uploadonCloudinary_multiple}
