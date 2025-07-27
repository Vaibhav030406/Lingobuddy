import instance from "./axios";

export const signup = async (signupData) => {
  const response = await instance.post("/auth/signup", signupData);
  return response.data;
};

export const getAuthUser = async () => {
  try{
  const response = await instance.get("/auth/me");
  return response.data;
  }
  catch (error) {
    return null;
  }
};

export const completeOnboarding = async (onboardingData) => {
  const response = await instance.post("/auth/onboarding", onboardingData);
  return response.data;
};

export const login = async (logindata) =>{
  const response = await instance.post("/auth/login", logindata);
  return response.data;
}

export const logout = async () =>{
  const response = await instance.post("/auth/logout");
  return response.data;
}