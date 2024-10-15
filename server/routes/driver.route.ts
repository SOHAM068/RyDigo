import express from "express";
import { getDriversById, getLoggedInDriverData, newRide, sendingOtpToPhone, updateDriverStatus, verifyingEmailOtp, verifyingPhoneOtpForRegistration, verifyPhoneOtpForLogin } from "../controllers/driver.controller";
import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

driverRouter.post("/send-otp", sendingOtpToPhone);

driverRouter.post("/verify-otp", verifyingPhoneOtpForRegistration);

driverRouter.post("/login", verifyPhoneOtpForLogin);

driverRouter.post("/registration-driver", verifyingEmailOtp);

driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

// driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);


export default driverRouter;