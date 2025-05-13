import { useState } from "react";
import {
	View,
	TextInput,
	Text,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import RNSlider from "@react-native-community/slider";
import { useTheme } from "../../theme/ThemeContext";

const tagColors = [
	"#FFB6C1",
	"#FFD700",
	"#98FB98",
	"#87CEEB",
	"#FF6347",
	"#DDA0DD",
	"#A52A2A",
];

export default function NewDream() {
	const [text, setText] = useState("");
	const [lucidity, setLucidity] = useState(3);
	const [clarity, setClarity] = useState(3);
	const [tagInput, setTagInput] = useState("");
	const [tags, setTags] = useState([]);
	const { colors, fonts } = useTheme();

	const save = async () => {
		const entry = {
			id: Date.now().toString(),
			date: new Date().toLocaleString(),
			text,
			lucidity,
			clarity,
			tags,
		};

		const saved = await AsyncStorage.getItem("dreams");
		const dreams = saved ? JSON.parse(saved) : [];
		dreams.unshift(entry);
		await AsyncStorage.setItem("dreams", JSON.stringify(dreams));
		router.back();
	};

	const addTag = () => {
		if (tagInput && !tags.includes(tagInput)) {
			setTags([
				...tags,
				{
					name: tagInput,
					color: tagColors[tags.length % tagColors.length],
				},
			]);
			setTagInput("");
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.background }}>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					padding: 20,
				}}>
				<View style={{ flex: 1 }}>
					<TextInput
                        placeholder="Describe your dream..."
                        placeholderTextColor={colors.text}
						multiline
						value={text}
						onChangeText={setText}
						style={{
							textAlignVertical: "top",
							textAlign: "center",
							borderWidth: 1,
							padding: 10,
							height: 200,
							borderRadius: 5,
							backgroundColor: colors.cardBackground,
							color: colors.text,
							fontFamily: fonts.bodyFont,
						}}
					/>

					<Text
						style={{
							color: colors.text,
							fontFamily: fonts.bodyFont,
							marginTop: 10,
						}}>
						Lucidity: {lucidity.toFixed(1)}
					</Text>
					<RNSlider
						minimumValue={0}
						maximumValue={10}
						step={0.1}
						value={lucidity}
						onValueChange={setLucidity}
						style={{ marginBottom: 10 }}
						thumbTintColor={colors.buttonBackground}
						minimumTrackTintColor={colors.buttonBackground}
						maximumTrackTintColor={colors.cardBackground}
					/>

					<Text
						style={{
							color: colors.text,
							fontFamily: fonts.bodyFont,
							marginTop: 10,
						}}>
						Clarity: {clarity.toFixed(1)}
					</Text>
					<RNSlider
						minimumValue={0}
						maximumValue={10}
						step={0.1}
						value={clarity}
						onValueChange={setClarity}
						style={{ marginBottom: 10 }}
						thumbTintColor={colors.buttonBackground}
						minimumTrackTintColor={colors.buttonBackground}
						maximumTrackTintColor={colors.cardBackground}
					/>

					<Text
						style={{
							color: colors.text,
							fontFamily: fonts.bodyFont,
							marginTop: 10,
						}}>
						Tags:
					</Text>
					<View
						style={{
							flexDirection: "row",
							flexWrap: "wrap",
							gap: 8,
							marginTop: 10,
						}}>
						{tags.map((tag, index) => (
							<View
								key={index}
								style={{
									backgroundColor: tag.color,
									borderRadius: 5,
									paddingVertical: 5,
									paddingHorizontal: 10,
									flexDirection: "row",
									alignItems: "center",
								}}>
								<TouchableOpacity
									onPress={() => {
										setTags(
											tags.filter((_, i) => i !== index)
										);
									}}>
									<Text
										style={{
											color: colors.text,
											fontFamily: fonts.bodyFont,
										}}>
										{tag.name}
									</Text>
								</TouchableOpacity>
							</View>
						))}
					</View>

					<View
						style={{
							flexDirection: "row",
							gap: 8,
							marginTop: 10,
						}}>
						<TextInput
							placeholder="Add tag"
							value={tagInput}
							onChangeText={setTagInput}
                            onSubmitEditing={addTag}
                            placeholderTextColor={colors.text}
                            style={{
                                
								borderWidth: 1,
								borderRadius: 5,
								padding: 5,
								flex: 1,
								backgroundColor: colors.cardBackground,
								color: colors.text,
								fontFamily: fonts.bodyFont,
							}}
						/>
						<TouchableOpacity
							onPress={addTag}
							style={{
								backgroundColor: colors.buttonBackground,
								borderRadius: 5,
								paddingVertical: 10,
								paddingHorizontal: 15,
								justifyContent: "center",
								alignItems: "center",
							}}>
							<Text
								style={{
									color: colors.buttonText,
									fontFamily: fonts.bodyFont,
								}}>
								Add
							</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						onPress={save}
						style={{
							backgroundColor: colors.buttonBackground,
							paddingVertical: 15,
							borderRadius: 8,
							alignItems: "center",
							marginTop: 20,
						}}>
						<Text
							style={{
								color: colors.buttonText,
								fontFamily: fonts.bodyFont,
							}}>
							Save Dream
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
}
