import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import RideCard from "@/components/RideCard";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";

interface Ride {
  id: string;
  // Add other properties as needed
}

export default function Rides() {
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(windowHeight(100))).current;
  const animatedItems = useRef<Animated.Value[]>([]).current;

  const getRecentRides = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const res = await axios.get<{ rides: Ride[] }>(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-rides`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setRecentRides(res.data.rides);
      // Reset animated items
      animatedItems.length = 0;
      res.data.rides.forEach(() => {
        animatedItems.push(new Animated.Value(0));
      });
    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getRecentRides();
    setRefreshing(false);
  }, [getRecentRides]);

  useFocusEffect(
    useCallback(() => {
      getRecentRides();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 4,
          tension: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, [getRecentRides, fadeAnim, scaleAnim, slideAnim])
  );

  useEffect(() => {
    if (animatedItems.length > 0) {
      animatedItems.forEach((item, index) => {
        Animated.spring(item, {
          toValue: 1,
          friction: 4,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [recentRides]);

  const renderItem = useCallback(({ item, index }: { item: Ride; index: number }) => {
    const animValue = animatedItems[index] || new Animated.Value(0);

    return (
      <Animated.View 
        style={{ 
          transform: [
            { scale: animValue },
          ],
          opacity: animValue,
        }}
      >
        <RideCard item={item} />
      </Animated.View>
    );
  }, [animatedItems]);

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons name="car" size={24} color={color.whiteColor} />
        <Text style={styles.headerTitle}>Ride History</Text>
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY: slideAnim }], flex: 1 }}>
        <FlatList
          data={recentRides.slice().reverse()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Animated.Text style={[styles.emptyText, { opacity: fadeAnim }]}>
              No rides to display
            </Animated.Text>
          }
          ListFooterComponent={<View style={styles.footer} />}
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: windowHeight(40),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: windowWidth(20),
    marginBottom: windowHeight(20),
  },
  headerTitle: {
    fontSize: fontSizes.FONT24,
    fontWeight: "bold",
    color: color.whiteColor,
    marginLeft: windowWidth(10),
  },
  listContainer: {
    paddingHorizontal: windowWidth(20),
  },
  emptyText: {
    textAlign: "center",
    color: color.whiteColor,
    fontSize: fontSizes.FONT18,
    marginTop: windowHeight(20),
  },
  footer: {
    height: windowHeight(120), // Adjust this value as needed to leave space for the tab bar
  },
});
