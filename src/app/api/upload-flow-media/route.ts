import { UploadToCloudinary } from "@/lib/utils/upload_to_cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

// Function to handle API POST request
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const uploadedImages: string[] = [];
        const uploadedFiles: string[] = [];
        let uploadedVideo: string | null = null;
        const flowFileId = uuidv4();
        
        const images = formData.getAll("image");

        if (images) {
            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                let imageUrl = await UploadToCloudinary(image as any as File, `flow_images/${flowFileId}_${i}`);

                uploadedImages.push(imageUrl as string); // Collect image URLs
            }
        }

        const video = formData.get("video") as File;
        if (video) {
            let res = await UploadToCloudinary(video, `flow_videos/${flowFileId}`);

            if (res) {
                uploadedVideo = res as string;
            }
        }

        const generalFile = formData.getAll("files") as File[];
        if (generalFile) {
            for (let i = 0; i < generalFile.length; i++) {
                const file = generalFile[i];

                let fileUrl = await UploadToCloudinary(file as any as File, `flow_files/${flowFileId}_${i}`);

                uploadedFiles.push(fileUrl as string); // Collect file URLs
            }
        }

        // Return the URLs
        return NextResponse.json({
            imageUrls: uploadedImages,
            videoUrl: uploadedVideo,
            files: uploadedFiles,
        });
    } catch (error) {
        console.log("Error uploading media:", error);
        return NextResponse.error();
    }
}
