import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export const getRecommendedUsers = async (req, res) => {
    try{
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id: { $ne: currentUserId } }, // Exclude current user
                {_id: { $nin: currentUser.friends } }, // Exclude friends
                { languages: { $in: currentUser.languages } }, // Match languages
                {isOnboarded: true} // Only onboarded users
            ]
        })
        res.status(200).json(recommendedUsers);
    }catch(error){
        console.error("Error fetching recommended users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getFriends = async (req, res) => {
    try{
        const user = User.findById(req.user.id).select("friends").populate("friends", "fullName profilePicture nativeLanguage learningLanguage");

        res.status(200).json(user.friends);

    }catch(error){
        console.error("Error fetching friends:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendFriendRequest = async (req, res) => {
    try{
        const myId = req.user.id;
        const { id: friendId } = req.params;

        //prevent sending friend request to self
        if(myId === friendId){
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }
        const recipient = await User.findById(friendId);
        if(!recipient){
            return res.status(404).json({ message: "Recepiect not found." });
        }
        if(recipient.friends.includes(myId)){
            return res.status(400).json({ message: "You are already friends with this user." });
        }
        const existingRequest = recipient.friendRequest.findOne({
            $or:[
                { sender: myId, recipient: friendId },
                { sender: friendId, recipient: myId },
            ],
        });
        if(existingRequest){
            return res.status(400).json({ message: "Friend request already exist." });
        }

        const friendRequest = await FreindRequest.create({
            sender: myId,
            recipient: friendId,
        });
        res.status(201).json({ success: true, message: "Friend request sent successfully", friendRequest });

    }catch(error){
        console.error("Error sending friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try{
        const {id: requestId} = req.params;
        const friendRequest = await FriendRequest.findById(requestId);
        if(!friendRequest){
            return res.status(404).json({ message: "Friend request not found." });
        }
        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({ message: "You are not authorized to accept this friend request." });
        }
        friendRequest.status = "accepted";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: { friends: friendRequest.recipient }
        });
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        }); 
        res.status(200).json({ success: true, message: "Friend request accepted successfully", friendRequest });
    }
    catch(error){
        console.error("Error accepting friend request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export const getFriendRequests = async (req, res) => {
    try{
        const incomingRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending"
        }).populate("sender", "fullName profilePicture nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: "accepted"
        }).populate("sender", "fullName profilePicture");

        res.status(200).json({ incomingRequests, acceptedRequests });
    }
    catch(error){
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getOutgoingFriendRequests = async (req, res) => {
    try{
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status: "pending"
        }).populate("recipient", "fullName profilePicture nativeLanguage learningLanguage");

        res.status(200).json({ outgoingRequests });
    }
    catch(error){
        console.error("Error fetching outgoing friend requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}