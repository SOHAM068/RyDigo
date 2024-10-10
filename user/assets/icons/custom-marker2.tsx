import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import React from 'react';

export function BlueMarker({
  width,
  height,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg
      width={width || '48'}
      height={height || '48'}
      viewBox="0 0 48 48"
      fill="none"
    >
      <Defs>
        {/* Radial gradient for the shiny effect on the blue ball */}
        <RadialGradient id="gradBlue" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
          <Stop offset="40%" stopColor="#0000FF" stopOpacity="1" />
          <Stop offset="100%" stopColor="#00008B" stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Blue sphere (pin head) */}
      <Circle cx="24" cy="18" r="10" fill="url(#gradBlue)" />

      {/* Tapered pin (the bottom part) */}
      <Path
        d="M22 28 L26 28 L24 44 Z"
        fill="#C0C0C0"
        stroke="rgba(0, 0, 0, 0.2)"
        strokeWidth="1"
      />
    </Svg>
  );
}
