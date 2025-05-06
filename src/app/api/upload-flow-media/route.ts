import { UploadToCloudinary } from "@/lib/utils/upload_to_cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

// Function to handle API POST request
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const uploadedImages: string[] = [];
        let uploadedVideo: string | null = null;
        const campaignFileId = uuidv4();//formData.get("trxHash") as any as string;
        console.log("Campaign file ID:", campaignFileId);
        const images = formData.getAll("image");

        if (images) {
            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                let imageUrl = await UploadToCloudinary(image as any as File, `campaign_images/${campaignFileId}_${i}`);

                uploadedImages.push(imageUrl as string); // Collect image URLs
            }
        }

        const video = formData.get("video") as File;
        if (video) {
            let res = await UploadToCloudinary(video, `campaign_videos/${campaignFileId}`);

            if (res) {
                uploadedVideo = res as string;
            }
        }
        console.log("Uploaded images:", uploadedImages);
        console.log("Uploaded video:", uploadedVideo);
        // Return the URLs
        return NextResponse.json({
            imageUrls: uploadedImages,
            videoUrl: uploadedVideo,
        });
    } catch (error) {
        console.log("Error uploading media:", error);
        return NextResponse.error();
    }
}
