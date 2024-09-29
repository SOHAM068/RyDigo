import { Image, ImageBackground, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { styles } from "./styles";
import color from "@/themes/app.colors";
import Swiper from "react-native-swiper";
import { slides } from "@/configs/constants";
import Images from "@/utils/ImagesUtils";
import { BackArrow } from "@/utils/IconsUtils";
import { router } from "expo-router";


export default function OnBoardingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: color.whiteColor }}>
      <Swiper
        activeDotStyle={styles.activeStyle}
        removeClippedSubviews={true}
        paginationStyle={styles.paginationStyle}
        autoplay={true}
      >
        {slides.map((slide: any, index: number) => (
          <View style={[styles.slideContainer]} key={index}>
            <Image source={slide.image} style={[styles.imageBackground]} />

            <View style={[styles.imageBgView]}>
              <ImageBackground
                resizeMode="contain"
                style={styles.img}
                source={Images.bgOnboarding}
              >
                <Text style={styles.title}>{slide.text}</Text>
                <Text style={styles.description}>{slide.description}</Text>
                <TouchableOpacity
                  style={styles.backArrow}
                  onPress={() => router.push("/(routes)/LoginRoute")}
                >
                  <BackArrow colors={color.whiteColor} width={21} height={21} />
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </View>
        ))}
      </Swiper>
    </View>
  );
}
