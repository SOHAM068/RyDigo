import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import { countryItems } from "@/configs/country-list";
import SelectInput from "./common/SelectInput";

interface Props {
  width?: number;
  phone_number: string;
  setphone_number: (phone_number: string) => void;
  countryCode: string;
  setCountryCode: (countryCode: string) => void;
}

export default function PhoneNumberInput({
  width,
  phone_number,
  setphone_number,
  countryCode,
  setCountryCode,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Phone Number</Text>
      <View style={styles.inputContainer}>
        <View style={styles.countryCodeContainer}>
          <SelectInput
            placeholder="Select country"
            value={countryCode}
            onValueChange={(text) => setCountryCode(text)}
            showWarning={false}
            warning={"Please choose your country code!"}
            items={countryItems}
          />
        </View>
        <View style={[styles.phoneNumberInput, { width: width || windowWidth(220) }]}>
          <TextInput
            style={styles.input}
            placeholderTextColor={color.subtitle}
            placeholder={"Enter your number"}
            keyboardType="numeric"
            value={phone_number}
            onChangeText={setphone_number}
            maxLength={10}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: windowHeight(20),
  },
  label: {
    fontSize: windowHeight(16),
    fontWeight: '600',
    color: color.blackColor,
    marginBottom: windowHeight(8),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    width: windowWidth(100),
    marginRight: windowWidth(10),
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneNumberInput: {
    flex: 1,
    height: windowHeight(48),
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 8,
    paddingHorizontal: windowWidth(12),
    justifyContent: 'center',
  },
  input: {
    fontSize: windowHeight(16),
    color: color.blackColor,
  },
});