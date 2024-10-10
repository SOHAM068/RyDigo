import { SafeAreaView, Text, View } from "react-native";
import React from "react";
import styles from "./styles";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/LocationSearchBar";

export default function HomeScreen() {
  return (
    <View style={[commonStyles.flexContainer, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={styles.container}>
        <View style={[external.p_5, external.ph_20]}>
          <Text
            style={{
              fontFamily: "TT-Octosquares-Medium",
              fontSize: 25,
            }}
          >
            RyDigo
          </Text>

          <LocationSearchBar />
          
        </View>
      </SafeAreaView>
    </View>
  );
}
