import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AuthContainer from "@/utils/container/AuthContainer";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/Button";
import SignInText from "@/components/signin.text";
import PhoneNumberInput from "@/components/phone-number.input";
import { router } from "expo-router";
import Images from "@/utils/ImagesUtils";
import { Toast } from "react-native-toast-notifications";
import axios from "axios";
import { external } from "@/styles/external.style";
import styles from "./styles";
import color from "@/themes/app.colors";

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
    <LinearGradient
      colors={['#F0F8FF', '#E6E6FA', '#B0E0E6']}
      style={style.container}
    >
      <AuthContainer
        topSpace={windowHeight(150)}
        imageShow={true}
        container={
          <View style={style.content}>
            <Image style={[styles.transformLine, style.logo]} source={Images.line} />
            <SignInText />
            <View style={[external.mt_25, external.Pb_10, style.inputContainer]}>
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
              <View style={style.signupContainer}>
                <Text style={style.signupText}>
                  Don't have any rider account?
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(routes)/SignUp")}
                >
                  <Text style={style.signupLink}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />
    </LinearGradient>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    padding: windowWidth(10),
    paddingBottom: windowWidth(25),
  },
  logo: {
    width: windowWidth(130),
    height: windowWidth(120),
    marginBottom: windowHeight(20),
  },
  inputContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: windowWidth(15),
    borderWidth: 1,
    borderColor: color.primary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(20),
  },
  signupText: {
    color: '#000',
    fontSize: windowHeight(12),
  },
  signupLink: {
    color: color.primary,
    fontSize: windowHeight(12),
    fontWeight: 'bold',
    marginLeft: windowWidth(5),
  },
});
