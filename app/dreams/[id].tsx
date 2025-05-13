import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/ThemeContext";
import { MotiView } from "moti";

export default function DreamDetail() {
	const { id } = useLocalSearchParams();
	const [dream, setDream] = useState(null);
	const { colors, fonts } = useTheme();

	useEffect(() => {
		(async () => {
			const saved = await AsyncStorage.getItem("dreams");
			const all = saved ? JSON.parse(saved) : [];
			const match = all.find((d) => d.id === id);
			setDream(match);
		})();
	}, []);

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
			style={{ flex: 1, backgroundColor: colors.background }}
			contentContainerStyle={{ padding: 20 }}>
			<MotiView
				from={{ opacity: 0, translateY: 30 }}
				animate={{ opacity: 1, translateY: 0 }}
				transition={{ type: "timing", duration: 400 }}
				style={{
					backgroundColor: colors.cardBackground,
					padding: 20,
					borderRadius: 16,
					shadowColor: "#000",
					shadowOpacity: 0.1,
					shadowRadius: 8,
					elevation: 4,
				}}>
				<Text
					style={{
						fontSize: 24,
						fontWeight: "bold",
						marginBottom: 10,
						color: colors.text,
						fontFamily: fonts.headerFont,
					}}>
					{dream.date}
				</Text>

				<Text
					style={{
						fontSize: 16,
						lineHeight: 24,
						color: colors.text,
						marginBottom: 16,
						fontFamily: fonts.bodyFont,
					}}>
					{dream.text}
				</Text>

				<View style={{ marginBottom: 16 }}>
					<Text
						style={{
							fontSize: 16,
							color: colors.text,
							fontFamily: fonts.bodyFont,
							marginBottom: 4,
						}}>
						Lucidity: {dream.lucidity}
					</Text>
					<Text
						style={{
							fontSize: 16,
							color: colors.text,
							fontFamily: fonts.bodyFont,
						}}>
						Clarity: {dream.clarity}
					</Text>
				</View>

				{dream.tags?.length > 0 && (
					<View
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							gap: 10,
							marginTop: 10,
						}}>
						{dream.tags.map((tag, index) => (
							<View
								key={index}
								style={{
									backgroundColor:
										typeof tag === "object"
											? tag.color ?? colors.primary
											: colors.primary,
									borderRadius: 50,
									paddingVertical: 6,
									paddingHorizontal: 14,
								}}>
								<Text
									style={{
										color: "#fff",
										fontSize: 14,
										fontStyle: "italic",
										fontFamily: fonts.bodyFont,
									}}>
									{typeof tag === "string"
										? tag
										: tag.name}
								</Text>
							</View>
						))}
					</View>
				)}
			</MotiView>
		</ScrollView>
	);
}
