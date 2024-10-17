import React from "react";
import { Tabs } from "expo-router";
import { History, Home, HomeLight } from "@/utils/IconsUtils";
import color from "@/themes/app.colors";
import { Person } from "@/assets/icons/person";
import { Animated, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const getWidth = () => {
  return Dimensions.get('window').width / 3;
};

export default function _layout() {
  const tabOffsetValue = React.useRef(new Animated.Value(0)).current;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            tabBarStyle: {
              backgroundColor: 'white',
              position: 'absolute',
              bottom: 30,
              marginHorizontal: 20,
              height: 60,
              borderRadius: 10,
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowOffset: {
                width: 10,
                height: 10
              },
              paddingHorizontal: 20,
            },
            tabBarActiveTintColor: color.buttonBg,
            tabBarInactiveTintColor: '#8F8F8F',
          };
        }}
      >
        <Tabs.Screen 
          name="home" 
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: 0,
                useNativeDriver: true
              }).start();
            }
          })}
        />
        <Tabs.Screen 
          name="Rides" 
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth(),
                useNativeDriver: true
              }).start();
            }
          })}
        />
        <Tabs.Screen 
          name="profile" 
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              Animated.spring(tabOffsetValue, {
                toValue: getWidth() * 2,
                useNativeDriver: true
              }).start();
            }
          })}
        />
      </Tabs>
      <Animated.View
        style={{
          width: getWidth() - 30,
          height: 2,
          backgroundColor: color.buttonBg,
          position: 'absolute',
          bottom: 88,
          left: 15,
          borderRadius: 20,
          transform: [
            { translateX: tabOffsetValue }
          ]
        }}
      />
    </GestureHandlerRootView>
  );
}
