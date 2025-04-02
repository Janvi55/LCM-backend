const cloundinary = require("cloudinary").v2;


const uploadFileToCloudinary = async (file) => {

    //conif
        cloundinary.config({
        cloud_name:"dewtebubz",
        api_key:"738444617725835",
        api_secret:"AiCF_wOy3e71x-bbLshgLC1SKNU"
    })

    const cloundinaryResponse = await cloundinary.uploader.upload(file.path);
    return cloundinaryResponse;



};
module.exports = {
    uploadFileToCloudinary
}