import React from "react";
import { History, Home, HomeLight } from "@/utils/IconsUtils";
import color from "@/themes/app.colors";
import { Person } from "@/assets/icons/person";
import { View, StyleSheet, Dimensions, Animated, SafeAreaView, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import home from "./home";
import Rides from "./Rides";
import Profile from "./Profile";

const Tabs = createMaterialTopTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const INDICATOR_WIDTH_PERCENTAGE = 0.6; // 20% of tab width
const TAB_BAR_HEIGHT = SCREEN_HEIGHT * 0.08; // 8% of screen height
const ICON_SIZE = Math.min(24, TAB_BAR_HEIGHT * 0.5); // Adjust icon size based on tab bar height

const TabBarIndicator = ({ state, descriptors, navigation, width }: any) => {
  const [translateX] = React.useState(new Animated.Value(0));
  const tabWidth = width / 3;
  const indicatorWidth = tabWidth * INDICATOR_WIDTH_PERCENTAGE;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: state.index * tabWidth + (tabWidth - indicatorWidth) / 2,
      useNativeDriver: true,
    }).start();
  }, [state.index, tabWidth, indicatorWidth]);

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          transform: [{ translateX }],
          width: indicatorWidth,
        },
      ]}
    />
  );
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  const tabBarWidth = SCREEN_WIDTH - 20; // 10px padding on each side

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      <TabBarIndicator state={state} descriptors={descriptors} navigation={navigation} width={tabBarWidth} />
      {state.routes.map((route: any, index: any) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <View key={index} style={styles.tabBarItem}>
            <View onTouchEnd={onPress}>
              {options.tabBarIcon({ focused: isFocused, size: ICON_SIZE })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default function _layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Tabs.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarIcon: ({ focused, size }: any) => {
              let iconName;
              if (route.name === "home") {
                iconName = focused ? (
                  <Home colors={color.buttonBg} width={size} height={size} />
                ) : (
                  <HomeLight  />
                );
              } else if (route.name === "Rides") {
                iconName = (
                  <History colors={focused ? color.buttonBg : "#8F8F8F"}  />
                );
              } else if (route.name === "Profile") {
                iconName = (
                  <Person fill={focused ? color.buttonBg : "#8F8F8F"}  />
                );
              }
              return iconName;
            },
          })}
        >
          <Tabs.Screen name="home" component={home} />
          <Tabs.Screen name="Rides" component={Rides} />
          <Tabs.Screen name="Profile" component={Profile} />
        </Tabs.Navigator>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: "#E6E6FA",
    position: "absolute",
    bottom: Platform.OS === 'ios' ? 20 : 10,
    left: 10,
    right: 10,
    height: TAB_BAR_HEIGHT,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    elevation: 5,
    zIndex: 1000,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    height: 2.5,
    top: 0,
    backgroundColor: color.buttonBg,
    borderRadius: 1.5,
  },
});