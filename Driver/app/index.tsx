import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode} from "jwt-decode"; 

interface DecodedToken {
  exp: number;
}

export default function index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkTokenValidity = async (): Promise<boolean> => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        // console.log("accessToken (index.ts): ", accessToken);
        if (!accessToken) return false;

        const decodedToken = jwtDecode<DecodedToken>(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        return decodedToken.exp > currentTime;
      } catch (error) {
        console.log("Error checking token validity", error);
        return false;
      }
    };

    const updateAuthStatus = async () => {
      const isTokenValid = await checkTokenValidity();
      if (isTokenValid) {
        setIsLoggedIn(true);
      } else {
        await AsyncStorage.removeItem("accessToken");
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    updateAuthStatus();

    const intervalId = setInterval(updateAuthStatus, 60000); // Check every minute if the token is still valid and update the auth status accordingly
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (isLoading) {
    return null;
  }

  return <Redirect href={!isLoggedIn ? "/(routes)/Login" : "/(tabs)/home"} />;
}
