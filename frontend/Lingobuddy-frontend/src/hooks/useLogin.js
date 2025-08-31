import { useQueryClient, useMutation } from "@tanstack/react-query";
import { login } from "../lib/api";
import toast from "react-hot-toast"; // Fixed import

const useLogin = () => {
  const queryClient = useQueryClient();
  
  const { mutate: loginMutation, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login success data:", data);
      toast.success("Login successful!");
      
      // Set the user data immediately to avoid delay
      const userData = data?.user || data;
      if (userData) {
        queryClient.setQueryData(["authUser"], userData);
      }
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    },
  });

  return { loginMutation, isPending, error };
};

export default useLogin;