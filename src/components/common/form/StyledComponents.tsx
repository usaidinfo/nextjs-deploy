// src/components/common/form/StyledComponents.tsx
import { styled } from "@mui/material/styles";

export const AnimatedInput = styled("div")({
  position: "relative",
  overflow: "hidden",
  borderRadius: "40px",
  padding: "2px",
  width: "100%",
  minWidth: "300px",

  "&::before": {
    content: '""',
    position: "absolute",
    width: "150px",
    height: "150%",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)",
    animation: "rotate 3s linear infinite",
    top: "-25%",
    left: "-50px",
    transform: "rotate(45deg)",
  },

  "@keyframes rotate": {
    "0%": {
      transform: "translateX(-100%) rotate(45deg)",
    },
    "100%": {
      transform: "translateX(200%) rotate(45deg)",
    },
  },
});

export const StyledInput = styled("input")({
  width: "100%",
  minWidth: "300px",
  padding: "12px 24px",
  background: "rgba(24, 24, 27, 0.2)",
  border: "none",
  outline: "none",
  color: "white",
  fontSize: "14px",
  borderRadius: "40px",
  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: "12px",
  },
});

export const FormLabel = styled("label")({
  display: "block",
  color: "white",
  marginBottom: "8px",
  fontSize: "14px",
});