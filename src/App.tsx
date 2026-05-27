/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Auth Pages
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { OTPVerification } from "./pages/OTPVerification";

// Dashboard Pages
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Team } from "./pages/Team";
import { Settings } from "./pages/Settings";
import { Calendar } from "./pages/Calendar";
import { Projects } from "./pages/Projects";
import { Analytics } from "./pages/Analytics";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";

import { useEffect } from "react";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";
import api from "./services/api";

export default function App() {
  const isDark = useThemeStore((state) => state.isDark);
  const { isAuthenticated, token, setUser } = useAuthStore();

  // Apply theme on mount/change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // On startup, refresh the full user profile from DB (picks up jobTitle, location, bio, etc.)
  useEffect(() => {
    if (isAuthenticated && token && token !== "demo-token") {
      api.get("/auth/me")
        .then((res) => {
          if (res.data?.user) setUser(res.data.user);
        })
        .catch(() => {}); // silently ignore — cached store data is fine as fallback
    }
  }, [isAuthenticated, token]);
  return (
    <Router>
      <Routes>
        {/* ── Public / Auth Routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<OTPVerification />} />

        {/* ── Protected Dashboard Routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="team" element={<Team />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
