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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // ✅ Check if coming from Google OAuth redirect
  const authSuccess = searchParams.get("authSuccess");
  const tokenFromUrl = searchParams.get("token");

  // ✅ Handle Google OAuth redirect with proper async flow
  useEffect(() => {
    const handleOAuthRedirect = async () => {
      if (authSuccess === "true") {
        console.log("OAuth redirect detected, refetching user...");
        setIsCheckingAuth(true);
        
        // ✅ CRITICAL: Store token from URL to localStorage
        if (tokenFromUrl) {
          console.log("Storing token from URL to localStorage");
          localStorage.setItem('authToken', tokenFromUrl);
        }
        
        // Wait a bit for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Force refetch user data
        await queryClient.invalidateQueries(["authUser"]);
        await refetch();
        
        // Clear the authSuccess and token params from URL
        searchParams.delete("authSuccess");
        searchParams.delete("token");
        setSearchParams(searchParams, { replace: true });
        
        setIsCheckingAuth(false);
      }
    };
    
    handleOAuthRedirect();
  }, [authSuccess, tokenFromUrl, refetch, queryClient, searchParams, setSearchParams]);

  // Show loader while checking auth after OAuth redirect or during initial load
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