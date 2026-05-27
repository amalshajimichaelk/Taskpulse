import api from "./api";

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; }
export interface ForgotPasswordPayload { email: string; }
export interface VerifyOTPPayload { email: string; otp: string; }
export interface ResetPasswordPayload { token: string; password: string; }

export const authService = {
  login: (data: LoginPayload) => api.post("/auth/login", data),
  register: (data: RegisterPayload) => api.post("/auth/register", data),
  forgotPassword: (data: ForgotPasswordPayload) => api.post("/auth/forgot-password", data),
  verifyOTP: (data: VerifyOTPPayload) => api.post("/auth/verify-otp", data),
  resetPassword: (data: ResetPasswordPayload) => api.post("/auth/reset-password", data),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data: Partial<{ name: string; bio: string; avatar: string }>) =>
    api.patch("/auth/profile", data),
};
