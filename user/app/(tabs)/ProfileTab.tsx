import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useGetUserData } from "@/hooks/useGetUserData";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function Profile() {
  const { user, loading } = useGetUserData();
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    router.push("/(routes)/LoginRoute");
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[color.buttonBg, '#4c669f', '#3b5998']}
        style={styles.header}
      >
        <Animated.View style={[styles.profileImageContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Image
            source={require("@/assets/images/profileImage/profileUser.png")}
            style={styles.profilePicture}
          />
        </Animated.View>
        <Animated.Text style={[styles.name, { transform: [{ translateY: slideAnim }] }]}>{user?.name}</Animated.Text>
        <Animated.Text style={[styles.rating, { transform: [{ translateY: slideAnim }] }]}>⭐ 4.85</Animated.Text>
      </LinearGradient>

      <Animated.View style={[styles.infoContainer, { transform: [{ translateY: slideAnim }] }]}>
        <InfoItem icon="mail" label="Email" value={user?.email} />
        <InfoItem icon="call" label="Phone" value={user?.phone_number} />
        <InfoItem icon="flag" label="Country" value={<Text>India 🇮🇳</Text>} />
      </Animated.View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LinearGradient
          colors={[color.buttonBg, '#4c669f']}
          style={styles.logoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const InfoItem = ({ icon, label, value }: any) => (
  <View style={styles.infoItem}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={color.whiteColor} />
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.FONT18,
    color: '#333333',
    fontWeight: 'bold',
  },
  header: {
    paddingTop: windowHeight(60),
    paddingBottom: windowHeight(30),
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileImageContainer: {
    width: windowWidth(120),
    height: windowWidth(120),
    borderRadius: windowWidth(60),
    overflow: 'hidden',
    marginBottom: windowHeight(15),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: fontSizes.FONT24,
    fontWeight: 'bold',
    color: color.whiteColor,
    marginBottom: windowHeight(5),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  rating: {
    fontSize: fontSizes.FONT18,
    color: color.whiteColor,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: color.whiteColor,
    borderRadius: 20,
    marginHorizontal: windowWidth(20),
    marginTop: -windowHeight(20),
    padding: windowWidth(20),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowHeight(15),
  },
  iconContainer: {
    width: windowWidth(40),
    height: windowWidth(40),
    borderRadius: windowWidth(20),
    backgroundColor: color.buttonBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: windowWidth(15),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoLabel: {
    fontSize: fontSizes.FONT14,
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: fontSizes.FONT16,
    color: '#333333',
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: windowWidth(20),
    marginTop: windowHeight(30),
    marginBottom: windowHeight(40),
  },
  logoutGradient: {
    borderRadius: 25,
    padding: windowHeight(15),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutText: {
    color: color.whiteColor,
    fontSize: fontSizes.FONT18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
});