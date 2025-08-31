import { useQuery } from '@tanstack/react-query';
import { getAuthUser } from '../lib/api';
 
const useAuthUser = () => {
  const authUserQuery = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle different response formats from backend
  // Your /me endpoint returns user directly, but login/signup might wrap it
  const authUser = authUserQuery.data?.user || authUserQuery.data;

  return { 
    isLoading: authUserQuery.isLoading, 
    authUser: authUser,
    error: authUserQuery.error,
    refetch: authUserQuery.refetch
  };
}

export default useAuthUser;