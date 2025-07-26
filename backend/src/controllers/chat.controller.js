import { generateStreamToken } from "../lib/stream.js"

export const getStreamToken = (req, res) => {
    try{
        const token = generateStreamToken(req.user.id);
        res.status(200).json({ token });
    }catch(error){
        console.error("Error generating stream token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}