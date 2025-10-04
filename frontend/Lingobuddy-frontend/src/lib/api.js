import instance from "./axios";

export const signup = async (signupData) => {
  const response = await instance.post("/auth/signup", signupData);
  return response.data;
};

// 💡 FIX: Ensure consistent export definition
export const getAuthUser = async () => {
  try {
    const response = await instance.get("/auth/me");
    return response.data;
  } catch (error) {
    // Return null on authentication error (e.g., no cookie)
    return null;
  }
};

export const completeOnboarding = async (onboardingData) => {
  const response = await instance.post("/auth/onboarding", onboardingData);
  return response.data;
};

export const login = async (logindata) => {
  const response = await instance.post("/auth/login", logindata);
  return response.data;
};

export const logout = async () => {
  const response = await instance.post("/auth/logout");
  return response.data;
};

export async function getUserFriends() {
  const response = await instance.get("/user/friends");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await instance.get("/user");
  return response.data;
}

export async function getOutgoingFriendReqs() {
  const response = await instance.get("/user/outgoing-friend-request");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await instance.post(`/user/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await instance.get("/user/friend-request");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await instance.put(`/user/friend-request/${requestId}/accept`);
  return response.data;
}

export async function getStreamToken() {
  const response = await instance.get("/chat/token");
  return response.data;
}

// API functions for call recording
export const startCallRecording = async (callId) => {
  const response = await instance.post(`/chat/call/${callId}/start-recording`);
  return response.data;
};

export const stopCallRecording = async (callId) => {
  const response = await instance.post(`/chat/call/${callId}/stop-recording`);
  return response.data;
};

export const fetchCallRecordings = async (callId) => {
  const response = await instance.get(`/chat/call/${callId}/recordings`);
  return response.data;
};

// Updated to send session and filename in request body
export const deleteCallRecording = async ({ callId, recordingId, session, filename }) => {
  const response = await instance.delete(`/chat/call/${callId}/recordings/${recordingId}`, {
    data: { session, filename }
  });
  return response.data;
};

export const renameCallRecording = async ({ callId, recordingId, newName }) => {
  const response = await instance.put(`/chat/call/${callId}/recordings/${recordingId}/rename`, {
    newName
  });
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await instance.put("/auth/profile", profileData);
  return response.data;
};
