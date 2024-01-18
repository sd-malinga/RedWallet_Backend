import dotenv from "dotenv";
import { ThirdwebStorage } from "@thirdweb-dev/storage";

dotenv.config();

// Instantiate the Thirdweb IPFS storage
const storage = new ThirdwebStorage({
  secretKey:
    "LMgSm3vldkBGdtpBx7NvIhYBqsZmsXxsMLV6qnWrSIw8lqBZjq9TmgSl4ihcW5POv9SMAqfTuLFbK4S_FnR2mg",
});

export const UploadtoThirdweb = async (json, imageLink) => {
  try {
    const outputData = {
      image: imageLink,
      attributes: Object.entries(json).map(([trait_type, value]) => ({
        trait_type,
        value,
      })),
    };
    console.log(outputData);
    // Get the IPFS URI of where the metadata has been uploaded
    const uri = await storage.upload(outputData);
    // Log the URL and return it
    return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  } catch (error) {
    console.error("Error uploading file to Thirdweb.", error);
  }
};
