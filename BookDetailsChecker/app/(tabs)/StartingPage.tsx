import React from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Text,
  Provider as PaperProvider,
  MD3DarkTheme,
} from "react-native-paper";

import { Colors } from "../../constants/theme";
import { useRouter } from "expo-router";

/**
 * The startingpage component serves as the initial screen of the app, providing users with options to either log in or register. 
 * It features a welcoming message and two buttons that navigate to the respective authentication pages. 
 * The design is simple and user-friendly, utilizing a custom dark theme for visual appeal. 
 * This page is crucial for guiding users into the app's authentication flow and ensuring a smooth onboarding experience.
 */

export default function HomeScreen() {
  const router = useRouter();

  const customTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.light.textLight,
      background: Colors.light.background,
      surface: Colors.light.button,
      onSurface: Colors.light.textLight,
    },
  };

  return (
    <PaperProvider theme={customTheme}>
      <View
        style={[styles.container, { backgroundColor: Colors.light.background }]}
      >
        <View style={styles.headerContainer}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: Colors.light.textWhite }]}
          >
            Book Details Checker
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.subtitle,
              { color: Colors.light.textWhite, fontSize: 18 },
            ]}
          >
            Welcome!
          </Text>
          <Text
            variant="bodyMedium"
            style={[
              styles.subtitle,
              { color: Colors.light.textWhite, fontSize: 18 },
            ]}
          >
            Please choose an option
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push("/(tabs)/LoginPage")}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>

          <Button
            mode="contained"
            onPress={() => router.push("/(tabs)/RegisterPage")}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Register
          </Button>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  button: {
    width: "100%",
    borderRadius: 12,
    elevation: 4,
    borderWidth: 3,
    borderColor: Colors.light.buttonBorder,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
