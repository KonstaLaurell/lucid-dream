import React, { createContext, useContext, useState, ReactNode } from "react";
import { Appearance } from "react-native";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
	mode: ThemeMode;
	toggle: () => void;
	colors: {
		background: string;
		text: string;
		cardBackground: string;
		buttonBackground: string;
		buttonText: string;
		accent: string;
		border: string;
		shadow: string;
	};

	fonts: {
		headerFont: string;
		bodyFont: string;
	};
}

const defaultMode = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const ThemeContext = createContext<ThemeContextType>({
	mode: defaultMode,
	toggle: () => {},
	colors: {
		background: "#fff",
		text: "#000",
		cardBackground: "#f9f9f9",
		buttonBackground: "#4CAF50",
        buttonText: "#fff",
        accent: "#007AFF",
        border: "#ccc",
        shadow: "rgba(0,0,0,0.1)",
	},
	fonts: {
		headerFont: "Roboto-Bold",
		bodyFont: "Roboto-Regular",
	},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<ThemeMode>(defaultMode);

	const toggle = () =>
		setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));

    const lightTheme = {
		background: "#FFFFFF",
		text: "#1C1C1E",
		cardBackground: "#F2F2F7",
		buttonBackground: "#4CAF50",
		buttonText: "#FFFFFF",
		accent: "#007AFF",
		border: "#C7C7CC",
		shadow: "rgba(0,0,0,0.1)",
	};

	const darkTheme = {
		background: "#121212",
		text: "#FFFFFF",
		cardBackground: "#1E1E1E",
		buttonBackground: "#BB86FC",
		buttonText: "#000000",
		accent: "#0A84FF",
		border: "#3A3A3C",
		shadow: "rgba(255,255,255,0.05)",
	};
    

	const currentColors = mode === "dark" ? darkTheme : lightTheme;

	const theme = {
		mode,
		toggle,
		colors: currentColors,
		fonts: {
			headerFont: "Roboto-Bold",
			bodyFont: "Roboto-Regular",
		},
	};

	return (
		<ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
