import React from "react";
import Svg, { LinearGradient, Defs, Stop, Rect } from "react-native-svg";
import styled from "styled-components/native";

const StyledSVG = styled(Svg)`
  position: absolute;
  bottom: 0;
  width: 100%;
`;

export type Props = React.ComponentProps<typeof Svg> & {
  color?: string;
  style?: React.ComponentProps<typeof Svg>["style"];
};

export default function Gradient({ color = "primary.c50", style }: Props): JSX.Element {
  return (
    <StyledSVG style={style}>
      <Defs>
        <LinearGradient
          id="myGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
          gradientUnits="userSpaceOnUse"
        >
          <Stop key="0%" offset="0" stopOpacity={1} stopColor={color} />,
          <Stop key="100%" offset="100%" stopOpacity={0.1} stopColor={color} />,
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" opacity={0.6} fill="url(#myGradient)" />
    </StyledSVG>
  );
}
