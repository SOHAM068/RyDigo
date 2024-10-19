import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import fonts from "@/themes/app.fonts";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

interface InputProps {
  title?: string;
  placeholder: string;
  items: { label: string; value: string }[];
  value?: string;
  warning?: string;
  onValueChange: (value: string) => void;
  showWarning?: boolean;
}

export default function SelectInput({
  title,
  placeholder,
  items,
  value,
  warning,
  onValueChange,
  showWarning,
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      <View style={styles.inputContainer}>
        <RNPickerSelect
          onValueChange={onValueChange}
          items={items}
          placeholder={{ label: placeholder, value: null }}
          style={pickerSelectStyles}
          value={value}
        />
      </View>
      {showWarning && <Text style={styles.warning}>{warning}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: windowHeight(16),
  },
  title: {
    fontFamily: fonts.medium,
    fontSize: windowWidth(16),
    marginBottom: windowHeight(8),
    color: color.primaryText,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: 8,
    backgroundColor: color.lightGray,
    overflow: 'hidden',
  },
  warning: {
    color: color.red,
    fontSize: windowWidth(12),
    marginTop: windowHeight(4),
    fontFamily: fonts.regular,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: windowWidth(16),
    paddingVertical: windowHeight(12),
    paddingHorizontal: windowWidth(10),
    color: color.primaryText,
    fontFamily: fonts.regular,
  },
  inputAndroid: {
    fontSize: windowWidth(16),
    paddingHorizontal: windowWidth(10),
    paddingVertical: windowHeight(8),
    color: color.primaryText,
    fontFamily: fonts.regular,
  },
});