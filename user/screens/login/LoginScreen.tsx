import { Image, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/AuthContainer";
import { windowHeight } from "@/themes/app.constant";
import Images from "@/utils/ImagesUtils";
import styles from "./styles";
import SignInText from "@/components/signin.text";
import { external } from "@/styles/external.style";
import PhoneNumberInput from "@/components/phone-number.input";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";

export default function LoginScreen() {
  const [phone_number, setPhone_number] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = async () => {
    if (phone_number === "" || countryCode === "") {
      toast.show("Please fill both fields", {
        placement: "bottom",
        type: "danger",
      });
    } else {
      setLoading(true);
      const phoneNumber = `${countryCode}${phone_number}`;
      await axios
        .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/registration`, {
          phone_number: phoneNumber,
        })
        .then((res:any) => {
          setLoading(false);
          router.push({
            pathname: "/(routes)/OtpVerification",
            params: {phoneNumber}
          })
        })
        .catch((err: any) => {
          console.log(err);
          setLoading(false);
          toast.show(
            "Something went wrong! please re check your phone number!",
            {
              type: "danger",
              placement: "bottom",
            }
          );
        })
    }
  };

  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <View>
          <View>
            <View>
              <Image style={styles.transformLine} source={Images.line} />
              <SignInText />
              <View style={[external.mt_25, external.Pb_10]}>
                <PhoneNumberInput
                  phone_number={phone_number}
                  setPhone_number={setPhone_number}
                  countryCode={countryCode}
                  setCountryCode={setCountryCode}
                />
                <View style={[external.mt_25, external.Pb_15]}>
                  <Button
                    title="Get Otp"
                    onPress={() => handleSubmit()}
                    disabled={loading}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      }
    />
  );
}
