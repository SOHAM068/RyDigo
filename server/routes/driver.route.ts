import express from "express";
import { getAllRides, getDriversById, getLoggedInDriverData, newRide, sendingOtpToPhone, updateDriverStatus, updatingRideStatus, verifyingEmailOtp, verifyingPhoneOtpForRegistration, verifyPhoneOtpForLogin } from "../controllers/driver.controller";
import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

driverRouter.post("/send-otp", sendingOtpToPhone);

driverRouter.post("/verify-otp", verifyingPhoneOtpForRegistration);

driverRouter.post("/login", verifyPhoneOtpForLogin);

driverRouter.post("/registration-driver", verifyingEmailOtp);

driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);

driverRouter.put(
  "/update-ride-status",
  isAuthenticatedDriver,
  updatingRideStatus
);

driverRouter.get("/get-rides", isAuthenticatedDriver, getAllRides);


export default driverRouter;