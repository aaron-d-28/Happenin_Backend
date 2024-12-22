import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

const Deletefiles=async(filePaths)=>{
  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const exists = await fs.stat(filePath);
        await fs.unlink(filePath);
        console.log(`Deleted local file: ${filePath}`);
      } catch (unlinkError) {
        console.error(`Failed to delete local file: ${filePath}`, unlinkError);
      }
    })
  );
  
}
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CODE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  }); 


  const uploadonCloudinary = async(LocalFilePath)=>{ 
    try {
      console.log(`File links are for cloudinary:`)
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

    console.log(`File links are for cloudinary:`,Multipleimgs)
    const validFiles = Multipleimgs
    const multipleuploadpromise=validFiles.map(singleimg=>{
      return cloudinary.uploader.upload(singleimg,{
        folder:"Happenin"
      })
    });

    const uploadedimgs=await Promise.all(multipleuploadpromise)

    const uploadedurls=uploadedimgs.map((result)=>result.secure_url)

    uploadedurls.forEach(url=>console.log(`Uploaded img:${url}`))
    
   console.log("Deleting the files due to success")
   Deletefiles(Multipleimgs)
    return uploadedurls
  } catch (error) {
    console.log("Error uploading to Cloudinary:", error); 
     
    console.log("Deleting the files due to failure")
    Deletefiles(Multipleimgs)
    throw error; // Rethrow error for the caller to handle

  }

  }
export {uploadonCloudinary,uploadonCloudinary_multiple}
