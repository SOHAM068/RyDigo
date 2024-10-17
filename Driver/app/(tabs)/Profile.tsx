import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetDriverData } from "@/hooks/useGetDriverData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import color from "@/themes/app.colors";

export default function Profile() {
  const { driver, loading } = useGetDriverData();

  if (loading) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    router.push("/(routes)/Login");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/profileImage/profileUser.png")}
          style={styles.profilePicture}
        />
        <Text style={styles.name}>{driver?.name}</Text>
        <Text style={styles.rating}>⭐ 4.85</Text>
      </View>

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
        <Text style={styles.logoutText}>Log Out</Text>
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
    <Ionicons name={icon as any} size={24} color={color.buttonBg} style={styles.infoIcon} />
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
  },
  header: {
    alignItems: 'center',
    paddingTop: windowHeight(60),
    paddingBottom: windowHeight(20),
    backgroundColor: color.buttonBg,
  },
  profilePicture: {
    width: windowWidth(120),
    height: windowWidth(120),
    borderRadius: windowWidth(60),
    marginBottom: windowHeight(10),
  },
  name: {
    fontSize: fontSizes.FONT24,
    fontWeight: 'bold',
    color: color.whiteColor,
  },
  rating: {
    fontSize: fontSizes.FONT18,
    color: color.whiteColor,
    marginTop: windowHeight(5),
  },
  infoContainer: {
    padding: windowWidth(20),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: windowHeight(15),
  },
  infoIcon: {
    marginRight: windowWidth(15),
  },
  infoLabel: {
    fontSize: fontSizes.FONT14,
    color: '#808080',
  },
  infoValue: {
    fontSize: fontSizes.FONT16,
    color: color.blackColor,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: windowHeight(20),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D3D3D3',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.FONT20,
    fontWeight: 'bold',
    color: color.buttonBg,
  },
  statLabel: {
    fontSize: fontSizes.FONT14,
    color: '#808080',
  },
  logoutButton: {
    margin: windowWidth(20),
    padding: windowHeight(15),
    backgroundColor: color.buttonBg,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutText: {
    color: color.whiteColor,
    fontSize: fontSizes.FONT18,
    fontWeight: 'bold',
  },
});