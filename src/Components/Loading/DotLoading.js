import React from "react";
import { Box } from "@mui/material";

const DottedCircleLoading = () => {
  const dots = Array.from({ length: 12 });

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      mt: 4
    }}>
      <Box sx={{
        position: "relative",
        width: "40px",
        height: "40px"
      }}>
        {dots.map((_, i) => (
          <Box key={i} sx={{
            position: "absolute",
            width: "6px",
            height: "6px",
            backgroundColor: "#2E5AAC",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: `rotate(${i * 30}deg) translate(16px)`,
            animation: "fade-animation 1.2s linear infinite",
            animationDelay: `${i * 0.1}s`,
            "@keyframes fade-animation": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.3 },
              "100%": { opacity: 1 }
            }
          }} />
        ))}
      </Box>
    </Box>
  );
};

export default DottedCircleLoading;
