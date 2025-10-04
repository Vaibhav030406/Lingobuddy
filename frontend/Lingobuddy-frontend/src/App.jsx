import { Routes, Route, Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import HeroPage from "./pages/HeroPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotificationsPage from "./pages/NotificationsPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RecordingsPage from "./pages/RecordingsPage";
import FriendsPage from "./pages/FriendsPage";

import Layout from "./components/Layout";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";
import useAuthUser from "./hooks/useAuthUser";

export default function App() {
  const { isLoading, authUser, refetch } = useAuthUser();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // ✅ Check if coming from Google OAuth redirect
  const isFromGoogleOAuth = location.pathname === "/" && 
    (searchParams.get("authSuccess") || document.referrer.includes("google"));

  // ✅ Force refetch when coming from Google OAuth
  useEffect(() => {
    const checkAuthAfterOAuth = async () => {
      if (isFromGoogleOAuth && !authUser) {
        setIsCheckingAuth(true);
        await refetch();
        setIsCheckingAuth(false);
      }
    };
    
    checkAuthAfterOAuth();
  }, [isFromGoogleOAuth, authUser, refetch]);

  // ✅ Force refetch on app mount
  useEffect(() => {
    queryClient.invalidateQueries(["authUser"]);
  }, [queryClient]);

  // Show loader while checking auth after OAuth redirect
  if (isLoading || isCheckingAuth) return <PageLoader />;

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="flex-grow">
        <Routes>
          {/* ✅ Home Route */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              ) : (
                <HeroPage />
              )
            }
          />

          {/* Auth Routes */}
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <SignupPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} replace />
              )
            }
          />

          {/* Onboarding */}
          <Route
            path="/onboarding"
            element={
              isAuthenticated ? (
                !isOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/edit-profile"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <OnboardingPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace />
              )
            }
          />

          {/* Friends */}
          <Route
            path="/friends"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar>
                  <FriendsPage />
                </Layout>
              ) : (
                <Navigate to={isAuthenticated ? "/onboarding" : "/login"} replace />
              )
            }
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={
              isAuthenticated ? (
                <Layout showSidebar>
                  <NotificationsPage />
                </Layout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Chat & Call */}
          <Route
            path="/chat/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace />
              )
            }
          />
          <Route
            path="/call/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <CallPage />
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace />
              )
            }
          />

          {/* Recordings */}
          <Route
            path="/recordings/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <Layout showSidebar={true}>
                  <RecordingsPage />
                </Layout>
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace />
              )
            }
          />

          {/* Password Recovery */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
      <Toaster />
    </div>
  );
}