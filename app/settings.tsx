import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
	Button,
	Platform,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";

// Configure notifications
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

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

	// Load saved settings
	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const savedSettings = await AsyncStorage.getItem(
				"notificationSettings"
			);
			if (savedSettings) {
				const settings = JSON.parse(savedSettings);
				setJournalEnabled(settings.journalEnabled);
				setDreamCheckEnabled(settings.dreamCheckEnabled);
				setJournalTime(new Date(settings.journalTime));
				setStartTime(new Date(settings.startTime));
				setEndTime(new Date(settings.endTime));

				if (settings.journalEnabled) {
					scheduleJournalNotification(new Date(settings.journalTime));
				}
				if (settings.dreamCheckEnabled) {
					scheduleHourlyChecks(
						new Date(settings.startTime),
						new Date(settings.endTime)
					);
				}
			}
		} catch (error) {
			console.error("Error loading settings:", error);
		}
	};

	const saveSettings = async () => {
		try {
			const settings = {
				journalEnabled,
				dreamCheckEnabled,
				journalTime: journalTime.toISOString(),
				startTime: startTime.toISOString(),
				endTime: endTime.toISOString(),
			};
			await AsyncStorage.setItem(
				"notificationSettings",
				JSON.stringify(settings)
			);
		} catch (error) {
			console.error("Error saving settings:", error);
		}
	};

	useEffect(() => {
		(async () => {
			const { status } = await Notifications.requestPermissionsAsync();
			if (status !== "granted") {
				alert(
					"You need to grant notification permissions to use this feature."
				);
				setJournalEnabled(false);
				setDreamCheckEnabled(false);
			}
		})();
	}, []);

	const scheduleJournalNotification = async (time) => {
		try {
			await Notifications.cancelAllScheduledNotificationsAsync();
			const trigger = new Date(time);

			await Notifications.scheduleNotificationAsync({
				content: {
					title: "🌙 Dream Journal Reminder",
					body: "Don't forget to write down your dream!",
				},
				trigger: {
					hour: trigger.getHours(),
					minute: trigger.getMinutes(),
					repeats: true,
				},
			});
			saveSettings();
		} catch (error) {
			console.error("Error scheduling journal notification:", error);
			alert("Failed to schedule notification. Please try again.");
		}
	};

	const scheduleHourlyChecks = async (start, end) => {
		try {
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
			saveSettings();
		} catch (error) {
			console.error("Error scheduling hourly checks:", error);
			alert("Failed to schedule notifications. Please try again.");
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
