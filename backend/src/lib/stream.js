import {StreamChat} from "stream-chat";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    console.error("Stream API key or secret is not defined in the environment variables.");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData)=>{
    try{
        await streamClient.upsertUser(userData);
        return userData;
    }catch(error){
        console.error("Error upserting Stream user:", error);
        throw error;
    }
};
export const generateStreamToken = (userId) => {
    try{
        const userIdString = userId.toString();
        return streamClient.createToken(userIdString);
    }catch(error){
        console.error("Error generating Stream token:", error);
    }
};