import { NextFunction, Response } from "express";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

// Middleware to check if user is authenticated
export const isAuthenticated = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Please Log in to access this content!" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    console.log("Received token:", token); // Log token for debugging

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err: any, decoded: any) => {
      if (err) {
        console.error("Token verification error:", err); // Log error details
        return res.status(401).json({ message: "Invalid token" });
      }

      const userData = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = userData; // Attach user data to request
      next();
    });
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Middleware to check if driver is authenticated
export const isAuthenticatedDriver = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Please Log in to access this content!" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    console.log("Received token:", token); // Log token for debugging

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err: any, decoded: any) => {
      if (err) {
        console.error("Token verification error:", err); // Log error details
        return res.status(401).json({ message: "Invalid token" });
      }

      const driverData = await prisma.driver.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!driverData) {
        return res.status(404).json({ message: "Driver not found" });
      }

      req.driver = driverData; // Attach user data to request
      next();
    });
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
