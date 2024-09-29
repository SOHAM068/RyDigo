import { Text, TextInput, View } from "react-native";
import React from "react";
import { commonStyles } from "@/styles/common.style";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";

export default function PhoneNumberInput() {
  return (
    <View>
      <Text
        style={[commonStyles.mediumTextBlack, { marginTop: windowHeight(8) }]}
      >
        Phone Number
      </Text>

      <View
        style={[
          external.ai_center,
          external.fd_row,
          external.mt_5,
          { flexDirection: "row" },
        ]}
      >
        <View style={[]}>
          <TextInput
            style={[commonStyles.regularText]}
            placeholder="+91"
            placeholderTextColor={color.subtitle}
            keyboardType="numeric"
          />
        </View>

        <View style={[]}>
          <TextInput
            style={[commonStyles.regularText]}
            placeholderTextColor={color.subtitle}
            placeholder={"Enter your number"}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
      </View>
    </View>
  );
}
