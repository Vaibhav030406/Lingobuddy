import { signup } from "../lib/api";  
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useSignup = () => {
  const queryClient = useQueryClient();
  
  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log("Signup success data:", data);
      toast.success("Account created successfully!");
      
      // Set the user data immediately to avoid delay
      const userData = data?.user || data;
      if (userData) {
        queryClient.setQueryData(["authUser"], userData);
      }
      
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.message || "Failed to create account. Please try again.");
    },
  });
  
  return { signupMutation, isPending, error };
}

export default useSignup;