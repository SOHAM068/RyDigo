import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React from "react";
import { useGetUserData } from "@/hooks/useGetUserData";
import NetworkLogger from "react-native-network-logger";

export default function _layout() {
  const { user, loading } = useGetUserData(); // get user data and loading state

  // Show a loading indicator while data is being fetched

  // Render the user data after loading
  return (
    <>
      <View style={{ flex: 1 }}>
        <Text>{user?.name}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
