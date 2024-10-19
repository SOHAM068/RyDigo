import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetDriverData } from "@/hooks/useGetDriverData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import color from "@/themes/app.colors";
import { LinearGradient } from "expo-linear-gradient";

export default function Profile() {
  const { driver, loading } = useGetDriverData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    router.push("/(routes)/Login");
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[color.buttonBg, '#4c669f', '#3b5998']}
        style={styles.header}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={require("@/assets/images/profileImage/profileUser.png")}
            style={styles.profilePicture}
          />
        </View>
        <Text style={styles.name}>{driver?.name}</Text>
        <Text style={styles.rating}>⭐ 4.85</Text>
      </LinearGradient>

      <View style={styles.infoContainer}>
        <InfoItem icon="mail" label="Email" value={driver?.email} />
        <InfoItem icon="call" label="Phone" value={driver?.phone_number} />
        <InfoItem icon="flag" label="Country" value={driver?.country} />
      </View>

      <View style={styles.statsContainer}>
        <StatItem label="Trips" value="523" />
        <StatItem label="Years" value="2" />
        <StatItem label="Km" value="8,542" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LinearGradient
          colors={[color.buttonBg, '#4c669f']}
          style={styles.logoutGradient}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

interface InfoItemProps {
  icon: string;
  label: string;
  value: string | undefined;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon as any} size={24} color={color.whiteColor} />
    </View>
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

interface StatItemProps {
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.whiteColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: color.whiteColor,
  },
  loadingText: {
    fontSize: fontSizes.FONT18,
    color: color.buttonBg,
  },
  header: {
    alignItems: 'center',
    paddingTop: windowHeight(60),
    paddingBottom: windowHeight(30),
  },
  profileImageContainer: {
    padding: windowWidth(5),
    borderRadius: windowWidth(70),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: windowHeight(15),
  },
  profilePicture: {
    width: windowWidth(120),
    height: windowWidth(120),
    borderRadius: windowWidth(60),
  },
  name: {
    fontSize: fontSizes.FONT28,
    fontWeight: 'bold',
    color: color.whiteColor,
    marginBottom: windowHeight(5),
  },
  rating: {
    fontSize: fontSizes.FONT20,
    color: color.whiteColor,
  },
  infoContainer: {
    padding: windowWidth(20),
    backgroundColor: color.whiteColor,
    borderRadius: 20,
    marginTop: -windowHeight(20),
    marginHorizontal: windowWidth(15),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowHeight(20),
  },
  iconContainer: {
    width: windowWidth(40),
    height: windowWidth(40),
    borderRadius: windowWidth(20),
    backgroundColor: color.buttonBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: windowWidth(15),
  },
  infoLabel: {
    fontSize: fontSizes.FONT14,
    color: '#808080',
  },
  infoValue: {
    fontSize: fontSizes.FONT16,
    color: color.blackColor,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: windowHeight(20),
    marginTop: windowHeight(20),
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    marginHorizontal: windowWidth(15),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.FONT24,
    fontWeight: 'bold',
    color: color.buttonBg,
  },
  statLabel: {
    fontSize: fontSizes.FONT14,
    color: '#808080',
    marginTop: windowHeight(5),
  },
  logoutButton: {
    margin: windowWidth(20),
    borderRadius: 10,
    overflow: 'hidden',
  },
  logoutGradient: {
    padding: windowHeight(15),
    alignItems: 'center',
  },
  logoutText: {
    color: color.whiteColor,
    fontSize: fontSizes.FONT18,
    fontWeight: 'bold',
  },
});