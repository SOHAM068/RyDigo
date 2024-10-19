import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Header from "@/components/common/Header";
import { recentRidesData, rideData } from "@/configs/constants";
import RenderRideItem from "@/components/RenderRideItem";
import { external } from "@/styles/external.style";
import styles from "./styles";
import RideCard from "@/components/RideCard";
import MapView, { Marker, Polyline } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { Gps, Location } from "@/utils/IconsUtils";
import color from "@/themes/app.colors";
import Button from "@/components/common/Button";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as GeoLocation from "expo-location";
import { Toast } from "react-native-toast-notifications";
import { useGetDriverData } from "@/hooks/useGetDriverData";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import MapMarkerAnimation from "@/assets/animations/map-marker.json";
import CarMarkerAnimation from "@/assets/animations/car-marker.json";

export default function HomeScreen() {
  const notificationListener = useRef<any>();
  const { driver, loading: DriverDataLoading } = useGetDriverData();
  const [userData, setUserData] = useState<any>(null);
  const [isOn, setIsOn] = useState<any>();
  const [loading, setloading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [region, setRegion] = useState<any>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocationName, setcurrentLocationName] = useState("");
  const [destinationLocationName, setdestinationLocationName] = useState("");
  const [distance, setdistance] = useState<any>();
  const [wsConnected, setWsConnected] = useState(false);
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [lastLocation, setLastLocation] = useState<any>(null);
  const [recentRides, setrecentRides] = useState([]);
  const ws = new WebSocket("ws://192.168.1.9:8080");

  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(windowHeight(100))).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const [recentRidesAnim, setRecentRidesAnim] = useState<Animated.Value[]>([]);

  useEffect(() => {
    setRecentRidesAnim(recentRides.map(() => new Animated.Value(0)));
  }, [recentRides]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((Notifications) => {
        // Handle the notification and extract the data
        const orderData = JSON.parse(
          Notifications.request.content.data.orderData
        );
        setIsModalVisible(true);
        setCurrentLocation({
          latitude: orderData.currentLocation.latitude,
          longitude: orderData.currentLocation.longitude,
        });
        setMarker({
          latitude: orderData.marker.latitude,
          longitude: orderData.marker.longitude,
        });
        setRegion({
          latitude:
            (orderData.currentLocation.latitude + orderData.marker.latitude) /
            2,
          longitude:
            (orderData.currentLocation.longitude + orderData.marker.longitude) /
            2,
          latitudeDelta:
            Math.abs(
              orderData.currentLocation.latitude - orderData.marker.latitude
            ) * 2, // abs to make sure the value is positive
          longitudeDelta:
            Math.abs(
              orderData.currentLocation.longitude - orderData.marker.longitude
            ) * 2,
        });
        setdistance(orderData.distance);
        setcurrentLocationName(orderData.currentLocationName);
        setdestinationLocationName(orderData.destinationLocationName);
        setUserData(orderData.user);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
    };
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      const status: any = await AsyncStorage.getItem("status");
      setIsOn(status === "active" ? true : false);
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Toast.show("Failed to get push token for push notification!", {
          type: "danger",
        });
        return;
      }

      const projectId = // Get the project ID from the EAS or Expo config
        Constants.expoConfig?.extra?.eas?.projectId ?? // If the project ID is not available in the EAS config, get it from the Expo config and ?? means if the left side is null, then get the right side
        Constants.easConfig?.projectId;

      if (!projectId) {
        Toast.show("Failed to get project ID for push notification!", {
          type: "danger",
        });
        return;
      }

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        console.log("pushTokenString: ", pushTokenString);
        // ExponentPushToken[aUBCdkAVg2jVlerntwN3HQ]
        // Send the push token to the server
      } catch (err: unknown) {
        Toast.show(`${err}`, {
          type: "danger",
        });
      }
    } else {
      Toast.show("Must use physical device for Push Notifications", {
        type: "danger",
      });
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  }

  // socket updates
  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to WebSocket server");
      setWsConnected(true);
    };

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      console.log("Received message:", message);
      // Handle received location updates here
    };

    ws.onerror = (e: any) => {
      console.log("WebSocket error:", e.message);
    };

    ws.onclose = (e) => {
      console.log("WebSocket closed:", e.code, e.reason);
    };

    return () => {
      ws.close();
    };
  }, []);

  const haversineDistance = (coords1: any, coords2: any) => {
    // Calculate the distance between two coordinates using the Haversine formula (https://en.wikipedia.org/wiki/Haversine_formula)
    const toRad = (x: any) => (x * Math.PI) / 180;

    const R = 6371e3; // Radius of the Earth in meters
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
    const deltaLat = toRad(coords2.latitude - coords1.latitude);
    const deltaLon = toRad(coords2.longitude - coords1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance;
  };

  const sendLocationUpdate = async (location: any) => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    await axios
      .get(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => {
        if (res.data) {
          if (ws.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
              type: "locationUpdate",
              data: location,
              role: "driver",
              driver: res.data.driver.id!,
            });
            ws.send(message);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    (async () => {
      let { status } = await GeoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show("Please give us to access your location to use this app!");
        return;
      }

      await GeoLocation.watchPositionAsync(
        {
          accuracy: GeoLocation.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };
          if (
            !lastLocation ||
            haversineDistance(lastLocation, newLocation) > 200
          ) {
            setCurrentLocation(newLocation);
            setLastLocation(newLocation);
            if (ws.readyState === WebSocket.OPEN) {
              await sendLocationUpdate(newLocation);
            }
          }
        }
      );
    })();
  }, []);

  const getRecentRides = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const res = await axios.get(
      `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-rides`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    setrecentRides(res.data.rides);
  };

  useEffect(() => {
    getRecentRides();
  }, []);

  const handleClose = () => {
    setIsModalVisible(false);
  };

  const handleStatusChange = async () => {
    if (!loading) {
      setloading(true);
      const accessToken = await AsyncStorage.getItem("accessToken");
      const changeStatus = await axios.put(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/update-status`,
        {
          status: !isOn ? "active" : "inactive",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (changeStatus.data) {
        setIsOn(!isOn);
        await AsyncStorage.setItem("status", changeStatus.data.driver.status);
        setloading(false);
      } else {
        setloading(false);
      }
    }
  };

  const sendPushNotification = async (expoPushToken: string, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Ride Request Accepted!",
      body: `Your driver is on the way!`,
      data: { orderData: data },
    };
    await axios
      .post("https://exp.host/--/api/v2/push/send", message)
      .catch((error) => {
        console.log(error);
      });
  };

  const acceptRideHandler = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    await axios
      .post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/new-ride`,
        {
          userId: userData?.id!,
          charge: (distance * parseInt(driver?.rate!)).toFixed(2),
          status: "Processing",
          currentLocationName,
          destinationLocationName,
          distance,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then(async (res) => {
        const data = {
          ...driver,
          currentLocation,
          marker,
          distance,
        };
        const driverPushToken = "ExponentPushToken[48A0efDFwmJ4-maULk9Wzk]";

        await sendPushNotification(driverPushToken, data);

        const rideData = {
          user: userData,
          currentLocation,
          marker,
          driver,
          distance,
          rideData: res.data.newRide,
        };
        router.push({
          pathname: "/(routes)/RideDetails",
          params: { orderData: JSON.stringify(rideData) },
        });
      });
  };

  useEffect(() => {
    const animations = [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        ...recentRidesAnim.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
          })
        ),
      ]),
    ];

    Animated.parallel(animations).start();
  }, [recentRidesAnim]);

  const animatedHeaderStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const animatedCardStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const renderRideCard = (item: any, index: number) => {
    const animValue = recentRidesAnim[index];
    if (!animValue) return null;

    return (
      <Animated.View
        key={index}
        style={{
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <RideCard item={item} />
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[external.fx_1, animatedHeaderStyle]}>
      <View style={styles.spaceBelow}>
        <Header isOn={isOn} toggleSwitch={() => handleStatusChange()} />
        <Animated.View style={animatedCardStyle}>
          <FlatList
            data={rideData}
            numColumns={2}
            renderItem={({ item }) => (
              <RenderRideItem item={item} colors={colors} />
            )}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.rideContainer,
            { backgroundColor: colors.card },
            animatedCardStyle,
          ]}
        >
          <Text style={[styles.rideTitle, { color: colors.text }]}>
            Recent Rides
          </Text>
          <ScrollView
            style={{ maxHeight: windowHeight(240) }}
            showsVerticalScrollIndicator={false}
          >
            {recentRides?.slice().reverse().map(renderRideCard)}
            {recentRides?.length === 0 && (
              <Text style={{ padding: windowHeight(10) }}>
                You didn't take any ride yet!
              </Text>
            )}
          </ScrollView>
        </Animated.View>
      </View>
      <Modal
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleClose}
        animationType="fade"
      >
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1}>
          <Animated.View style={[styles.modalContainer, animatedCardStyle]}>
            <View>
              <Text style={styles.modalTitle}>New Ride Request Received!</Text>
              <MapView
                style={{ height: windowHeight(180) }}
                region={region}
                onRegionChangeComplete={(region) => setRegion(region)}
              >
                {marker && (
                  <Marker coordinate={marker}>
                    <LottieView
                      source={MapMarkerAnimation}
                      autoPlay
                      loop
                      style={{ width: 50, height: 50 }}
                    />
                  </Marker>
                )}
                {currentLocation && (
                  <Marker coordinate={currentLocation}>
                    <LottieView
                      source={CarMarkerAnimation}
                      autoPlay
                      loop
                      style={{ width: 50, height: 50 }}
                    />
                  </Marker>
                )}
                {currentLocation && marker && (
                  <MapViewDirections
                    origin={currentLocation}
                    destination={marker}
                    apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                    strokeWidth={4}
                    strokeColor="blue"
                    lineDashPattern={[0]}
                  />
                )}
              </MapView>
              <View style={{ flexDirection: "row" }}>
                <View style={styles.leftView}>
                  <Location color={colors.text} />
                  <View
                    style={[
                      styles.verticaldot,
                      { borderColor: color.buttonBg },
                    ]}
                  />
                  <Gps colors={colors.text} />
                </View>
                <View style={styles.rightView}>
                  <Text style={[styles.pickup, { color: colors.text }]}>
                    {currentLocationName}
                  </Text>
                  <View style={styles.border} />
                  <Text style={[styles.drop, { color: colors.text }]}>
                    {destinationLocationName}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  paddingTop: windowHeight(5),
                  fontSize: windowHeight(14),
                }}
              >
                Distance: {distance} km
              </Text>
              <Text
                style={{
                  paddingVertical: windowHeight(5),
                  paddingBottom: windowHeight(5),
                  fontSize: windowHeight(14),
                }}
              >
                Amount: {(distance * parseInt(driver?.rate!)).toFixed(2)} Rs
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: windowHeight(5),
                }}
              >
                <Button
                  title="Decline"
                  onPress={handleClose}
                  width={windowWidth(120)}
                  height={windowHeight(30)}
                  backgroundColor="crimson"
                />
                <Button
                  title="Accept"
                  onPress={() => acceptRideHandler()}
                  width={windowWidth(120)}
                  height={windowHeight(30)}
                />
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
}
