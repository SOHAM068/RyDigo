import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import color from '@/themes/app.colors'
import { external } from '@/styles/external.style'
import { windowHeight } from '@/themes/app.constant'
import { commonStyles } from '@/styles/common.style'

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    width,
    backgroundColor,
    textColor
}) => {
    const widthNumber = width || "100%";
    return(
        <Pressable
            style={[styles.container, {width: widthNumber, backgroundColor: backgroundColor || color.buttonBg}]}
            onPress={onPress}
        >
            <Text style={[commonStyles.extraBold, {color: textColor || color.whiteColor}]}>
                {title}
            </Text>
        </Pressable>
    )
}

export default Button

const styles = StyleSheet.create({
    container: {
        backgroundColor: color.buttonBg,
        height: windowHeight(40),
        borderRadius: 6,
        ...external.ai_center,
        ...external.js_center
    }
})