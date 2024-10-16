import { Image, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import AuthContainer from "@/utils/container/AuthContainer";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/Button";
import SignInText from "@/components/signin.text";
import { external } from "@/styles/external.style";
import styles from "./styles";
import PhoneNumberInput from "@/components/phone-number.input";
import { router } from "expo-router";
import Images from "@/utils/ImagesUtils";
import { Toast } from "react-native-toast-notifications";
import axios from "axios";

export default function LoginScreen() {
  const [phone_number, setPhone_number] = useState("");
  const [countryCode, setCountryCode] = useState(" ");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone_number === "" || countryCode === "") {
      Toast.show("Please fill the fields!", {
        placement: "bottom",
      });
    } else {
      setLoading(true);
      const phoneNumber = `+${countryCode}${phone_number}`;
      console.log("phoneNumber : ", phoneNumber);
      await axios
        .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`, {
          phone_number: phoneNumber,
        })
        .then((res: any) => {
          setLoading(false);
          const driver = {
            phone_number: phoneNumber,
          };
          router.push({
            pathname: "/(routes)/PhoneNumberVerification",
            params: driver,
          });
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          Toast.show(
            "Something went wrong! please re check your phone number!",
            {
              type: "danger",
              placement: "top",
            }
          );
        });
    }
  };
  return (
    <AuthContainer
      topSpace={windowHeight(150)}
      imageShow={true}
      container={
        <>
          <View>
            <View>
              <View>
                <Image style={styles.transformLine} source={Images.line} />
                <SignInText />
                <View style={[external.mt_25, external.Pb_10]}>
                  <PhoneNumberInput
                    phone_number={phone_number}
                    setphone_number={setPhone_number}
                    countryCode={countryCode}
                    setCountryCode={setCountryCode}
                  />
                  <View style={[external.mt_25, external.Pb_15]}>
                    <Button
                      title="Get Otp"
                      disabled={loading}
                      height={windowHeight(35)}
                      onPress={() => handleSubmit()}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: windowWidth(8),
                      paddingBottom: windowHeight(15),
                    }}
                  >
                    <Text style={{ fontSize: windowHeight(12) }}>
                      Don't have any rider account?
                    </Text>
                    <TouchableOpacity
                    onPress={() => router.push("/(routes)/SignUp")}
                    >
                      <Text
                        style={{ color: "blue", fontSize: windowHeight(12) }}
                      >
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </>
      }
    />
  );
}
