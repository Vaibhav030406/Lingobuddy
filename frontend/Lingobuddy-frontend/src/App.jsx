import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
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
  const { isLoading, authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // ✅ Force refetch on app mount (important after Google redirect)
  useEffect(() => {
    queryClient.invalidateQueries(["authUser"]);
  }, [queryClient]);

  // ✅ Optional: force refetch if redirected after Google OAuth
  useEffect(() => {
    if (searchParams.get("authSuccess")) {
      queryClient.invalidateQueries(["authUser"]);
    }
  }, [searchParams, queryClient]);

  if (isLoading) return <PageLoader />;

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
                  <Navigate to="/onboarding" />
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
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={isOnboarded ? "/" : "/onboarding"} />
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
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/login" />
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
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
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
                <Navigate to={isAuthenticated ? "/onboarding" : "/login"} />
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
                <Navigate to="/login" />
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
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/call/:id"
            element={
              isAuthenticated && isOnboarded ? (
                <CallPage />
              ) : (
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
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
                <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
              )
            }
          />

          {/* Password Recovery */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}
