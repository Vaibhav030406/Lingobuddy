import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthLoading() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const onboarded = params.get("onboarded");

  useEffect(() => {
    setTimeout(async () => {
      await queryClient.invalidateQueries(["authUser"]);
      navigate(onboarded === "1" ? "/" : "/onboarding");
    }, 500);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-xl">
      Signing you in...
    </div>
  );
}
