import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../theme/ThemeContext";

export default function Layout() {
	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<Stack screenOptions={{ headerShown: false }} />
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
