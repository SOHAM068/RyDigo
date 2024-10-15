import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AuthContainer from "@/utils/container/AuthContainer";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/signin.text";
import OTPTextInput from "react-native-otp-textinput";
import color from "@/themes/app.colors";
import { styles } from "../phoneNumberVerification/styles";
import Button from "@/components/common/Button";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";

export default function EmailVerificationScreen() {
  const [loader, setLoader] = useState(false);
  const [otp, setOtp] = useState("");
  const driver = useLocalSearchParams();

  const handleSubmit = async () => {
    setLoader(true);
    const otpNumnber = `${otp}`;

    await axios
      .post(
        `${process.env.EXPO_PUBLIC_SERVER_URI}/driver/registration-driver`,
        {
          otp: otpNumnber,
          token: driver.token,
        }
      )
      .then(async (res: any) => {
        setLoader(false);
        await AsyncStorage.setItem("accessToken", res.data.accessToken);
        console.log("res.data.accessToken: ", res.data.accessToken);
        router.push({
          pathname: "/(tabs)/home",
          params: { driver: res.data.driver },
        });
      })
      .catch((error) => {
        setLoader(false);
        Toast.show(error.message, {
          placement: "bottom",
          type: "danger",
        });
      });
  };
  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"Email Verification"}
            subtitle={"Check your email address for the otp!"}
          />
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            tintColor={color.subtitle}
            textInputStyle={styles.otpTextInput}
            autoFocus={false}
          />
          <View style={[external.mt_30]}>
            <Button
              title="Verify"
              height={windowHeight(30)}
              onPress={() => handleSubmit()}
              disabled={loader}
            />
          </View>

          <View style={[external.mb_15]}>
            <View
              style={[
                external.pt_10,
                external.Pb_10,
                { flexDirection: "row", gap: 5, justifyContent: "center" },
              ]}
            >
              <Text style={[commonStyles.regularText]}>Not Received yet?</Text>
              <TouchableOpacity>
                <Text style={[styles.signUpText, { color: "#000" }]}>
                  Resend it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
    />
  );
}
