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

export default function LoginScreen() {
  const [phone_number, setPhone_number] = useState("");
  const [countryCode, setCountryCode] = useState(" ");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async() => {
    router.push("/(routes)/PhoneNumberVerification");
  }
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
