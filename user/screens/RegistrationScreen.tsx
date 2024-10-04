import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useTheme } from "@react-navigation/native";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import TitleView from "@/components/TitleView";
import Input from "@/components/common/Input";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/common/Button";
import color from "@/themes/app.colors";
import axios from "axios";
import { useToast } from "react-native-toast-notifications";

export default function RegistrationScreen() {
  const { colors } = useTheme();
  const [emailFormatWarning, setEmailFormatWarning] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const { user } = useLocalSearchParams() as any;
  const parsedUser = JSON.parse(user);

  const toast = useToast();

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => {
      return {
        ...prevData,
        [key]: value,
      };
    });
  };

  const handleSignUp = async () => {
    setLoading(true);
    await axios
      .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/email-otp-request`, {
        email: formData.email,
        name: formData?.name,
        userId: parsedUser.id,
      })
      .then((res: any) => {
        setLoading(false);
        const userData: any = {
          id: parsedUser.id,
          name: formData.name,
          email: formData.email,
          phone_number: parsedUser.phone_number,
          token: res.data.token
        };
        router.push({
          pathname: "/(routes)/EmailVerification",
          params: { user: JSON.stringify(userData) },
        });
      })
      .catch((err: any) => {
        console.log(err);
        setLoading(false);
        toast.show("Something went wrong! please re check your email!", {
          type: "danger",
          placement: "bottom",
        });
      });
  };

  return (
    <ScrollView>
      <View>
        <View>
          {/* {logo} */}
          <Text
            style={{
              fontFamily: "TT-Octosquares-Medium",
              fontSize: windowHeight(25),
              paddingTop: windowHeight(50),
              textAlign: "center",
            }}
          >
            RyDigo
          </Text>

          <View style={{ padding: windowWidth(20) }}>
            <View
              style={[styles.subView, { backgroundColor: colors.background }]}
            >
              <View style={[styles.space]}>
                <TitleView
                  title="Create Your Account"
                  subTitle="Explore your life by joining RyDigo"
                />
                <Input
                  title="Name"
                  placeholder="Enter Your Name"
                  value={formData?.name}
                  onChangeText={(text) => handleChange("name", text)}
                  showWarning={showWarning && formData.name === ""}
                  warning="Please enter your name!"
                />
                <Input
                  title="Phone Number"
                  placeholder="Enter Your Phone Number"
                  value={parsedUser?.phone_number}
                  disabled={true}
                />
                <Input
                  title="Email"
                  placeholder="Enter Your Email"
                  value={formData?.email}
                  onChangeText={(text) => handleChange("email", text)}
                  showWarning={
                    (showWarning && formData.email === "") ||
                    emailFormatWarning !== ""
                  }
                  warning={
                    emailFormatWarning !== ""
                      ? "Please enter your email"
                      : "Please enter a valid email!"
                  }
                  emailFormatWarning={emailFormatWarning}
                />
                <View style={styles.margin}>
                  <Button
                    onPress={() => handleSignUp()}
                    title="Next"
                    disabled={loading}
                    backgroundColor={color.buttonBg}
                    textColor={color.whiteColor}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  subView: {
    height: "100%",
  },
  space: {
    marginHorizontal: windowWidth(4),
  },
  margin: {
    marginVertical: windowHeight(12),
  },
});
