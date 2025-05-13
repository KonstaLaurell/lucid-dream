import { useState, useEffect } from "react";
import {
	View,
	TextInput,
	Text,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../theme/ThemeContext";

export default function EditDream() {
	const { id } = useLocalSearchParams();
	const [dream, setDream] = useState(null);
	const [text, setText] = useState("");
	const [lucidity, setLucidity] = useState(3);
	const [clarity, setClarity] = useState(3);
	const [isSaving, setIsSaving] = useState(false);

	const { colors, fonts } = useTheme();
	const router = useRouter();

	useEffect(() => {
		(async () => {
			const saved = await AsyncStorage.getItem("dreams");
			const dreams = saved ? JSON.parse(saved) : [];
			const match = dreams.find((d) => d.id === id);
			if (match) {
				setDream(match);
				setText(match.text);
				setLucidity(match.lucidity);
				setClarity(match.clarity);
			}
		})();
	}, [id]);

	const save = async () => {
		setIsSaving(true);
		const saved = await AsyncStorage.getItem("dreams");
		const dreams = saved ? JSON.parse(saved) : [];
		const updatedDreams = dreams.map((d) =>
			d.id === id ? { ...d, text, lucidity, clarity } : d
		);
		await AsyncStorage.setItem("dreams", JSON.stringify(updatedDreams));
		setIsSaving(false);
		router.push("/"); // Auto-navigate after save
	};

	if (!dream) {
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.background,
					justifyContent: "center",
					alignItems: "center",
				}}>
				<Text
					style={{
						color: colors.text,
						fontFamily: fonts.bodyFont,
						fontSize: 18,
					}}>
					Loading...
				</Text>
			</View>
		);
	}

	return (
		<ScrollView
			style={{
				flex: 1,
				backgroundColor: colors.background,
			}}
			contentContainerStyle={{ padding: 20 }}>
			<Text
				style={{
					fontSize: 24,
					color: colors.text,
					fontFamily: fonts.headerFont,
					marginBottom: 10,
				}}>
				Edit Dream
			</Text>

			<TextInput
				value={text}
				onChangeText={setText}
				multiline
				style={{
					borderWidth: 1,
					borderColor: colors.border ?? "#ccc",
					borderRadius: 12,
					padding: 14,
					backgroundColor: colors.cardBackground,
					color: colors.text,
					fontFamily: fonts.bodyFont,
					minHeight: 150,
					textAlignVertical: "top",
				}}
				placeholder="Edit your dream..."
				placeholderTextColor={colors.placeholder ?? "#999"}
			/>

			{/* Optional: sliders or pickers for lucidity/clarity */}

			<TouchableOpacity
				onPress={save}
				disabled={isSaving}
				style={{
					backgroundColor: colors.buttonBackground,
					paddingVertical: 14,
					borderRadius: 10,
					alignItems: "center",
					marginTop: 20,
					opacity: isSaving ? 0.6 : 1,
				}}>
				<Text
					style={{
						color: colors.buttonText,
						fontFamily: fonts.bodyFont,
						fontSize: 16,
					}}>
					{isSaving ? "Saving..." : "Save"}
				</Text>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={() => router.push("/")}
				style={{
					backgroundColor: colors.buttonBackground,
					marginTop: 14,
					paddingVertical: 14,
					borderRadius: 10,
					alignItems: "center",
				}}>
				<Text
					style={{
						color: colors.primary,
						fontFamily: fonts.bodyFont,
						fontSize: 16,
					}}>
					Back to Home
				</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}
