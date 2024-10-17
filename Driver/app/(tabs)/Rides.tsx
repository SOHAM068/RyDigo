import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Animated,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import RideCard from "@/components/RideCard";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";

export default function Rides() {
  const [recentRides, setRecentRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [slideAnim] = useState(new Animated.Value(windowHeight(100)));

  const getRecentRides = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const res = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-rides`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setRecentRides(res.data.rides);
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

  const renderItem = ({ item, index }: any) => {
    const translateY = new Animated.Value(50);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={{ transform: [{ translateY }] }}>
        <RideCard item={item} />
      </Animated.View>
    );
  };

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
          data={recentRides}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Animated.Text style={[styles.emptyText, { opacity: fadeAnim }]}>
              No rides to display
            </Animated.Text>
          }
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
});
