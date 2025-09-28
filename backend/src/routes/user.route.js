import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getRecommendedUsers, getFriends,sendFriendRequest,acceptFriendRequest, getFriendRequests, getOutgoingFriendRequests} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/",getRecommendedUsers);
router.get("/friends",getFriends);

router.post("/friend-request/:id",sendFriendRequest);
router.put("/friend-request/:id/accept",acceptFriendRequest);
router.get("/friend-request",getFriendRequests);
router.get("/outgoing-friend-request",getOutgoingFriendRequests);
export default routers;