import notifee, { AndroidImportance, RepeatFrequency, TimestampTrigger, TriggerType } from '@notifee/react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
	Alert,
	Button,
	Platform,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";

export default function Settings() {
  const { mode, toggle, colors, fonts } = useTheme();
  
  // State management
  const [journalEnabled, setJournalEnabled] = useState(false);
  const [dreamCheckEnabled, setDreamCheckEnabled] = useState(false);
  const [journalTime, setJournalTime] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState<{
    type: 'journal' | 'start' | 'end' | null;
    visible: boolean;
  }>({
    type: null,
    visible: false,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    requestPermissions();
    createNotificationChannels();
  }, []);

  // Create notification channels for Android
  const createNotificationChannels = async () => {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'dream-journal',
        name: 'Dream Journal Reminders',
        importance: AndroidImportance.HIGH,
      });

      await notifee.createChannel({
        id: 'reality-checks',
        name: 'Reality Check Reminders',
        importance: AndroidImportance.HIGH,
      });
    }
  };

  // Request notification permissions
  const requestPermissions = async () => {
    await notifee.requestPermission();
  };

  // Load saved settings
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setJournalEnabled(settings.journalEnabled || false);
        setDreamCheckEnabled(settings.dreamCheckEnabled || false);
        
        if (settings.journalTime) {
          setJournalTime(new Date(settings.journalTime));
        }
        
        if (settings.startTime) {
          setStartTime(new Date(settings.startTime));
        }
        
        if (settings.endTime) {
          setEndTime(new Date(settings.endTime));
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      Alert.alert("Error", "Failed to load settings");
    }
  };

  // Save settings
  const saveSettings = async () => {
    try {
      const settings = {
        journalEnabled,
        dreamCheckEnabled,
        journalTime: journalTime.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
      await AsyncStorage.setItem("notificationSettings", JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
      Alert.alert("Error", "Failed to save settings");
    }
  };

  // Cancel journal notifications
  const cancelJournalNotifications = async () => {
    const notifications = await notifee.getTriggerNotifications();
    notifications.forEach(notification => {
      const title = notification.notification.title;
      if (title && title.includes("🌙 Dream Journal") && notification.notification.id) {
        notifee.cancelTriggerNotification(notification.notification.id);
      }
    });
  };

  // Cancel hourly check notifications
  const cancelHourlyCheckNotifications = async () => {
    const notifications = await notifee.getTriggerNotifications();
    notifications.forEach(notification => {
      const title = notification.notification.title;
      if (title && title.includes("🌀 Dream Reality Check") && notification.notification.id) {
        notifee.cancelTriggerNotification(notification.notification.id);
      }
    });
  };

  // Schedule journal notification
  const scheduleJournalNotification = async (time: Date) => {
    try {
      await cancelJournalNotifications();
      
      // Create a new date for today at the specified time
      const now = new Date();
      const scheduledTime = new Date(time);
      scheduledTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Only schedule if the time is in the future
      if (scheduledTime.getTime() > now.getTime()) {
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: scheduledTime.getTime(),
          repeatFrequency: RepeatFrequency.DAILY,
        };

        await notifee.createTriggerNotification(
          {
            title: "🌙 Dream Journal Reminder",
            body: "Don't forget to write down your dreams!",
            android: {
              channelId: 'dream-journal',
              pressAction: {
                id: 'default',
              },
            },
          },
          trigger,
        );

        saveSettings();
        Alert.alert("Success", "Journal reminder scheduled!");
      } else {
        Alert.alert("Info", "The selected time has already passed for today. Please select a future time.");
      }
    } catch (error) {
      console.error("Error scheduling journal notification:", error);
      Alert.alert("Error", "Failed to schedule journal reminder");
    }
  };

  // Schedule hourly reality checks
  const scheduleHourlyChecks = async (start: Date, end: Date) => {
    try {
      await cancelHourlyCheckNotifications();
      
      const startHour = start.getHours();
      const endHour = end.getHours();
      
      if (startHour >= endHour) {
        Alert.alert("Error", "End time must be after start time");
        return;
      }

      const now = new Date();
      let scheduledCount = 0;

      for (let hour = startHour; hour <= endHour; hour++) {
        // Create a new date for this hour
        const scheduledTime = new Date(now);
        scheduledTime.setHours(hour, 0, 0, 0);

        // Only schedule if the time is in the future
        if (scheduledTime.getTime() > now.getTime()) {
          const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: scheduledTime.getTime(),
            repeatFrequency: RepeatFrequency.DAILY,
          };

          await notifee.createTriggerNotification(
            {
              title: "🌀 Dream Reality Check",
              body: "Are you dreaming right now?",
              android: {
                channelId: 'reality-checks',
                pressAction: {
                  id: 'default',
                },
              },
            },
            trigger,
          );
          scheduledCount++;
        }
      }

      saveSettings();
      if (scheduledCount > 0) {
        Alert.alert("Success", `Scheduled ${scheduledCount} reality checks!`);
      } else {
        Alert.alert("Info", "All selected times have already passed. Please select future times.");
      }
    } catch (error) {
      console.error("Error scheduling hourly checks:", error);
      Alert.alert("Error", "Failed to schedule reality checks");
    }
  };

  // Handle time picker change
  const handleTimeChange = (event: any, selectedDate: Date | undefined) => {
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
    
    setShowPicker({ type: null, visible: false });
  };

  // Apply dream check schedule
  const applyDreamCheckSchedule = () => {
    if (dreamCheckEnabled) {
      scheduleHourlyChecks(startTime, endTime);
    }
  };

  // Toggle handlers
  const handleJournalToggle = async (val: boolean) => {
    if (val) {
      Alert.alert(
        "Enable Journal Reminder",
        "This will send you a daily reminder to write down your dreams. Would you like to continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              setJournalEnabled(true);
              await scheduleJournalNotification(journalTime);
              await saveSettings();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Disable Journal Reminder",
        "Are you sure you want to disable the journal reminder?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            onPress: async () => {
              setJournalEnabled(false);
              await cancelJournalNotifications();
              await saveSettings();
            },
          },
        ]
      );
    }
  };

  const handleDreamCheckToggle = async (val: boolean) => {
    if (val) {
      Alert.alert(
        "Enable Reality Checks",
        "This will send you hourly reality check notifications. Would you like to continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Enable",
            onPress: async () => {
              setDreamCheckEnabled(true);
              await scheduleHourlyChecks(startTime, endTime);
              await saveSettings();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Disable Reality Checks",
        "Are you sure you want to disable the reality check notifications?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disable",
            onPress: async () => {
              setDreamCheckEnabled(false);
              await cancelHourlyCheckNotifications();
              await saveSettings();
            },
          },
        ]
      );
    }
  };

  // Custom Card component
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
      }}
    >
      {children}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: colors.text,
          fontFamily: fonts.headerFont,
          marginBottom: 30,
        }}
      >
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
          }}
        >
          Dream Journal Reminder
        </Text>
        <Switch
          value={journalEnabled}
          onValueChange={handleJournalToggle}
          thumbColor={colors.accent}
          trackColor={{ false: "#ccc", true: colors.accent }}
        />
        {journalEnabled && (
          <TouchableOpacity
            onPress={() => setShowPicker({ type: "journal", visible: true })}
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.buttonBackground,
            }}
          >
            <Text
              style={{
                color: colors.buttonText,
                textAlign: "center",
              }}
            >
              Change Time: {journalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          }}
        >
          Reality Checks (Hourly)
        </Text>
        <Switch
          value={dreamCheckEnabled}
          onValueChange={handleDreamCheckToggle}
          thumbColor={colors.accent}
          trackColor={{ false: "#ccc", true: colors.accent }}
        />
        {dreamCheckEnabled && (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              onPress={() => setShowPicker({ type: "start", visible: true })}
              style={{
                marginBottom: 10,
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.buttonBackground,
              }}
            >
              <Text
                style={{
                  color: colors.buttonText,
                  textAlign: "center",
                }}
              >
                Start Time: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowPicker({ type: "end", visible: true })}
              style={{
                marginBottom: 10,
                padding: 10,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.buttonBackground,
              }}
            >
              <Text
                style={{
                  color: colors.buttonText,
                  textAlign: "center",
                }}
              >
                End Time: {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          }}
        >
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
        }}
      >
        More settings coming soon: backup/sync, export dreams, custom themes...
      </Text>

      {/* Time Picker */}
      {showPicker.visible && (
        <DateTimePicker
          value={
            showPicker.type === 'journal'
              ? journalTime
              : showPicker.type === 'start'
                ? startTime
                : endTime
          }
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
}