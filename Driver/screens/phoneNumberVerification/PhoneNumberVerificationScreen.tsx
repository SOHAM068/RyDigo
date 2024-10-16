import { Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/AuthContainer";
import { windowHeight } from "@/themes/app.constant";
import SignInText from "@/components/signin.text";
import OTPTextInput from "react-native-otp-textinput";
import { styles } from "./styles";
import color from "@/themes/app.colors";
import { external } from "@/styles/external.style";
import Button from "@/components/common/Button";
import { router, useLocalSearchParams } from "expo-router";
import { commonStyles } from "@/styles/common.style";
import { Toast, useToast } from "react-native-toast-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PhoneNumberVerificationScreen() {
  const driver = useLocalSearchParams();
  console.log("driver from PhoneNumberVerificationScreen: ", driver);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (otp === "") {
      Toast.show("Please enter the OTP", {
        placement: "top",
      });
    } else {
      if (driver.name) {
        setLoading(true);
        const otpNumber = `${otp}`;
        
        await axios
          .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/verify-otp`, {
            phone_number: driver.phone_number,
            otp: otpNumber,
            ...driver, // get data from previous screen (DocumentVerificationScreen) using useLocalSearchParams
          })
          .then((res) => {
            const driverData = {
              ...driver,
              token: res.data.token,
            };
            setLoading(false);

            router.push({
              pathname: "/(routes)/EmailVerification",
              params: driverData,
            });
          })
          .catch((err) => {
            setLoading(false);
            Toast.show("OTP is incorrect ort expired", {
              placement: "top",
              type: "danger",
            });
          });
      } else {
        setLoading(false);
        const otpNumber = `${otp}`;

        await axios
          .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/login`, {
            phone_number: driver.phone_number,
            otp: otpNumber,
          })
          .then(async (res) => {
            setLoading(false);
            await AsyncStorage.setItem("accessToken", res.data.accessToken);
            router.push("/(tabs)/home");
          })
          .catch((err) => {
            setLoading(false);
            Toast.show("OTP is incorrect or expired", {
              placement: "top",
              type: "danger",
            });
          })
      }
    }
  };
  return (
    <AuthContainer
      topSpace={windowHeight(240)}
      imageShow={true}
      container={
        <View>
          <SignInText
            title={"OTP Verification"}
            subtitle={"Enter the OTP sent to your mobile number"}
          />
          <OTPTextInput
            handleTextChange={(code) => setOtp(code)}
            inputCount={4}
            textInputStyle={styles.otpTextInput}
            tintColor={color.subtitle}
            autoFocus={false}
          />
          <View style={[external.mt_30]}>
            <Button
              title="Verify"
              onPress={() => handleSubmit()}
              disabled={loading}
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
