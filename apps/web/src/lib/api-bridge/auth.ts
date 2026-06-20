/**
 * SoloCorp POS — Auth Bridge Module
 * ===================================
 * Authentication endpoints — จัดการ login/logout/verify
 * ใช้ JWT cookie ที่ PHP Backend ส่งกลับมา
 *
 * @phase 1
 * @module api-bridge/auth
 */

import { client } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  VerifyResponse,
  LogoutResponse,
} from "./types";

export interface AuthModule {
  /** ล็อกอินด้วย username + password → PHP sets httpOnly cookie */
  login(data: LoginRequest): Promise<LoginResponse>;

  /** ตรวจสอบว่า JWT token ยัง valid หรือไม่ */
  verify(): Promise<VerifyResponse>;

  /** Logout + revoke token */
  logout(): Promise<LogoutResponse>;

  /** ตรวจสอบสถานะล็อกอิน (สะดวกใช้จาก client) */
  isAuthenticated(): Promise<boolean>;
}

export const authApi: AuthModule = {
  login: (data) =>
    client.post<LoginResponse>("/auth/login", data, {
      // Login needs extended timeout
      timeout: 15000,
    }),

  verify: () => client.post<VerifyResponse>("/auth/verify"),

  logout: () => client.post<LogoutResponse>("/auth/logout"),

  isAuthenticated: async () => {
    try {
      const res = await client.post<VerifyResponse>("/auth/verify");
      return res.valid === true;
    } catch {
      return false;
    }
  },
};
