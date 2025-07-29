import instance from "./axios";

export const signup = async (signupData) => {
  const response = await instance.post("/auth/signup", signupData);
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const response = await instance.get("/auth/me");
    return response.data;
  } catch (error) {
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
