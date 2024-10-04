import express, { Request } from "express";
import {
  getLoggedInUserData,
  registerUser,
  sendOtpToEmail,
  verifyEmailOtp,
  verifyOtp,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/sendToken";
require("dotenv").config();

const userRouter = express.Router();

userRouter.post("/registration", registerUser);

userRouter.post("/verify-otp", verifyOtp);

userRouter.post("/email-otp-request", sendOtpToEmail)

userRouter.put("/email-otp-verify", verifyEmailOtp)

userRouter.get("/me", isAuthenticated, getLoggedInUserData)


export default userRouter;
