import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import color from "@/themes/app.colors";

export default function RideDetailsScreen() {
  const { orderData: orderDataObj } = useLocalSearchParams() as any;
  const orderData = JSON.parse(orderDataObj);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (orderData?.driver?.currentLocation && orderData?.driver?.marker) {
      const latitudeDelta = Math.abs(orderData.driver.marker.latitude - orderData.driver.currentLocation.latitude) * 2;
      const longitudeDelta = Math.abs(orderData.driver.marker.longitude - orderData.driver.currentLocation.longitude) * 2;

      setRegion({
        latitude: (orderData.driver.marker.latitude + orderData.driver.currentLocation.latitude) / 2,
        longitude: (orderData.driver.marker.longitude + orderData.driver.currentLocation.longitude) / 2,
        latitudeDelta: Math.max(latitudeDelta, 0.0922),
        longitudeDelta: Math.max(longitudeDelta, 0.0421),
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={(region) => setRegion(region)}
        >
          {orderData?.driver?.marker && (
            <Marker coordinate={orderData.driver.marker} />
          )}
          {orderData?.driver?.currentLocation && (
            <Marker coordinate={orderData.driver.currentLocation} />
          )}
          {orderData?.driver?.currentLocation && orderData?.driver?.marker && (
            <MapViewDirections
              origin={orderData.driver.currentLocation}
              destination={orderData.driver.marker}
              apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
              strokeWidth={3}
              strokeColor={color.buttonBg}
            />
          )}
        </MapView>
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>Ride Details</Text>
        <Text style={styles.detail}>Driver: {orderData?.driver?.name}</Text>
        <Text style={styles.detail}>Vehicle: {orderData?.driver?.vehicle_type} ({orderData?.driver?.vehicle_color})</Text>
        <Text style={styles.detail}>Distance: {orderData?.driver?.distance.toFixed(2)} km</Text>
        <Text style={styles.detail}>Estimated Fare: {(orderData.driver?.distance * parseInt(orderData?.driver?.rate)).toFixed(2)} BDT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.whiteColor,
  },
  mapContainer: {
    height: windowHeight(300),
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    padding: windowWidth(20),
  },
  title: {
    fontSize: fontSizes.FONT24,
    fontWeight: "bold",
    marginBottom: windowHeight(10),
  },
  detail: {
    fontSize: fontSizes.FONT18,
    marginBottom: windowHeight(5),
  },
});