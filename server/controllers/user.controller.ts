require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../app";
import { sendToken } from "../utils/sendToken";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken, {
  lazyLoading: true,
});

// register new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    try {
      await client.verify.v2
        ?.services(process.env.TWILIO_SERVICE_SID!)
        .verifications.create({
          channel: "sms",
          to: phone_number,
        });

      res.status(201).json({
        success: true,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
    });
  }
};

// verify otp
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;

    // Ensure phone_number and otp are provided
    if (!phone_number || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required.",
      });
    }

    try {
      // Verify OTP using Twilio service
      const verificationCheck = await client.verify.v2
        .services(process.env.TWILIO_SERVICE_SID!)
        .verificationChecks.create({
          to: phone_number,
          code: otp,
        });

      // Check if OTP is valid
      if (verificationCheck.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again.",
        });
      }

      // is user exist
      const isUserExist = await prisma.user.findUnique({
        where: {
          phone_number,
        },
      });

      if (isUserExist) {
        // Send token if user exists
        await sendToken(isUserExist, res);
      } else {
        // Create account if user doesn't exist
        const user = await prisma.user.create({
          data: {
            phone_number: phone_number,
          },
        });
        await sendToken(user, res); // Send token after creating new user


        res.status(200).json({
          success: true,
          message: "OTP verified successfully! User account created.",
          user: user,
        });
      }
    } catch (error: any) {
      // Improved error handling
      console.error('Error during OTP verification:', error);

      const errorMessage = error?.message || 'Something went wrong!';

      res.status(400).json({
        success: false,
        message: errorMessage,
        error: error?.moreInfo || null, // Twilio provides moreInfo in some cases
      });
    }
  } catch (error: any) {
    // Log general error and respond
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// send OTP to user email
export const sendOtpToEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, userId } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP code (1000-9999)

    const user = {
      userId,
      name,
      email
    };
    const token = jwt.sign({
      user, otp
    },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m"
      }
    );

    try {
      await nylas.messages.send({
        identifier: process.env.USER_GRANT_ID!, // User grant ID from Nylas dashboard
        requestBody: {
          to: [{ name: name, email: email }],
          subject: "Email Activation for RyDigo",
          body: `
            <p>Hi ${name},</p>
            <p>Hi Thank you for signing up,</p>
            <p>Your RyDigo verification code is ${otp}. If you didn't request for this OTP, please ignore this email!</p>
            <p>Thanks,<br>RyDigo Team</p>
          `
        }
      });
      res.status(200).json({
        success: true,
        message: "OTP sent to email successfully",
        token
      })
    } catch (err: any) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// verify OTP sent to email
export const verifyEmailOtp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp, token } = req.body;

    if (!otp || !token) {
      return res.status(400).json({
        success: false,
        message: "OTP and token are required."
      })
    }

    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );
    if (newUser.otp != otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or Expired"
      })
    }

    const { name, email, userId } = newUser.user; // Destructure user object from token payload to get name, email, and userId values
    console.log("newUser.user : ", newUser.user);

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    if (user?.email === null) {
      const updatedUser = await prisma.user.update({
        where: {
          id: userId
        },
        data: {
          email: email,
          name: name
        }
      })
      await sendToken(updatedUser, res);
    }
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

// get logged in user data
export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}