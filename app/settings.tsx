import {
	View,
	Text,
	Switch,
	Button,
	Platform,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { useState, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";

export default function Settings() {
	const { mode, toggle, colors, fonts } = useTheme();

	const [journalEnabled, setJournalEnabled] = useState(false);
	const [dreamCheckEnabled, setDreamCheckEnabled] = useState(false);
	const [journalTime, setJournalTime] = useState(new Date());
	const [startTime, setStartTime] = useState(new Date());
	const [endTime, setEndTime] = useState(new Date());

	const [showPicker, setShowPicker] = useState({
		type: null, // 'journal', 'start', or 'end'
		visible: false,
	});

	useEffect(() => {
		Notifications.requestPermissionsAsync();
	}, []);

	const scheduleJournalNotification = async (time) => {
		await Notifications.cancelAllScheduledNotificationsAsync();
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "🌙 Dream Journal Reminder",
				body: "Don't forget to write down your dream!",
			},
			trigger: {
				hour: time.getHours(),
				minute: time.getMinutes(),
				repeats: true,
			},
		});
	};

	const scheduleHourlyChecks = async (start, end) => {
		await Notifications.cancelAllScheduledNotificationsAsync();
		const startHour = start.getHours();
		const endHour = end.getHours();

		for (let hour = startHour; hour <= endHour; hour++) {
			await Notifications.scheduleNotificationAsync({
				content: {
					title: "🌀 Dream Reality Check",
					body: "Are you dreaming right now?",
				},
				trigger: {
					hour,
					minute: 0,
					repeats: true,
				},
			});
		}
	};

	const handleTimeChange = (event, selectedDate) => {
		setShowPicker({ type: null, visible: false });
		if (!selectedDate) return;

		switch (showPicker.type) {
			case "journal":
				setJournalTime(selectedDate);
				scheduleJournalNotification(selectedDate);
				break;
			case "start":
				setStartTime(selectedDate);
				break;
			case "end":
				setEndTime(selectedDate);
				break;
		}
	};

	const applyDreamCheckSchedule = () => {
		if (dreamCheckEnabled) {
			scheduleHourlyChecks(startTime, endTime);
		}
	};

	const Card = ({ children }) => (
		<View
			style={{
				backgroundColor: colors.cardBackground,
				padding: 16,
				borderRadius: 16,
				marginBottom: 20,
				shadowColor: colors.shadow,
				shadowOpacity: 0.2,
				shadowRadius: 6,
				elevation: 3,
			}}>
			{children}
		</View>
	);

	return (
		<ScrollView
			contentContainerStyle={{
				flexGrow: 1,
				backgroundColor: colors.background,
				padding: 20,
			}}>
			<Text
				style={{
					fontSize: 28,
					fontWeight: "bold",
					color: colors.text,
					fontFamily: fonts.headerFont,
					marginBottom: 30,
				}}>
				⚙ Settings
			</Text>

			{/* Dream Journal Reminder */}
			<Card>
				<Text
					style={{
						fontSize: 16,
						color: colors.text,
						fontFamily: fonts.bodyFont,
						marginBottom: 10,
					}}>
					Dream Journal Reminder
				</Text>
				<Switch
					value={journalEnabled}
					onValueChange={(val) => {
						setJournalEnabled(val);
						if (val) scheduleJournalNotification(journalTime);
						else
							Notifications.cancelAllScheduledNotificationsAsync();
					}}
					thumbColor={colors.accent}
					trackColor={{ false: "#ccc", true: colors.accent }}
				/>
				{journalEnabled && (
					<TouchableOpacity
						onPress={() =>
							setShowPicker({ type: "journal", visible: true })
						}
						style={{
							marginTop: 12,
							padding: 10,
							borderRadius: 10,
							borderWidth: 1,
							borderColor: colors.border,
							backgroundColor: colors.buttonBackground,
						}}>
						<Text
							style={{
								color: colors.buttonText,
								textAlign: "center",
							}}>
							Change Time: {journalTime.toLocaleTimeString()}
						</Text>
					</TouchableOpacity>
				)}
			</Card>

			{/* Dream Reality Checks */}
			<Card>
				<Text
					style={{
						fontSize: 16,
						color: colors.text,
						fontFamily: fonts.bodyFont,
						marginBottom: 10,
					}}>
					Reality Checks (Hourly)
				</Text>
				<Switch
					value={dreamCheckEnabled}
					onValueChange={(val) => {
						setDreamCheckEnabled(val);
						if (val) scheduleHourlyChecks(startTime, endTime);
						else
							Notifications.cancelAllScheduledNotificationsAsync();
					}}
					thumbColor={colors.accent}
					trackColor={{ false: "#ccc", true: colors.accent }}
				/>
				{dreamCheckEnabled && (
					<View style={{ marginTop: 10 }}>
						<TouchableOpacity
							onPress={() =>
								setShowPicker({ type: "start", visible: true })
							}
							style={{
								marginBottom: 10,
								padding: 10,
								borderRadius: 10,
								borderWidth: 1,
								borderColor: colors.border,
								backgroundColor: colors.buttonBackground,
							}}>
							<Text
								style={{
									color: colors.buttonText,
									textAlign: "center",
								}}>
								Start Time: {startTime.toLocaleTimeString()}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() =>
								setShowPicker({ type: "end", visible: true })
							}
							style={{
								marginBottom: 10,
								padding: 10,
								borderRadius: 10,
								borderWidth: 1,
								borderColor: colors.border,
								backgroundColor: colors.buttonBackground,
							}}>
							<Text
								style={{
									color: colors.buttonText,
									textAlign: "center",
								}}>
								End Time: {endTime.toLocaleTimeString()}
							</Text>
						</TouchableOpacity>
						<Button
							title="Apply Schedule"
							onPress={applyDreamCheckSchedule}
							color={colors.accent}
						/>
					</View>
				)}
			</Card>

			{/* Dark Mode Toggle */}
			<Card>
				<Text
					style={{
						fontSize: 16,
						color: colors.text,
						fontFamily: fonts.bodyFont,
						marginBottom: 10,
					}}>
					Dark Mode
				</Text>
				<Switch
					value={mode === "dark"}
					onValueChange={toggle}
					thumbColor={colors.accent}
					trackColor={{ false: "#ccc", true: colors.accent }}
				/>
			</Card>

			{/* Footer */}
			<Text
				style={{
					color: colors.text,
					fontSize: 12,
					textAlign: "center",
					marginTop: 10,
					marginBottom: 30,
				}}>
				More settings coming soon: backup/sync, export dreams, custom
				themes...
			</Text>

			{/* Time Picker */}
			{showPicker.visible && (
				<DateTimePicker
					value={new Date()}
					mode="time"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					onChange={handleTimeChange}
				/>
			)}
		</ScrollView>
	);
}
