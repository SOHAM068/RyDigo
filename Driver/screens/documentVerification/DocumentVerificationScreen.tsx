import { ScrollView, Text, View } from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import TitleView from "@/components/TitleView";
import Input from "@/components/common/Input";
import SelectInput from "@/components/common/SelectInput";
import Button from "@/components/common/Button";
import color from "@/themes/app.colors";
import styles from "../signup/styles";
import ProgressBar from "@/components/common/ProgressBar";
import { useTheme } from "@react-navigation/native";
import { countryNameItems } from "@/configs/country-name-list";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { Toast } from "react-native-toast-notifications";

export default function SignUpScreen() {
  const driverData = useLocalSearchParams();
  // console.log("driverData : ", driverData);

  const { colors } = useTheme();
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleType: "Car",
    registrationNumber: "",
    registrationDate: "",
    drivingLicenseNumber: "",
    color: "",
    rate: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData, // get previous data and update the key with new value using spread operator
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const driver = {
      ...driverData, // get data from previous screen (SignUpScreen) using useLocalSearchParams
      vehicle_type: formData.vehicleType,
      registration_number: formData.registrationNumber,
      registration_date: formData.registrationDate,
      driving_license: formData.drivingLicenseNumber,
      vehicle_color: formData.color,
      rate: formData.rate,
    };

    // console.log("driver (DocumentVerification) : ", driver);
    await axios
      .post(`${process.env.EXPO_PUBLIC_SERVER_URI}/driver/send-otp`, {
        phone_number: `+${driverData.phone_number}`,
      })
      .then((res) => {
        router.push({
          pathname: "/(routes)/PhoneNumberVerification",
          params: driver,
        });
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        Toast.show(err.message, {
          placement: "bottom",
          type: "danger",
        });
      });
  };
  return (
    <ScrollView>
      <View>
        {/* logo */}
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowHeight(22),
            paddingTop: windowHeight(50),
            textAlign: "center",
          }}
        >
          Ride Wave
        </Text>
        <View style={{ padding: windowWidth(20) }}>
          <ProgressBar fill={2} />
          <View
            style={[styles.subView, { backgroundColor: colors.background }]}
          >
            <View style={styles.space}>
              <TitleView
                title={"Create your account"}
                subTitle={"Explore your life by joining RyDigo"}
              />
              <SelectInput
                title="Vehicle Type"
                placeholder="Choose your vehicle type"
                value={formData.vehicleType}
                onValueChange={(text) => handleChange("vehicleType", text)}
                showWarning={showWarning && formData.vehicleType === ""}
                items={[
                  { label: "Car", value: "Car" },
                  { label: "Motorcycle", value: "Motorcycle" },
                  { label: "cng", value: "cng" },
                ]}
              />
              <Input
                title="Registration Number"
                placeholder="Enter your vehicle registration number"
                keyboardType="number-pad"
                value={formData.registrationNumber}
                onChangeText={(text) =>
                  handleChange("registrationNumber", text)
                }
                showWarning={showWarning && formData.registrationNumber === ""}
                warning={"Please enter your vehicle registration number!"}
              />
              <Input
                title="Vehicle Registration Date"
                placeholder="Enter your vehicle registration date"
                value={formData.registrationDate}
                onChangeText={(text) => handleChange("registrationDate", text)}
                showWarning={showWarning && formData.registrationDate === ""}
                warning={"Please enter your vehicle registration number date!"}
              />
              <Input
                title={"Driving License Number"}
                placeholder={"Enter your driving license number"}
                keyboardType="number-pad"
                value={formData.drivingLicenseNumber}
                onChangeText={(text) =>
                  handleChange("drivingLicenseNumber", text)
                }
                showWarning={
                  showWarning && formData.drivingLicenseNumber === ""
                }
                warning={"Please enter your driving license number!"}
              />
              <Input
                title={"Vehicle Color"}
                placeholder={"Enter your vehicle color"}
                value={formData.color}
                onChangeText={(text) => handleChange("color", text)}
                showWarning={showWarning && formData.color === ""}
                warning={"Please enter your vehicle color!"}
              />
              <Input
                title={"Rate per km"}
                placeholder={
                  "How much you want to charge from your passenger per km."
                }
                keyboardType="number-pad"
                value={formData.rate}
                onChangeText={(text) => handleChange("rate", text)}
                showWarning={showWarning && formData.rate === ""}
                warning={
                  "Please enter how much you want to charge from your customer per km."
                }
              />
            </View>
            <View style={styles.margin}>
              <Button
                onPress={() => handleSubmit()}
                height={windowHeight(30)}
                title={"Submit"}
                backgroundColor={color.buttonBg}
                textColor={color.whiteColor}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
