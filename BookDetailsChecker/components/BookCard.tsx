import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { Colors } from "@/constants/theme";

interface BookCardProps {
  title: string;
  author: string;
  onPress?: () => void;
}

const BookCard = ({ title, author, onPress }: BookCardProps) => {
  const avatarLetter = (author?.[0] || title?.[0] || "B").toUpperCase();

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.light.textLight,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Avatar.Text
        size={44}
        label={avatarLetter}
        style={{ backgroundColor: Colors.light.button, marginRight: 14 }}
        color={Colors.light.textWhite}
      />
      <View style={{ flex: 1 }}>
        <Text
          variant="titleMedium"
          style={{ color: "#1a1a1a", fontWeight: "bold" }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: "#555" }}
          numberOfLines={1}
        >
          {author || "Unknown Author"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default BookCard;