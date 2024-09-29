import { Redirect } from "expo-router";
import { useState } from "react";

export default function index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <Redirect href={!isLoggedIn ? "/(routes)/OnBoardingRoute" : "/(tabs)/home"} />
  )
}