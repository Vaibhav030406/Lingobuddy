import { signup } from "../lib/api";  
import { useQueryClient, useMutation } from "@tanstack/react-query";

  const useSignup = () =>{
  const queryClient = useQueryClient();
  const { mutate: signupMutation, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });
  return { signupMutation, isPending, error };
}
export default useSignup;