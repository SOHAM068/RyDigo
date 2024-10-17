require("dotenv").config();
import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { nylas } from "../app";
import { sendToken } from "../utils/sendToken";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
    lazyLoading: true // lazy loading is enabled to reduce the time it takes to load the Twilio client library when the application starts
});

// sending otp to the driver phone number
export const sendingOtpToPhone = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { phone_number } = req.body;
        console.log("phone_number (server): ", phone_number);
        try {
            await client.verify.v2
                ?.services(process.env.TWILIO_SERVICE_SID!)
                .verifications.create({
                    channel: "sms",
                    to: phone_number,
                })

            res.status(201).json({
                success: true,
            })
        } catch (err: any) {
            console.log(err);
            res.status(400).json({
                success: false,
            });
        }
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
        });
    }
}

// verifying the otp for login
export const verifyPhoneOtpForLogin = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { phone_number, otp } = req.body;

        try {
            await client.verify.v2
                ?.services(process.env.TWILIO_SERVICE_SID!)
                .verificationChecks.create({
                    to: phone_number,
                    code: otp,
                })

            const driver = await prisma.driver.findUnique({ // find the driver by phone number
                where: {
                    phone_number: phone_number
                }
            });

            sendToken(driver, res);
        } catch (err: any) {
            console.log(err);
            res.status(400).json({
                success: false,
                message: "Something went wrong!",
            });
        }
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// verifying phone otp for registration
export const verifyingPhoneOtpForRegistration = async (
    req: Request,
    res: Response,
) => {
    try {
        const { phone_number, otp } = req.body;

        try {
            await client.verify.v2
                ?.services(process.env.TWILIO_SERVICE_SID!)
                .verificationChecks.create({
                    to: phone_number,
                    code: otp,
                })

            await sendingOtpToEmail(req, res);
        } catch (err: any) {
            console.log(err);
            res.status(400).json({
                success: false,
                message: "Something went wrong!",
            });
        }
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// sending otp to email
export const sendingOtpToEmail = async (
    req: Request,
    res: Response,
) => {
    try {
        const {
            name,
            email,
            phone_number,
            country,
            vehicle_type,
            registration_number,
            registration_date,
            driving_license,
            vehicle_color,
            rate
        } = req.body;

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const driver = {
            name,
            email,
            phone_number,
            country,
            vehicle_type,
            registration_number,
            registration_date,
            driving_license,
            vehicle_color,
            rate,
            otp
        };

        const token = jwt.sign(
            {
                driver,
                otp
            },
            process.env.EMAIL_ACTIVATION_SECRET!,
            {
                expiresIn: "5m"
            }
        );

        try {
            await nylas.messages.send({
                identifier: process.env.USER_GRANT_ID!,
                requestBody: {
                    to: [{ name: name, email: email }],
                    subject: "Email Activation for RyDigo",
                    body: `
                        <p>Hi ${name},</p>
                        <p>Thank you for signing up,</p>
                        <p>Your RyDigo verification code is ${otp}. If you didn't request for this OTP, please ignore this email!</p>
                        <p>Thanks,<br>RyDigo Team</p>
                    `
                }
            })
            res.status(200).json({
                success: true,
                message: "OTP sent to email successfully",
                token
            })
        } catch (err: any) {
            console.log(err);
            res.status(400).json({
                success: false,
                message: err.message,
            });
        }
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// verifying email otp and creating driver account
export const verifyingEmailOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { otp, token } = req.body;

        const newDriver: any = jwt.verify(
            token,
            process.env.EMAIL_ACTIVATION_SECRET!
        );

        if (newDriver.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is not correct or expired!",
            });
        }

        const {
            name,
            country,
            phone_number,
            email,
            vehicle_type,
            registration_number,
            registration_date,
            driving_license,
            vehicle_color,
            rate,
        } = newDriver.driver;

        const driver = await prisma.driver.create({
            data: {
                name,
                country,
                phone_number,
                email,
                vehicle_type,
                registration_number,
                registration_date,
                driving_license,
                vehicle_color,
                rate,
            }
        });

        sendToken(driver, res);
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// get logged in driver data
export const getLoggedInDriverData = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const driver = req.driver;

        res.status(200).json({
            success: true,
            driver,
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// update driver status
export const updateDriverStatus = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status } = req.body;

        const driver = await prisma.driver.update({
            where: {
                id: req.driver.id!,
            },
            data: {
                status
            }
        });

        res.status(200).json({
            success: true,
            driver,
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// get drivers data with id
export const getDriversById = async (req: Request, res: Response) => {
    try {
        const { ids } = req.query as any;
        console.log(ids, 'ids')
        if (!ids) {
            return res.status(400).json({ message: "No driver IDs provided" });
        }

        const driverIds = ids.split(",");

        // Fetch drivers from database
        const drivers = await prisma.driver.findMany({
            where: {
                id: { in: driverIds },
            },
        });

        res.json(drivers);
    } catch (error) {
        console.error("Error fetching driver data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// creating new ride
export const newRide = async (
    req: any,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            userId,
            charge,
            status,
            currentLocationName,
            destinationLocationName,
            distance,
        } = req.body;

        const newRide = await prisma.rides.create({
            data: {
                userId,
                charge: parseFloat(charge),
                status,
                currentLocationName,
                destinationLocationName,
                distance,
                driverId: req.driver.id,
            }
        });

        res.status(201).json({
            success: true,
            newRide,
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// updating ride status
export const updatingRideStatus = async (req: any, res: Response) => {
    try {
        const { rideId, rideStatus } = req.body;

        // Validate input
        if (!rideId || !rideStatus) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid input data" });
        }

        const driverId = req.driver?.id;
        if (!driverId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Fetch the ride data to get the rideCharge
        const ride = await prisma.rides.findUnique({
            where: {
                id: rideId,
            },
        });

        if (!ride) {
            return res
                .status(404)
                .json({ success: false, message: "Ride not found" });
        }

        const rideCharge = ride.charge;

        // Update ride status
        const updatedRide = await prisma.rides.update({
            where: {
                id: rideId,
                driverId,
            },
            data: {
                status: rideStatus,
            },
        });

        if (rideStatus === "Completed") {
            // Update driver stats if the ride is completed
            await prisma.driver.update({
                where: {
                    id: driverId,
                },
                data: {
                    totalEarning: {
                        increment: rideCharge,
                    },
                    totalRides: {
                        increment: 1,
                    },
                },
            });
        }

        res.status(201).json({
            success: true,
            updatedRide,
        });
    } catch (error: any) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// getting drivers rides
export const getAllRides = async (req: any, res: Response) => {
    const rides = await prisma.rides.findMany({
        where: {
            driverId: req.driver?.id,
        },
        include: {
            driver: true,
            user: true,
        },
    });
    res.status(201).json({
        rides,
    });
};
