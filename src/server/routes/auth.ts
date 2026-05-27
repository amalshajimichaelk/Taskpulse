import express from "express";
import {
  register, login, refresh, logout, getMe, updateProfile,
  forgotPassword, verifyOTP, resetPassword, updatePassword, inviteTeamMember
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/profile", protect, updateProfile);
router.patch("/update-password", protect, updatePassword);
router.post("/invite", protect, inviteTeamMember);

export default router;
