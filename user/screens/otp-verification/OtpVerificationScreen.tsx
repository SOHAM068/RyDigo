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
import { useToast } from "react-native-toast-notifications";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OtpVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  const { phoneNumber } = useLocalSearchParams();
  const toast = useToast();

  const handleSubmit = async () => {
    if (otp === "") {
      toast.show("Please fill both fields", {
        placement: "top",
        type: "danger",
      });
    } else {
      setLoading(true);
      const otpNumber = `${otp}`;
      console.log("OTP :", otpNumber);
      await axios
        .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/verify-otp`, {
          phone_number: phoneNumber,
          otp: otpNumber,
        })
        .then(async(res: any) => {
          setLoading(false);
          // console.log("response", res);
          if (res.data.user.email === null) {
            router.push({
              pathname: "/(routes)/Registration",
              params: { user: JSON.stringify(res.data.user) },
            });
            toast.show("OTP Verified Successfully!");
          } else {
            await AsyncStorage.setItem("accessToken", res.data.accessToken);
            router.push("/(tabs)/home");
          }
        })
        .catch((err: any) => {
          console.log(err);
          setLoading(false);
          toast.show("Something went wrong! please re check your OTP!", {
            type: "danger",
            placement: "bottom",
          });
        });
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
