import express from "express";
import { Login, Register, SendAuthOTP, VerifyAuthOTP, GetMe } from "../controller/auth.controller.mjs";
import { verifyToken } from "../middleware/auth.middleware.mjs";

export default function authRoutes(router) {
  router.post("/auth/login", Login);
  router.post("/auth/register", Register);
  router.post("/auth/send-otp", SendAuthOTP);
  router.post("/auth/verify-otp", VerifyAuthOTP);
  router.get("/auth/me", verifyToken, GetMe);
}
