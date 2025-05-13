import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");
  const { colors, fonts } = useTheme();

  const loadEntries = useCallback(async () => {
    const stored = await AsyncStorage.getItem("dreams");
    setEntries(stored ? JSON.parse(stored) : []);
  }, []);

  useFocusEffect(loadEntries);

  const filtered = query
    ? entries.filter((e) => {
        const lower = query.toLowerCase();
        return (
          e.text.toLowerCase().includes(lower) ||
          e.tags?.some((tag) => tag.toLowerCase().includes(lower))
        );
      })
    : entries;

  const EntryCard = ({ item }) => (
		<View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
			<Link href={`/dreams/${item.id}`} asChild>
				<TouchableOpacity>
					<Text style={[styles.date, { color: colors.text }]}>
						{item.date}
					</Text>
					<Text
						style={[styles.text, { color: colors.text }]}
						numberOfLines={2}>
						{item.text}
					</Text>
					<Text style={{ color: colors.text, marginTop: 4 }}>
						Lucidity: {item.lucidity} | Clarity: {item.clarity}
					</Text>
					{item.tags?.length > 0 && (
						<View style={styles.tagsContainer}>
							{item.tags.map((tag, index) => (
								<View
									key={index}
									style={[
										styles.tag,
										{ backgroundColor: tag.color },
									]}>
									<Text
										style={[
											styles.tagText,
											{ color: colors.text },
										]}>
										{tag.name}
									</Text>
								</View>
							))}
						</View>
					)}
				</TouchableOpacity>
			</Link>
			<Link
				key={item.title}
				style={[
					styles.editButton,
					{ backgroundColor: colors.buttonBackground },
				]}
				href={`/dreams/${item.id}/edit`}
				asChild>
				<TouchableOpacity
					style={[
						styles.editButton,
						{ backgroundColor: colors.buttonBackground },
					]}>
					<Text
						style={[styles.editText, { color: colors.buttonText }]}>
						Edit
					</Text>
				</TouchableOpacity>
			</Link>
		</View>
  );

  return (
		<View
			style={[styles.container, { backgroundColor: colors.background }]}>
			<Text style={[styles.header, { color: colors.text }]}>
				🌙 Dream Journal
			</Text>
			<TextInput
				placeholder="Search dreams or tags..."
				placeholderTextColor={colors.border}
				value={query}
				onChangeText={setQuery}
				style={[
					styles.searchInput,
					{
						borderColor: colors.border,
						backgroundColor: colors.cardBackground,
					},
				]}
			/>

			<View style={styles.linkContainer}>
				{[
					{ title: "Add Dream", href: "/new" },
					{ title: "Settings", href: "/settings" },
					{ title: "Stats", href: "/stats" },
				].map((link) => (
					<Link
						key={link.title}
						href={link.href}
						style={[
							styles.linkButton,
							{ backgroundColor: colors.buttonBackground },
						]}
						asChild>
						<TouchableOpacity
							style={[
								styles.linkButton,
								{ backgroundColor: colors.buttonBackground },
							]}>
							<Text
								style={[
									styles.linkButtonText,
									{ color: colors.buttonText },
								]}>
								{link.title}
							</Text>
						</TouchableOpacity>
					</Link>
				))}
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => <EntryCard item={item} />}
				ListEmptyComponent={
					<Text style={{ color: colors.border, textAlign: "center" }}>
						No dreams found.
					</Text>
				}
			/>
		</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "Roboto", // Use your custom font here
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontFamily: "Roboto", // Use your custom font here
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  linkButtonText: {
    fontWeight: "600",
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  date: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    fontFamily: "Roboto", // Use your custom font here
  },
  text: {
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  tag: {
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontFamily: "Roboto", // Use your custom font here
    fontSize: 14,
  },
  editButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 4,
  },
  editText: {
    fontWeight: "bold",
  },
});
