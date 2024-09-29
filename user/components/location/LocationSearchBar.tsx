import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { styles } from "./styles";
import color from "@/themes/app.colors";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import DownArrow from "@/assets/icons/downArrow";
import { Clock, Search } from "@/utils/IconsUtils";

export default function LocationSearchBar() {
  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: color.lightGray,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: windowWidth(18),
          paddingRight: windowWidth(40),
        },
      ]}
      onPress={() => {}}
    >
      <View style={{ flexDirection: "row", paddingLeft: windowWidth(30) }}>
        <Search />
        <Text
          style={[
            styles.textInputStyle,
            { fontSize: 20, fontWeight: "500", color: "000" },
          ]}
        >
          Where To?
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#fff",
          justifyContent: "center",
          width: windowWidth(130),
          height: windowWidth(28),
          alignItems: "center",
          borderRadius: 20,
        }}
      >
        <View style={{flexDirection: "row", alignItems: "center"}}>
            <Clock />
            <Text style={{fontSize: windowHeight(12), fontWeight: "600", paddingHorizontal: 8}}>
                Now
            </Text>
            <DownArrow />
        </View>
      </View>
    </Pressable>
  );
}
