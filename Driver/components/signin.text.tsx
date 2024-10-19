import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";

export default function SignInText({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <>
      <Text
        style={[
          commonStyles.regularTextBigBlack,
          { color: color.primary, textAlign: "left", marginTop: 20, fontWeight: "700" },
        ]}
      >
        {title ? title : "Join to take your ride 😃"}
      </Text>

      <Text
        style={[commonStyles.regularText, external.pt_4, { textAlign: "left" }]}
      >
        {subtitle
          ? subtitle
          : "Enter your phone number, get one otp and let's go 😍"}
      </Text>
    </>
  );
}
