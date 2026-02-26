import React, { useState } from "react";
import { api } from "../../services/api";
import { Alert } from "react-native";
import { View, StyleSheet } from "react-native";
import { useFormValidation } from "../../hooks/useFormValidation";
import {
  Button,
  Text,
  Provider as PaperProvider,
  MD3DarkTheme,
  TextInput,
  HelperText,
} from "react-native-paper";
import { useRouter } from "expo-router";

import { Colors } from "../../constants/theme";

export default function LoginPage() {
  const router = useRouter();
  const { errors, validateAuthForm } = useFormValidation();

  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [loading, setLoading] = useState(false);
  const borderBottomWidth = 5;

  const handleSignIn = async () => {
    const isValid = validateAuthForm(undefined, email, password);

    if (!isValid) return;

    setLoading(true);
    try {
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      if (response.status === 200 || response.status === 201) {
        console.log("Login erfolgreich:", response.data);
        router.push("/BookListPage");
      }
    } catch (error: any) {
      console.error("Login Fehler:", error);
      
      let message = "Ein unerwarteter Fehler ist aufgetreten.";
      if (error.response) {
        message = error.response.data.message || "E-Mail oder Passwort falsch.";
      } else if (error.request) {
        message = "Server nicht erreichbar. Prüfe deine Verbindung (10.0.2.2).";
      }

      Alert.alert("Login fehlgeschlagen", message);
    } finally {
      setLoading(false);
    }
  };

  const customTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.light.textLight,
      background: Colors.light.background,
      surface: Colors.light.button,
      onSurface: Colors.light.textLight,
      placeholder: Colors.light.textDark,
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
            Login
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: Colors.light.textWhite }]}
          >
            Please enter your credentials
          </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text
            style={[styles.label, { borderBottomWidth: borderBottomWidth }]}
          >
            E-Mail
          </Text>
          <TextInput
            mode="outlined"
            value={email}
            onChangeText={onChangeEmail}
            placeholder="Enter E-Mail"
            placeholderTextColor={Colors.light.textField}
            textColor={Colors.light.textField}
            outlineColor={errors.email ? "red" : Colors.light.borderLine}
            activeOutlineColor={errors.email ? "red" : Colors.light.textLight}
            error={!!errors.email}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
          <HelperText
            type="error"
            visible={!!errors.email}
            style={styles.errorText}
          >
            {errors.email}
          </HelperText>
        </View>

        <View style={styles.inputWrapper}>
          <Text
            style={[styles.label, { borderBottomWidth: borderBottomWidth }]}
          >
            Password
          </Text>
          <TextInput
            mode="outlined"
            value={password}
            onChangeText={onChangePassword}
            placeholder="Enter Password"
            placeholderTextColor={Colors.light.textField}
            secureTextEntry
            textColor={Colors.light.textField}
            outlineColor={errors.password ? "red" : Colors.light.borderLine}
            activeOutlineColor={
              errors.password ? "red" : Colors.light.textLight
            }
            error={!!errors.password}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
          <HelperText
            type="error"
            visible={!!errors.password}
            style={styles.errorText}
          >
            {errors.password}
          </HelperText>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            disabled={loading}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>
        </View>

        <View style={styles.footerContainer}>
          <Text style={{ color: Colors.light.textWhite, fontSize: 17 }}>
            Don't have an account?{" "}
            <Text
              style={{ color: Colors.light.textLight, fontWeight: "bold" }}
              onPress={() => router.push("/(tabs)/RegisterPage")}
            >
              Register
            </Text>
          </Text>
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
    marginBottom: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.8,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 15,
  },
  label: {
    borderBottomColor: "transparent",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  input: {
    width: "100%",
  },
  errorText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: -2,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 20,
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
  footerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
