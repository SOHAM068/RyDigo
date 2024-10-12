import react, { ReactNode } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { external } from "@/styles/external.style";
import Images from "../ImagesUtils";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import styles from "./styles";

type Props = {
  container: ReactNode;
  topSpace: any;
  imageShow: boolean;
};

const AuthContainer = ({ container, topSpace, imageShow }: Props) => {
  return (
    <KeyboardAvoidingView
      style={[external.fx_1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {imageShow && (
        <Text
          style={{
            fontFamily: "TT-Octosquares-Medium",
            fontSize: windowWidth(30),
            textAlign: "center",
            paddingTop: windowHeight(50),
          }}
        >
          RyDigo
        </Text>
      )}

      <Image
        source={Images.authBg}
        style={[styles.backgroundImage, { marginTop: topSpace }]}
      />

      <View style={styles.contentContainer}>
        <View style={[styles.container]}>
          <ScrollView>{container}</ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AuthContainer;
