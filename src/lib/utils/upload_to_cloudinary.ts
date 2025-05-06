import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRETS,
});

export const UploadToCloudinary = async (file: File, folder: string) => {
    return new Promise(async (resolve, reject) => {
        cloudinary.uploader.upload(
            await createDataURIFromFile(file),
            {
                resource_type: "auto", // Automatically detect file type (image/video)
                folder: folder, // Upload to a specific folder in Cloudinary
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result?.secure_url); // Return the URL of the uploaded file
            }
        );
    });
};

const createDataURIFromFile = async (file: File): Promise<string> => {
    const fileBuffer = await (file.arrayBuffer());

    const base64Data = fileBuffer
        ? Buffer.from(fileBuffer).toString("base64")
        : "";
    return "data:" + file.type + ";base64," + base64Data;
}