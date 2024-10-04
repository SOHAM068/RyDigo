import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";

export const useGetUserData = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLoggedInUserData = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (!accessToken) {
          // Handle missing token (e.g., redirect to login)
          setLoading(false);
          return;
        }

        const response = await axios.get(`${process.env.EXPO_PUBLIC_SERVER_URI}/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(response.data.user);
      } catch (error: any) {
        console.log('Error fetching user data:', error);

        // Check if the error indicates that the token has expired
        if (error.response && error.response.status === 401) {
          // Handle token expiration (e.g., redirect to login or refresh token)
          console.warn('Token expired. Please log in again.');
        }
      } finally {
        setLoading(false);
      }
    };

    getLoggedInUserData();
  }, []);

  return { loading, user };
};
