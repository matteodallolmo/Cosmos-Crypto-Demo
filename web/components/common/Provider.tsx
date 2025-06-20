import { ThemeProvider, useTheme } from "@interchain-ui/react";
import { darkTheme, lightTheme, CustomTheme } from "@/config";
import { useEffect } from "react";

type CustomThemeProviderProps = {
  children: React.ReactNode;
};

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!theme) {
      setTheme("light");
    }
  }, [theme, setTheme]);

  return (
    <ThemeProvider
      themeDefs={[lightTheme, darkTheme]}
      customTheme={CustomTheme[theme]}
    >
      {children}
    </ThemeProvider>
  );
};
