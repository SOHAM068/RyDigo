import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Keyboard,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import styles from "./styles";
import DownArrow from "@/assets/icons/downArrow";
import {
  Clock,
  LeftArrow,
  PickLocation,
  PickUpLocation,
} from "@/utils/IconsUtils";
import color from "@/themes/app.colors";
import { router } from "expo-router";
import PlaceHolder from "@/assets/icons/placeHolder";
import {
  GooglePlacesAutocomplete,
  GooglePlacesAutocompleteRef,
} from "react-native-google-places-autocomplete";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import _, { debounce } from "lodash";
import * as Location from "expo-location"; // Import the expo-location module to access the user's location
import { Toast } from "react-native-toast-notifications";
import moment from "moment";
import { ParseDuration } from "@/utils/ParseDuration";
import Button from "@/components/common/Button";
import { useGetUserData } from "@/hooks/useGetUserData";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";

export default function RidePlanScreen() {
  const notificationListener = useRef<any>();
  const [places, setPlaces] = useState<any>([]);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef<MapView | null>(null);
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [distance, setDistance] = useState<any>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [keyboardAvoidingHeight, setKeyboardAvoidingHeight] = useState(false);
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null,
  });
  const [selectedDriver, setSelectedDriver] = useState<DriverType>();
  const [driverLists, setDriverLists] = useState([]);
  const [driverLoader, setDriverLoader] = useState(true);
  const ws = useRef<any>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const autocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);

  const { user } = useGetUserData();

  // Function to send a push notification to the driver
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const orderData = {
          currentLocation: notification.request.content.data.currentLocation,
          marker: notification.request.content.data.marker,
          distance: notification.request.content.data.distance,
          driver: notification.request.content.data.orderData,
        };

        router.push({
          pathname: "/(routes)/RideDetails",
          params: { orderData: JSON.stringify(orderData) },
        });
      });
  }, []);

  // access the user's current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show(
          "Please approve your location tracking otherwise you can't use this app!",
          {
            type: "danger",
            placement: "bottom",
          }
        );
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const focusOnLocation = () => {
    if (currentLocation.latitude && currentLocation.longitude) {
      const newRegion = {
        latitude: parseFloat(currentLocation.latitude),
        longitude: parseFloat(currentLocation.longitude),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1500);
      }
    }
  };

  const fetchPlaces = async (input: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
        {
          params: {
            input,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
            language: "en",
          },
        }
      );
      setPlaces(response.data.predictions);
    } catch (err: any) {
      console.log(err);
    }
  };

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []);
  useEffect(() => {
    if (query.length > 2) {
      debouncedFetchPlaces(query);
    } else {
      setPlaces([]);
    }
  }, [query, debouncedFetchPlaces]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    debouncedFetchPlaces(text);
  };

  const fetchTravelTimes = async (origin: any, destination: any) => {
    const modes = ["driving", "walking", "bicycling", "transit"];
    let travelTimes = {
      driving: null,
      walking: null,
      bicycling: null,
      transit: null,
    } as any;

    for (const mode of modes) {
      let params = {
        origins: `${origin.latitude},${origin.longitude}`,
        destinations: `${destination.latitude},${destination.longitude}`,
        key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
        mode: mode,
      } as any;

      if (mode === "driving") {
        params.departure_time = "now";
      }

      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json`,
          { params }
        );

        console.log("API Response for", mode, ":", response.data);

        const elements = response.data.rows[0].elements[0];
        if (elements.status === "OK") {
          travelTimes[mode] = elements.duration.text;
        } else {
          console.warn(`Status not OK for mode ${mode}:`, elements.status);
        }
      } catch (error) {
        console.log(`Error fetching travel time for mode ${mode}:`, error);
      }
    }

    setTravelTimes(travelTimes);
  };

  const handlePlaceSelect = async (placeId: string) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: placeId,
            key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
          },
        }
      );
      const { lat, lng } = response.data.result.geometry.location;

      const selectedDestination = { latitude: lat, longitude: lng };
      setMarker(selectedDestination);
      setPlaces([]);
      requestNearbyDrivers();
      setLocationSelected(true);
      setKeyboardAvoidingHeight(false);

      if (currentLocation) {
        await fetchTravelTimes(currentLocation, selectedDestination);

        // Calculate the region that includes both points
        const minLat = Math.min(currentLocation.latitude, lat);
        const maxLat = Math.max(currentLocation.latitude, lat);
        const minLng = Math.min(currentLocation.longitude, lng);
        const maxLng = Math.max(currentLocation.longitude, lng);

        const midLat = (minLat + maxLat) / 2;
        const midLng = (minLng + maxLng) / 2;
        const latDelta = (maxLat - minLat) * 1.5; // Add some padding
        const lngDelta = (maxLng - minLng) * 1.5;

        const newRegion = {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(latDelta, 0.02),
          longitudeDelta: Math.max(lngDelta, 0.02),
        };

        // Animate to the new region
        mapRef.current?.animateToRegion(newRegion, 1250);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to calculate the distance between two points using the Haversine formula
  const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    var p = 0.017453292519943295; // Math.PI / 180
    var c = Math.cos;
    var a =
      0.5 -
      c((lat2 - lat1) * p) / 2 +
      (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  };

  //  Function to get the estimated arrival time based on the selected vehicle
  const getEstimatedArrivalTime = (travelTime: any) => {
    if (!travelTime) {
      console.warn("Travel time is null or undefined.");
      return moment().format("MMM D, hh:mm A"); // Return current date and time or a default message
    }

    // Parse travel time and split into days, hours, and minutes
    const travelMinutes = ParseDuration(travelTime);
    const now = moment();

    // Add the travel time to the current time
    const arrivalTime = moment(now).add(travelMinutes, "minutes");

    // Check if the travel time crosses to the next day
    const currentDay = now.format("YYYY-MM-DD");
    const arrivalDay = arrivalTime.format("YYYY-MM-DD");

    // If the arrival is on the same day, only format time
    if (currentDay === arrivalDay) {
      return arrivalTime.format("hh:mm A"); // Only format time if it's the same day
    } else {
      return arrivalTime.format("MMM D, hh:mm A"); // Format with date and time if it's a different day
    }
  };

  useEffect(() => {
    if (marker && currentLocation) {
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        marker.latitude,
        marker.longitude
      );
      setDistance(dist);
    }
  }, [marker, currentLocation]);

  // Function to initialize the WebSocket connection to the server
  const initializeWebSocket = () => {
    ws.current = new WebSocket("ws://192.168.1.9:8080");

    ws.current.onopen = () => {
      console.log("WebSocket connected!");
      setWsConnected(true);
    };

    ws.current.onerror = (e: any) => {
      console.error("WebSocket error:", e);
    };

    ws.current.onclose = (e: any) => {
      console.log("WebSocket closed:", e.code, e.reason);
      setWsConnected(false);

      // Reconnect the WebSocket after 5 seconds
      setTimeout(() => {
        initializeWebSocket();
      }, 5000);
    };
  };

  useEffect(() => {
    initializeWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
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
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        Toast.show("Failed to get project id for push notification!", {
          type: "danger",
        });
      }

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;

        console.log("Push token:", pushTokenString);
        // Send the push token to the server
      } catch (err: any) {
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

  const getNearbyDrivers = () => {
    ws.current.onmessage = async (e: any) => {
      try {
        const message = JSON.parse(e.data);
        console.log("Nearby drivers:", message);

        if (message.type === "nearbyDrivers") {
          // Handle nearby drivers
          await getDriversData(message.drivers);
        }
      } catch (err: any) {
        console.log(err, "Error getting nearby drivers");
      }
    };
  };

  const getDriversData = async (drivers: any) => {
    // extract drivers IDs from the drivers array
    const driverIds = drivers.map((driver: any) => driver.id).join(",");
    console.log("Driver IDs:", driverIds);

    const response = await axios.get(
      `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-drivers-data`,
      {
        params: {
          ids: driverIds,
        },
      }
    );

    let driverData = response.data;
    console.log("Driver data:", driverData);

    // Filter out inactive drivers
    driverData = driverData.filter(
      (driver: any) => driver.status !== "inactive"
    );

    setDriverLists(driverData); // Set the driver data to the state to display in the UI
    setDriverLoader(false); // Hide the loader
  };

  const requestNearbyDrivers = () => {
    console.log(wsConnected);

    if (currentLocation && wsConnected) {
      ws.current.send(
        JSON.stringify({
          type: "requestRide",
          role: "user",
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        })
      );
      getNearbyDrivers();
    }
  };

  const sendPushNotifications = async (expoPushToken: any, data: any) => {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "New Ride Request",
      body: "You have a new ride request!",
      data: { orderData: data },
    };

    await axios.post("https://exp.host/--/api/v2/push/send", message);
  };

  const handleOrder = async () => {
    const currentLocationName = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation?.latitude},${currentLocation?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );
    const destinationLocationName = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker?.latitude},${marker?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
    );

    const data = {
      user,
      currentLocation,
      marker,
      distance: distance.toFixed(2),
      currentLocationName:
        currentLocationName.data.results[0].formatted_address,
      destinationLocationName:
        destinationLocationName.data.results[0].formatted_address,
    };

    const driverPushToken = "ExponentPushToken[aUBCdkAVg2jVlerntwN3HQ]";

    await sendPushNotifications(driverPushToken, JSON.stringify(data));
    console.log("Order data:", data);
  };

  useEffect(() => {
    if (autocompleteRef.current) {
      autocompleteRef.current.setAddressText(query);
    }
  }, [query]);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const mapHeight = useRef(new Animated.Value(windowHeight(500))).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardOpen(true);
        Animated.timing(mapHeight, {
          toValue: windowHeight(300),
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOpen(false);
        Animated.timing(mapHeight, {
          toValue: windowHeight(500),
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <>
        <Animated.View style={{ height: mapHeight }}>
          <MapView
            style={{ flex: 1 }}
            ref={mapRef}
            region={region}
            onRegionChangeComplete={(region) => setRegion(region)}
            provider={Platform.OS === "android" ? "google" : undefined}
            showsUserLocation={true}
          >
            {marker && <Marker coordinate={marker} />}
            {currentLocation && <Marker coordinate={currentLocation} />}
            {currentLocation && marker && (
              <MapViewDirections
                origin={currentLocation}
                destination={marker}
                apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
                strokeWidth={4}
                strokeColor="blue"
              />
            )}
          </MapView>
        </Animated.View>
        <View
          style={{
            position: "absolute",
            top: 30,
            left: 11,
            alignItems: "center",
            backgroundColor: "transparent", // Transparent background
          }}
        >
          <TouchableOpacity
            onPress={focusOnLocation}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.2)", // Transparent button background
              padding: 10,
              borderRadius: 5,
              backfaceVisibility: "hidden",
            }}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.container}>
            {locationSelected ? (
              <>
                {driverLoader ? (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ActivityIndicator size="large" />
                  </View>
                ) : driverLists.length === 0 ? (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      Currently no drivers available
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    style={{
                      paddingBottom: windowHeight(20),
                      height: windowHeight(280),
                    }}
                  >
                    <View
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#b5b5b5",
                        paddingBottom: windowHeight(10),
                        flexDirection: "row",
                      }}
                    >
                      <Pressable onPress={() => setLocationSelected(false)}>
                        <LeftArrow />
                      </Pressable>

                      <Text
                        style={{
                          margin: "auto",
                          fontSize: 20,
                          fontWeight: "600",
                        }}
                      >
                        Gathering Options
                      </Text>
                    </View>

                    <View style={{ padding: windowWidth(10) }}>
                      {driverLists?.map((driver: DriverType) => (
                        <Pressable
                          style={{
                            width: windowWidth(410),
                            borderWidth:
                              selectedVehicle === driver.vehicle_type ? 2 : 0,
                            borderRadius: 10,
                            padding: 10,
                            marginVertical: 5,
                            backgroundColor:
                              selectedVehicle === driver.vehicle_type
                                ? "#f0f0f0"
                                : "#fff",
                          }}
                          onPress={() => {
                            setSelectedVehicle(driver.vehicle_type);
                          }}
                        >
                          <View style={{ margin: "auto" }}>
                            <Image
                              source={
                                driver?.vehicle_type === "Car"
                                  ? require("@/assets/images/vehicles/car.png")
                                  : driver?.vehicle_type === "Motorcycle"
                                  ? require("@/assets/images/vehicles/bike.png")
                                  : require("@/assets/images/vehicles/bike.png")
                              }
                              style={{ width: 90, height: 80 }}
                            />
                          </View>

                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ fontSize: 20, fontWeight: "600" }}>
                              RyDigo {driver?.vehicle_type}
                            </Text>
                            <View style={{ flexDirection: "column" }}>
                              <Text style={{ fontSize: 16 }}>
                                {getEstimatedArrivalTime(travelTimes.driving)}{" "}
                                DropOff
                              </Text>
                              <Text style={{ fontSize: 12, color: "#999" }}>
                                {" "}
                                ({travelTimes.driving})
                              </Text>
                            </View>
                          </View>
                          <Text
                            style={{
                              fontSize: windowWidth(20),
                              fontWeight: "600",
                            }}
                          >
                            Rs{" "}
                            {(
                              distance.toFixed(2) * parseInt(driver?.rate)
                            ).toFixed(2)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <View
                      style={{
                        paddingHorizontal: windowWidth(10),
                        marginTop: windowHeight(15),
                      }}
                    >
                      <Button
                        backgroundColor={"#000"}
                        textColor="#fff"
                        title={`Confirm Booking`}
                        onPress={() => handleOrder()}
                      />
                    </View>
                  </ScrollView>
                )}
              </>
            ) : (
              <>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity onPress={() => router.back()}>
                    <LeftArrow />
                  </TouchableOpacity>
                  <Text
                    style={{
                      margin: "auto",
                      fontSize: windowWidth(25),
                      fontWeight: "600",
                    }}
                  >
                    Plan your ride
                  </Text>
                </View>
                {/* picking up time */}
                <View
                  style={{
                    width: windowWidth(200),
                    height: windowHeight(28),
                    borderRadius: 20,
                    backgroundColor: color.lightGray,
                    alignItems: "center",
                    justifyContent: "center",
                    marginVertical: windowHeight(10),
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock />
                    <Text
                      style={{
                        fontSize: windowHeight(12),
                        fontWeight: "600",
                        paddingHorizontal: 8,
                      }}
                    >
                      Pick-up now
                    </Text>
                    <DownArrow />
                  </View>
                </View>
                {/* picking up location */}
                <View
                  style={{
                    borderWidth: 2,
                    borderColor: "#000",
                    borderRadius: 15,
                    marginBottom: windowHeight(15),
                    paddingHorizontal: windowWidth(15),
                    paddingVertical: windowHeight(5),
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <PickLocation />
                    <View
                      style={{
                        width: Dimensions.get("window").width * 1 - 110,
                        borderBottomWidth: 1,
                        borderBottomColor: "#999",
                        marginLeft: 5,
                        height: windowHeight(20),
                      }}
                    >
                      <Text
                        style={{
                          color: "#2371F0",
                          fontSize: 18,
                          paddingLeft: 5,
                        }}
                      >
                        Current Location
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingVertical: 20,
                    }}
                  >
                    <PlaceHolder />
                    <View
                      style={{
                        marginLeft: 5,
                        width: Dimensions.get("window").width * 1 - 110,
                      }}
                    >
                      <GooglePlacesAutocomplete
                        ref={autocompleteRef}
                        placeholder="Where to?"
                        onPress={(data, details = null) => {
                          setKeyboardAvoidingHeight(true);
                          setQuery(data.description);
                          setPlaces([
                            {
                              description: data.description,
                              place_id: data.place_id,
                            },
                          ]);
                        }}
                        query={{
                          key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
                          language: "en",
                        }}
                        styles={{
                          textInputContainer: {
                            width: "100%",
                          },
                          textInput: {
                            height: 38,
                            color: "#000",
                            fontSize: 16,
                          },
                          predefinedPlacesDescription: {
                            color: "#000",
                          },
                        }}
                        textInputProps={{
                          onChangeText: handleInputChange,
                          onFocus: () => setKeyboardAvoidingHeight(true),
                        }}
                        onFail={(error) => {
                          console.log("Error fetching places:", error);
                          Toast.show(
                            "Error fetching places. Please try again.",
                            {
                              type: "danger",
                              placement: "top",
                            }
                          );
                        }}
                        fetchDetails={true}
                        enablePoweredByContainer={false}
                        debounce={200}
                      />
                    </View>
                  </View>
                </View>
                {/* Last sessions */}
                {places.map((place: any, index: number) => (
                  <Pressable
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: windowHeight(20),
                    }}
                    onPress={() => handlePlaceSelect(place.place_id)}
                  >
                    <PickUpLocation />
                    <Text style={{ paddingLeft: 15, fontSize: 18 }}>
                      {place.description}
                    </Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        </View>
      </>
    </KeyboardAvoidingView>
  );
}

// import {
//   View,
//   Text,
//   KeyboardAvoidingView,
//   Platform,
//   TouchableOpacity,
//   Dimensions,
//   Pressable,
//   ScrollView,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import styles from "./styles";
// import { useCallback, useEffect, useRef, useState } from "react";
// import { external } from "@/styles/external.style";
// import { windowHeight, windowWidth } from "@/themes/app.constant";
// import MapView, { Marker } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";
// import { router } from "expo-router";
// import {
//   Clock,
//   LeftArrow,
//   PickLocation,
//   PickUpLocation,
// } from "@/utils/IconsUtils";
// import color from "@/themes/app.colors";
// import DownArrow from "@/assets/icons/downArrow";
// import PlaceHolder from "@/assets/icons/placeHolder";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import _ from "lodash";
// import axios from "axios";
// import * as Location from "expo-location";
// import { Toast } from "react-native-toast-notifications";
// import moment from "moment";
// import { ParseDuration } from "@/utils/ParseDuration";
// import Button from "@/components/common/Button";
// import { useGetUserData } from "@/hooks/useGetUserData";
// import * as Notifications from "expo-notifications";
// import * as Device from "expo-device";
// import Constants from "expo-constants";
// import "react-native-get-random-values";
// import { v4 as uuidv4 } from "uuid";

// const id = uuidv4();

// export default function RidePlanScreen() {
//   const { user } = useGetUserData();
//   const ws = useRef<any>(null);
//   const notificationListener = useRef<any>();
//   const [wsConnected, setWsConnected] = useState(false);
//   const [places, setPlaces] = useState<any>([]);
//   const [query, setQuery] = useState("");
//   const [region, setRegion] = useState<any>({
//     latitude: 37.78825,
//     longitude: -122.4324,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });
//   const [marker, setMarker] = useState<any>(null);
//   const [currentLocation, setCurrentLocation] = useState<any>(null);
//   const [distance, setDistance] = useState<any>(null);
//   const [locationSelected, setlocationSelected] = useState(false);
//   const [selectedVehcile, setselectedVehcile] = useState("Car");
//   const [travelTimes, setTravelTimes] = useState({
//     driving: null,
//     walking: null,
//     bicycling: null,
//     transit: null,
//   });
//   const [keyboardAvoidingHeight, setkeyboardAvoidingHeight] = useState(false);
//   const [driverLists, setdriverLists] = useState([]);
//   const [selectedDriver, setselectedDriver] = useState<DriverType>();
//   const [driverLoader, setdriverLoader] = useState(true);

//   Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//       shouldShowAlert: true,
//       shouldPlaySound: true,
//       shouldSetBadge: false,
//     }),
//   });

//   useEffect(() => {
//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         const orderData = {
//           currentLocation: notification.request.content.data.currentLocation,
//           marker: notification.request.content.data.marker,
//           distance: notification.request.content.data.distance,
//           driver: notification.request.content.data.orderData,
//         };
//         // router.push({
//         //   pathname: "/(routes)/ride-details",
//         //   params: { orderData: JSON.stringify(orderData) },
//         // });
//       });

//     return () => {
//       Notifications.removeNotificationSubscription(
//         notificationListener.current
//       );
//     };
//   }, []);

//   useEffect(() => {
//     (async () => {
//       let { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Toast.show(
//           "Please approve your location tracking otherwise you can't use this app!",
//           {
//             type: "danger",
//             placement: "bottom",
//           }
//         );
//       }

//       let location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
//       const { latitude, longitude } = location.coords;
//       setCurrentLocation({ latitude, longitude });
//       setRegion({
//         latitude,
//         longitude,
//         latitudeDelta: 0.0922,
//         longitudeDelta: 0.0421,
//       });
//     })();
//   }, []);

//   const initializeWebSocket = () => {
//     ws.current = new WebSocket("ws://192.168.1.9:8080");
//     ws.current.onopen = () => {
//       console.log("Connected to websocket server");
//       setWsConnected(true);
//     };

//     ws.current.onerror = (e: any) => {
//       console.log("WebSocket error:", e.message);
//     };

//     ws.current.onclose = (e: any) => {
//       console.log("WebSocket closed:", e.code, e.reason);
//       setWsConnected(false);
//       // Attempt to reconnect after a delay
//       setTimeout(() => {
//         initializeWebSocket();
//       }, 5000);
//     };
//   };

//   useEffect(() => {
//     initializeWebSocket();
//     return () => {
//       if (ws.current) {
//         ws.current.close();
//       }
//     };
//   }, []);

//   // useEffect(() => {
//   //   registerForPushNotificationsAsync();
//   // }, []);

//   async function registerForPushNotificationsAsync() {
//     if (Device.isDevice) {
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;
//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       if (finalStatus !== "granted") {
//         Toast.show("Failed to get push token for push notification!", {
//           type: "danger",
//         });
//         return;
//       }
//       const projectId =
//         Constants?.expoConfig?.extra?.eas?.projectId ??
//         Constants?.easConfig?.projectId;
//       if (!projectId) {
//         Toast.show("Failed to get project id for push notification!", {
//           type: "danger",
//         });
//       }
//       try {
//         const pushTokenString = (
//           await Notifications.getExpoPushTokenAsync({
//             projectId,
//           })
//         ).data;
//         console.log(pushTokenString);
//         // return pushTokenString;
//       } catch (e: unknown) {
//         Toast.show(`${e}`, {
//           type: "danger",
//         });
//       }
//     } else {
//       Toast.show("Must use physical device for Push Notifications", {
//         type: "danger",
//       });
//     }

//     if (Platform.OS === "android") {
//       Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//       });
//     }
//   }

//   const fetchPlaces = async (input: any) => {
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
//         {
//           params: {
//             input,
//             key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
//             language: "en",
//           },
//         }
//       );
//       setPlaces(response.data.predictions);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []);

//   useEffect(() => {
//     if (query.length > 2) {
//       debouncedFetchPlaces(query);
//     } else {
//       setPlaces([]);
//     }
//   }, [query, debouncedFetchPlaces]);

//   const handleInputChange = (text: any) => {
//     setQuery(text);
//   };

//   const fetchTravelTimes = async (origin: any, destination: any) => {
//     const modes = ["driving", "walking", "bicycling", "transit"];
//     let travelTimes = {
//       driving: null,
//       walking: null,
//       bicycling: null,
//       transit: null,
//     } as any;

//     for (const mode of modes) {
//       let params = {
//         origins: `${origin.latitude},${origin.longitude}`,
//         destinations: `${destination.latitude},${destination.longitude}`,
//         key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!,
//         mode: mode,
//       } as any;

//       if (mode === "driving") {
//         params.departure_time = "now";
//       }

//       try {
//         const response = await axios.get(
//           `https://maps.googleapis.com/maps/api/distancematrix/json`,
//           { params }
//         );

//         const elements = response.data.rows[0].elements[0];
//         if (elements.status === "OK") {
//           travelTimes[mode] = elements.duration.text;
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     }

//     setTravelTimes(travelTimes);
//   };

//   const handlePlaceSelect = async (placeId: any) => {
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/details/json`,
//         {
//           params: {
//             place_id: placeId,
//             key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
//           },
//         }
//       );
//       const { lat, lng } = response.data.result.geometry.location;

//       const selectedDestination = { latitude: lat, longitude: lng };
//       setRegion({
//         ...region,
//         latitude: lat,
//         longitude: lng,
//       });
//       setMarker({
//         latitude: lat,
//         longitude: lng,
//       });
//       setPlaces([]);
//       requestNearbyDrivers();
//       setlocationSelected(true);
//       setkeyboardAvoidingHeight(false);
//       if (currentLocation) {
//         await fetchTravelTimes(currentLocation, selectedDestination);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const calculateDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
//     var p = 0.017453292519943295; // Math.PI / 180
//     var c = Math.cos;
//     var a =
//       0.5 -
//       c((lat2 - lat1) * p) / 2 +
//       (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

//     return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
//   };

//   const getEstimatedArrivalTime = (travelTime: any) => {
//     const now = moment();
//     const travelMinutes = ParseDuration(travelTime);
//     const arrivalTime = now.add(travelMinutes, "minutes");
//     return arrivalTime.format("hh:mm A");
//   };

//   useEffect(() => {
//     if (marker && currentLocation) {
//       const dist = calculateDistance(
//         currentLocation.latitude,
//         currentLocation.longitude,
//         marker.latitude,
//         marker.longitude
//       );
//       setDistance(dist);
//     }
//   }, [marker, currentLocation]);

//   const getNearbyDrivers = () => {
//     ws.current.onmessage = async (e: any) => {
//       try {
//         const message = JSON.parse(e.data);
//         console.log("Nearby drivers:", message);
//         if (message.type === "nearbyDrivers") {
//           await getDriversData(message.drivers);
//         }
//       } catch (error) {
//         console.log(error, "Error parsing websocket");
//       }
//     };
//   };

//   const getDriversData = async (drivers: any) => {
//     // Extract driver IDs from the drivers array
//     const driverIds = drivers.map((driver: any) => driver.id).join(",");
//     console.log("Driver IDs:", driverIds);
//     const response = await axios.get(
//       `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/get-drivers-data`,
//       {
//         params: { ids: driverIds },
//       }
//     );

//     const driverData = response.data;
//     setdriverLists(driverData);
//     setdriverLoader(false);
//   };

//   const requestNearbyDrivers = () => {
//     console.log(wsConnected);
//     if (currentLocation && wsConnected) {
//       ws.current.send(
//         JSON.stringify({
//           type: "requestRide",
//           role: "user",
//           latitude: currentLocation.latitude,
//           longitude: currentLocation.longitude,
//         })
//       );
//       getNearbyDrivers();
//     }
//   };

//   const sendPushNotification = async (expoPushToken: string, data: any) => {
//     const message = {
//       to: expoPushToken,
//       sound: "default",
//       title: "New Ride Request",
//       body: "You have a new ride request.",
//       data: { orderData: data },
//     };

//     await axios.post("https://exp.host/--/api/v2/push/send", message);
//   };

//   const handleOrder = async () => {
//     const currentLocationName = await axios.get(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentLocation?.latitude},${currentLocation?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
//     );
//     const destinationLocationName = await axios.get(
//       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker?.latitude},${marker?.longitude}&key=${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}`
//     );

//     const data = {
//       user,
//       currentLocation,
//       marker,
//       distance: distance.toFixed(2),
//       currentLocationName:
//         currentLocationName.data.results[0].formatted_address,
//       destinationLocation:
//         destinationLocationName.data.results[0].formatted_address,
//     };
//     const driverPushToken = "ExponentPushToken[v1e34ML-hnypD7MKQDDwaK]";

//     await sendPushNotification(driverPushToken, JSON.stringify(data));
//   };

//   return (
//     <KeyboardAvoidingView
//       style={[external.fx_1]}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <View>
//         <View
//           style={{ height: windowHeight(!keyboardAvoidingHeight ? 500 : 300) }}
//         >
//           <MapView
//             style={{ flex: 1 }}
//             region={region}
//             onRegionChangeComplete={(region) => setRegion(region)}
//           >
//             {marker && <Marker coordinate={marker} />}
//             {currentLocation && <Marker coordinate={currentLocation} />}
//             {currentLocation && marker && (
//               <MapViewDirections
//                 origin={currentLocation}
//                 destination={marker}
//                 apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}
//                 strokeWidth={4}
//                 strokeColor="blue"
//               />
//             )}
//           </MapView>
//         </View>
//       </View>
//       <View style={styles.contentContainer}>
//         <View style={[styles.container]}>
//           {locationSelected ? (
//             <>
//               {driverLoader ? (
//                 <View
//                   style={{
//                     flex: 1,
//                     alignItems: "center",
//                     justifyContent: "center",
//                     height: 400,
//                   }}
//                 >
//                   <ActivityIndicator size={"large"} />
//                 </View>
//               ) : (
//                 <ScrollView
//                   style={{
//                     paddingBottom: windowHeight(20),
//                     height: windowHeight(280),
//                   }}
//                 >
//                   <View
//                     style={{
//                       borderBottomWidth: 1,
//                       borderBottomColor: "#b5b5b5",
//                       paddingBottom: windowHeight(10),
//                       flexDirection: "row",
//                     }}
//                   >
//                     <Pressable onPress={() => setlocationSelected(false)}>
//                       <LeftArrow />
//                     </Pressable>
//                     <Text
//                       style={{
//                         margin: "auto",
//                         fontSize: 20,
//                         fontWeight: "600",
//                       }}
//                     >
//                       Gathering options
//                     </Text>
//                   </View>
//                   <View style={{ padding: windowWidth(10) }}>
//                     {driverLists?.map((driver: DriverType) => (
//                       <Pressable
//                         style={{
//                           width: windowWidth(420),
//                           borderWidth:
//                             selectedVehcile === driver.vehicle_type ? 2 : 0,
//                           borderRadius: 10,
//                           padding: 10,
//                           marginVertical: 5,
//                         }}
//                         onPress={() => {
//                           setselectedVehcile(driver.vehicle_type);
//                         }}
//                       >
//                         <View style={{ margin: "auto" }}>
//                           <Image
//                             source={
//                               driver?.vehicle_type === "Car"
//                                 ? require("@/assets/images/vehicles/car.png")
//                                 : driver?.vehicle_type === "Motorcycle"
//                                 ? require("@/assets/images/vehicles/bike.png")
//                                 : require("@/assets/images/vehicles/bike.png")
//                             }
//                             style={{ width: 90, height: 80 }}
//                           />
//                         </View>
//                         <View
//                           style={{
//                             flexDirection: "row",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                           }}
//                         >
//                           <View>
//                             <Text style={{ fontSize: 20, fontWeight: "600" }}>
//                               RideWave {driver?.vehicle_type}
//                             </Text>
//                             <Text style={{ fontSize: 16 }}>
//                               {getEstimatedArrivalTime(travelTimes.driving)}{" "}
//                               dropoff
//                             </Text>
//                           </View>
//                           <Text
//                             style={{
//                               fontSize: windowWidth(20),
//                               fontWeight: "600",
//                             }}
//                           >
//                             BDT{" "}
//                             {(
//                               distance.toFixed(2) * parseInt(driver.rate)
//                             ).toFixed(2)}
//                           </Text>
//                         </View>
//                       </Pressable>
//                     ))}

//                     <View
//                       style={{
//                         paddingHorizontal: windowWidth(10),
//                         marginTop: windowHeight(15),
//                       }}
//                     >
//                       <Button
//                         backgroundColor={"#000"}
//                         textColor="#fff"
//                         title={`Confirm Booking`}
//                         onPress={() => handleOrder()}
//                       />
//                     </View>
//                   </View>
//                 </ScrollView>
//               )}
//             </>
//           ) : (
//             <>
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <TouchableOpacity onPress={() => router.back()}>
//                   <LeftArrow />
//                 </TouchableOpacity>
//                 <Text
//                   style={{
//                     margin: "auto",
//                     fontSize: windowWidth(25),
//                     fontWeight: "600",
//                   }}
//                 >
//                   Plan your ride
//                 </Text>
//               </View>
//               {/* picking up time */}
//               <View
//                 style={{
//                   width: windowWidth(200),
//                   height: windowHeight(28),
//                   borderRadius: 20,
//                   backgroundColor: color.lightGray,
//                   alignItems: "center",
//                   justifyContent: "center",
//                   marginVertical: windowHeight(10),
//                 }}
//               >
//                 <View style={{ flexDirection: "row", alignItems: "center" }}>
//                   <Clock />
//                   <Text
//                     style={{
//                       fontSize: windowHeight(12),
//                       fontWeight: "600",
//                       paddingHorizontal: 8,
//                     }}
//                   >
//                     Pick-up now
//                   </Text>
//                   <DownArrow />
//                 </View>
//               </View>
//               {/* picking up location */}
//               <View
//                 style={{
//                   borderWidth: 2,
//                   borderColor: "#000",
//                   borderRadius: 15,
//                   marginBottom: windowHeight(15),
//                   paddingHorizontal: windowWidth(15),
//                   paddingVertical: windowHeight(5),
//                 }}
//               >
//                 <View style={{ flexDirection: "row" }}>
//                   <PickLocation />
//                   <View
//                     style={{
//                       width: Dimensions.get("window").width * 1 - 110,
//                       borderBottomWidth: 1,
//                       borderBottomColor: "#999",
//                       marginLeft: 5,
//                       height: windowHeight(20),
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: "#2371F0",
//                         fontSize: 18,
//                         paddingLeft: 5,
//                       }}
//                     >
//                       Current Location
//                     </Text>
//                   </View>
//                 </View>
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     paddingVertical: 12,
//                   }}
//                 >
//                   <PlaceHolder />
//                   <View
//                     style={{
//                       marginLeft: 5,
//                       width: Dimensions.get("window").width * 1 - 110,
//                     }}
//                   >
//                     <GooglePlacesAutocomplete
//                       placeholder="Where to?"
//                       onPress={(data, details = null) => {
//                         setkeyboardAvoidingHeight(true);
//                         setPlaces([
//                           {
//                             description: data.description,
//                             place_id: data.place_id,
//                           },
//                         ]);
//                       }}
//                       query={{
//                         key: `${process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!}`,
//                         language: "en",
//                       }}
//                       styles={{
//                         textInputContainer: {
//                           width: "100%",
//                         },
//                         textInput: {
//                           height: 38,
//                           color: "#000",
//                           fontSize: 16,
//                         },
//                         predefinedPlacesDescription: {
//                           color: "#000",
//                         },
//                       }}
//                       textInputProps={{
//                         onChangeText: (text) => handleInputChange(text),
//                         value: query,
//                         onFocus: () => setkeyboardAvoidingHeight(true),
//                       }}
//                       onFail={(error) => console.log(error)}
//                       fetchDetails={true}
//                       debounce={200}
//                     />
//                   </View>
//                 </View>
//               </View>
//               {/* Last sessions */}
//               {places.map((place: any, index: number) => (
//                 <Pressable
//                   key={index}
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     marginBottom: windowHeight(20),
//                   }}
//                   onPress={() => handlePlaceSelect(place.place_id)}
//                 >
//                   <PickUpLocation />
//                   <Text style={{ paddingLeft: 15, fontSize: 18 }}>
//                     {place.description}
//                   </Text>
//                 </Pressable>
//               ))}
//             </>
//           )}
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }
