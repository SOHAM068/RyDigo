import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import color from "@/themes/app.colors";
import { Car, CarPrimary, Category, Home, HomeLight } from "@/utils/IconsUtils";
import { Person } from "@/assets/icons/person";

export default function _layout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === "home") {
              if (focused) {
                iconName = (
                  <Home colors={color.buttonBg} width={24} height={24} />
                );
              } else {
                iconName = <HomeLight />;
              }
            } else if (route.name === "ServicesTab") {
              iconName = (
                <Category colors={focused ? color.buttonBg : "#8F8F8F"} />
              );
            } else if (route.name === "HistoryTab") {
              if (focused) {
                iconName = <CarPrimary color={color.buttonBg} />;
              } else {
                iconName = <Car colors={"#8F8F8F"} />;
              }
            } else if (route.name === "ProfileTab") {
              if (focused) {
                iconName = <Person fill={color.buttonBg} />;
              } else {
                iconName = <Person fill={"#8F8F8F"} />;
              }
            }
            return iconName;
          },
        };
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="ServicesTab" />
      <Tabs.Screen name="HistoryTab" />
      <Tabs.Screen name="ProfileTab" />
    </Tabs>
  );
}
