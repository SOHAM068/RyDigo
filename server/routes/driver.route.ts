import express from "express";
import { getDriverById, getLoggedInDriverData, newRide, sendingOtpToPhone, updateDriverStatus, verifyingEmailOtp, verifyingPhoneOtpForRegistration, verifyPhoneOtpForLogin } from "../controllers/driver.controller";

const driverRouter = express.Router();

driverRouter.post("/send-otp", sendingOtpToPhone);

driverRouter.post("/login", verifyPhoneOtpForLogin);

driverRouter.post("/verify-otp", verifyingPhoneOtpForRegistration);

driverRouter.post("/registration-driver", verifyingEmailOtp);

driverRouter.get("/me", getLoggedInDriverData);

// driverRouter.get("/get-drivers-data", getDriverById);

// driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

// driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);


export default driverRouter;