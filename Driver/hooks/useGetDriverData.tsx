import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const useGetDriverData = () => {
  const [driver, setDriver] = useState<DriverType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInDriverData = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      console.log("accessToken (useGetDriverData): ", accessToken);

      await axios
        .get(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          setDriver(res.data.driver); // set the driver data to the state
          setLoading(false);
        })
        .catch((err) => {
          console.log("Error getting driver data: ", err);
          setLoading(false);
        });
    };
    loggedInDriverData();
  }, []);

  return { driver, loading };
};
