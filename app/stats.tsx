import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Stats() {
	const { colors, fonts } = useTheme();
	const [lucidityData, setLucidityData] = useState<number[]>([]);
	const [clarityData, setClarityData] = useState<number[]>([]);
	const [avgLucidity, setAvgLucidity] = useState<number>(0);
	const [avgClarity, setAvgClarity] = useState<number>(0);

	useEffect(() => {
		const loadStats = async () => {
			const stored = await AsyncStorage.getItem("dreams");
			const entries = stored ? JSON.parse(stored) : [];

			const lucidities: number[] = [];
			const clarities: number[] = [];

			for (const e of entries) {
				if (typeof e.lucidity === "number") lucidities.push(e.lucidity);
				if (typeof e.clarity === "number") clarities.push(e.clarity);
			}

			setLucidityData(lucidities);
			setClarityData(clarities);

			if (lucidities.length)
				setAvgLucidity(
					lucidities.reduce((a, b) => a + b, 0) / lucidities.length
				);
			if (clarities.length)
				setAvgClarity(
					clarities.reduce((a, b) => a + b, 0) / clarities.length
				);
		};

		loadStats();
	}, []);

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.background,
				padding: 20,
				alignItems: "center",
			}}>
			<Text
				style={{
					fontSize: 28,
					fontWeight: "bold",
					color: colors.text,
					marginBottom: 20,
					fontFamily: fonts.headerFont,
				}}>
				📈 Lucidity Stats
			</Text>

			{lucidityData.length >= 2 ? (
				<LineChart
					data={{
						labels: lucidityData.map((_, i) => `${i + 1}`),
						datasets: [
							{
								data: lucidityData,
								color: () => colors.accent || "#58a",
							},
							{
								data: clarityData,
								color: () => colors.text || "#aaa",
							},
						],
						legend: ["Lucidity", "Clarity"],
					}}
					width={width - 40}
					height={220}
					bezier
					style={{
						borderRadius: 16,
						marginBottom: 24,
					}}
					chartConfig={{
						backgroundColor: colors.background,
						backgroundGradientFrom: colors.cardBackground,
						backgroundGradientTo: colors.cardBackground,
						decimalPlaces: 1,
						color: (opacity = 1) =>
							`rgba(255, 255, 255, ${opacity})`,
						labelColor: () => colors.text,
						propsForDots: {
							r: "4",
							strokeWidth: "2",
							stroke: colors.accent || "#fff",
						},
					}}
				/>
			) : (
				<Text style={{ color: colors.text, marginBottom: 20 }}>
					Not enough data to show chart.
				</Text>
			)}

			<View style={{ alignItems: "center", gap: 4 }}>
				<Text
					style={{
						color: colors.text,
						fontSize: 16,
						fontFamily: fonts.bodyFont,
					}}>
					Average Lucidity: {avgLucidity.toFixed(1)}
				</Text>
				<Text
					style={{
						color: colors.text,
						fontSize: 16,
						fontFamily: fonts.bodyFont,
					}}>
					Average Clarity: {avgClarity.toFixed(1)}
				</Text>
			</View>
		</View>
	);
}
