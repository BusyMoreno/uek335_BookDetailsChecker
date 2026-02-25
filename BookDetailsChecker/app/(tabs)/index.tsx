import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to the Book Details Checker App
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // optional, damit man weiß sieht
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});