import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { external } from "@/styles/external.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import MapView, { Callout, Marker } from "react-native-maps";
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
import * as IntentLauncher from "expo-intent-launcher";
import moment from "moment";
import { ParseDuration } from "@/utils/ParseDuration";
import { CustomMarker } from "@/assets/icons/custom-marker";
import { BlueMarker } from "@/assets/icons/custom-marker2";
import Button from "@/components/common/Button";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function RidePlanScreen() {
  const [places, setPlaces] = useState<any>([]);
  const [query, setQuery] = useState("");

  const initialLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };
  const [pin, setPin] = useState({}); // pin for the location selected
  const [region, setRegion] = useState({
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef<MapView | null>(null);
  const local = {
    latitude: "37.78825",
    longitude: "-122.4324",
  };
  const [marker, setMarker] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<any>(initialLocation);
  const [distance, setDistance] = useState<any>(null);
  const [locationSelected, setLocationSelected] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [keyboardAvoidingHeight, setKeyboardAvoidingHeight] = useState(false);
  const [travelTimes, setTravelTimes] = useState({
    driving: null,
    walking: null,
    bicycling: null,
    transit: null,
  });

  useEffect(() => {
    setPin(local);
    _getLocation();
  }, []);

  // access the user's current location
  const _getLocation = async () => {
    // Fetch current location when the component mounts
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show(
          "Please approve your location tracking otherwise you can't use this app!",
          {
            type: "danger",
            placement: "top",
          }
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation(location.coords);
      console.log("Current location:", location);
      // Update the region with the current location to focus the map
    } catch (error) {
      console.error("Error fetching location:", error);
      Toast.show("Unable to fetch location", {
        type: "danger",
        placement: "top",
      });
    }
  };

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

  const fetchPlaces = async (input: any) => {
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

  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 100), []); // Debounce the fetchPlaces function to avoid making too many requests in a short amount of time (100ms) to the Google Places API to avoid being rate limited by Google
  useEffect(() => {
    if (query.length > 2) {
      debouncedFetchPlaces(query);
    } else {
      setPlaces([]);
    }
  }, [query, debouncedFetchPlaces]);

  const handleInputChange = (text: any) => {
    setQuery(text);
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

  const handlePlacesSelect = async (placeId: any) => {
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
      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
      });
      setMarker({
        latitude: lat,
        longitude: lng,
      });
      setPlaces([]);
      setLocationSelected(true);
      setKeyboardAvoidingHeight(false);
      if (currentLocation) {
        await fetchTravelTimes(currentLocation, selectedDestination);
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
  
    // Log for debugging
    // console.log("Current Time:", now.format("hh:mm A"));
    // console.log("Parsed Travel Time (minutes):", travelMinutes);
    // console.log("Arrival Time:", arrivalTime.format("hh:mm A"));
  
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

  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <>
        <View>
          <View
            style={{
              height: windowHeight(!keyboardAvoidingHeight ? 500 : 300),
            }}
          >
            <MapView
              region={region}
              onRegionChangeComplete={(region) => setRegion(region)}
              style={{ flex: 1 }}
              ref={mapRef}
              provider={Platform.OS === "android" ? "google" : undefined}
              showsUserLocation={true}
            >
              {/* Marker for the destination (if set) */}
              {marker && (
                <Marker
                  coordinate={marker}
                  title="Your Destination!"
                  description="This is your destination location"
                  // // Custom image for the marker
                  // icon={require("@/assets/images/line2.png")}
                  // pinColor="blue"
                >
                  <BlueMarker />
                  <Callout>
                    <View
                      style={{
                        padding: 5,
                        width: 150,
                        flexDirection: "column",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "red",
                          textAlign: "center",
                        }}
                      >
                        Your Destination
                      </Text>
                      <Text style={{ textAlign: "center" }}>
                        You will reach this location!
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              )}

              {/* Marker for the current location */}
              {currentLocation && (
                <Marker
                  coordinate={currentLocation}
                  title="You are here!"
                  description="This is your current location"
                >
                  <CustomMarker />
                  <Callout>
                    <View
                      style={{
                        padding: 4,
                        width: 150,
                        flexDirection: "column",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          color: "blue",
                          textAlign: "center",
                        }}
                      >
                        Your Location
                      </Text>
                      <Text style={{ textAlign: "center" }}>
                        You are here right now!
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              )}

              {/* Display directions between current location and marker */}
              {currentLocation && marker && (
                <MapViewDirections
                  origin={currentLocation}
                  destination={marker}
                  apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY!} // Make sure you have the API key setup
                  strokeWidth={4}
                  strokeColor="blue"
                />
              )}
            </MapView>
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
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.container}>
            {locationSelected ? (
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
                  <Pressable
                    style={{
                      width: windowWidth(410),
                      borderWidth: selectedVehicle === "car" ? 2 : 0,
                      borderRadius: 10,
                      padding: 10,
                      marginVertical: 5,
                      backgroundColor: selectedVehicle === "car" ? "#f0f0f0" : "#fff",
                    }}
                    onPress={() => {
                      setSelectedVehicle("car");
                    }}
                  >
                    <View style={{ margin: "auto" }}>
                      <Image
                        source={require("@/assets/images/vehicles/car.png")}
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
                        RyDigo X
                      </Text>
                      <View style={{ flexDirection: "column" }}>
                        <Text style={{ fontSize: 16 }}>
                          {getEstimatedArrivalTime(travelTimes.driving)} DropOff
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
                      Rs {(distance.toFixed(2) * 45).toFixed(2)}
                    </Text>
                  </Pressable>
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
                    onPress={() => {}}
                  />
                </View>
              </ScrollView>
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
                      paddingVertical: 12,
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
                        placeholder="Where to?"
                        onPress={(data, details = null) => {
                          setKeyboardAvoidingHeight(true);
                          // Handle place selection
                          setQuery(data.description); // Set the selected description
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
                          value: query,
                          onChangeText: handleInputChange,
                          onFocus: () => setKeyboardAvoidingHeight(true),
                        }}
                        onFail={(error) => {
                          console.log("Error fetching places:", error); // Log error details
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
                        debounce={300}
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
                    onPress={() => handlePlacesSelect(place.place_id)}
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
