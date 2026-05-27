import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { sendInviteEmail } from "../utils/email.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-prod";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}
function signRefreshToken(payload: object) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN } as any);
}

// POST /auth/register
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    const tokenPayload = { id: user._id, role: user.role, name: user.name, email: user.email };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user._id });

    await User.findByIdAndUpdate(user._id, { refreshToken: await bcrypt.hash(refreshToken, 10) });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, jobTitle: user.jobTitle, location: user.location },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password!);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const tokenPayload = { id: user._id, role: user.role, name: user.name, email: user.email };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user._id });

    await User.findByIdAndUpdate(user._id, {
      refreshToken: await bcrypt.hash(refreshToken, 10),
      online: true,
    });

    res.json({
      success: true,
      token,
      refreshToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio, jobTitle: user.jobTitle, location: user.location },
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token required" });

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    const tokenPayload = { id: user._id, role: user.role, name: user.name, email: user.email };
    const newToken = signToken(tokenPayload);

    res.json({ success: true, token: newToken, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

// POST /auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null, online: false, lastSeen: new Date() });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

// GET /auth/me
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

// PATCH /auth/profile
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const updateFields: any = {};
    const allowedFields = ["name", "bio", "avatar", "jobTitle", "location"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

// POST /auth/forgot-password
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: "If that email exists, a code was sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });

    // In production: send email here
    console.log(`[OTP] For ${email}: ${otp}`);

    res.json({ success: true, message: "OTP sent to your email", ...(process.env.NODE_ENV !== "production" ? { otp } : {}) });
  } catch (err) {
    next(err);
  }
}

// POST /auth/verify-otp
export async function verifyOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!user || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    await User.findByIdAndUpdate(user._id, { otp: null, otpExpiry: null, isVerified: true });
    const resetToken = jwt.sign({ id: user._id, purpose: "reset" }, JWT_SECRET, { expiresIn: "15m" } as any);

    res.json({ success: true, message: "OTP verified", resetToken });
  } catch (err) {
    next(err);
  }
}

// POST /auth/reset-password
export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body;
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }
    if (decoded.purpose !== "reset") return res.status(400).json({ success: false, message: "Invalid token" });

    const hashed = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    next(err);
  }
}

// PATCH /auth/update-password
export async function updatePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    
    // We cannot change password for demo users
    if (req.user?.id === "000000000000000000000000") {
      return res.status(403).json({ success: false, message: "Cannot change password in Demo Mode" });
    }

    const user = await User.findById(req.user?.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password!);
    if (!valid) return res.status(401).json({ success: false, message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
}

// POST /auth/invite
export async function inviteTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const inviterName = req.user?.name || "A TaskPulse admin";
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;

    await sendInviteEmail({
      toEmail: email,
      toRole: role || "Team Member",
      inviterName,
      appUrl,
    });

    res.json({
      success: true,
      message: `Invitation sent to ${email}`,
    });
  } catch (err: any) {
    // If SMTP is not configured in dev, still return success with a warning
    if (process.env.NODE_ENV !== "production" && err.message?.includes("SMTP not configured")) {
      return res.json({
        success: true,
        message: `Invite logged to console (SMTP not configured). Would send to ${req.body.email}`,
        warning: "Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable real emails.",
      });
    }
    next(err);
  }
}



