import React from "react";
import { Tabs } from "expo-router";
import { History, Home, HomeLight } from "@/utils/IconsUtils";
import color from "@/themes/app.colors";
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
            } else if (route.name === "Rides") {
              iconName = (
                <History colors={focused ? color.buttonBg : "#8F8F8F"} />
              );
            } else if (route.name === "Profile") {
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
      <Tabs.Screen name="Rides" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
