"use client";

import { ConfigProvider, theme } from "antd";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import React from "react";

const muiTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#5ec553",
    borderRadius: 8,
  },
};

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      <ConfigProvider theme={antdTheme}>{children}</ConfigProvider>
    </ThemeProvider>
  );
}
