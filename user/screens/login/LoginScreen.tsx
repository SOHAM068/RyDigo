import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AuthContainer from '@/utils/container/AuthContainer'
import { windowHeight } from '@/themes/app.constant'

export default function LoginScreen() {
  return (
      <AuthContainer 
        topSpace={windowHeight(150)}
        imageShow={true}
        container={
            <View>
                <Text>Login</Text>
                
            </View>
        }
      />
  )
}

const styles = StyleSheet.create({})