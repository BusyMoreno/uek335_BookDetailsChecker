import React, { useState } from "react";
import { api } from "../../services/api";
import { Alert, View, StyleSheet, ScrollView } from "react-native";
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

export default function RegisterPage() {
  const router = useRouter();
  const { errors, validateAuthForm } = useFormValidation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const borderBottomWidth = 5;

  const handleRegister = async () => {
    const isValid = validateAuthForm(firstName, email, password, age);

    if (!isValid) return;

    setLoading(true);
    try {
      const response = await api.post("/register", {
        firstname: firstName,
        lastname: lastName,
        age: age ? parseInt(age) : null,
        email: email,
        password: password,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("Success", "Account created successfully!");
        router.push("/LoginPage");
      }
    } catch (error: any) {
      console.error("Register Fehler:", error);
      let message = "Registration failed.";
      if (error.response) {
        message = error.response.data.message || "Please check your inputs.";
      }
      Alert.alert("Error", message);
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
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: Colors.light.background },
        ]}
      >
        <View style={styles.headerContainer}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: Colors.light.textWhite }]}
          >
            Create Account
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: Colors.light.textWhite }]}
          >
            Join us today!
          </Text>
        </View>

        {/* 1. E-Mail */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { borderBottomWidth }]}>E-Mail</Text>
          <TextInput
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter E-Mail"
            placeholderTextColor={Colors.light.textField}
            textColor={Colors.light.textFieldText}
            error={!!errors.email}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>
        </View>

        {/* 2. Password */}
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { borderBottomWidth }]}>Password</Text>
          <TextInput
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Password"
            placeholderTextColor={Colors.light.textField}
            secureTextEntry
            textColor={Colors.light.textFieldText}
            error={!!errors.password}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { borderBottomWidth }]}>First Name</Text>
          <TextInput
            mode="outlined"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter First Name"
            placeholderTextColor={Colors.light.textField}
            textColor={Colors.light.textFieldText}
            error={!!errors.firstname}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
          <HelperText type="error" visible={!!errors.firstname}>
            {errors.firstname}
          </HelperText>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { borderBottomWidth }]}>
            Last Name (Optional)
          </Text>
          <TextInput
            mode="outlined"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter Last Name"
            placeholderTextColor={Colors.light.textField}
            textColor={Colors.light.textFieldText}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { borderBottomWidth }]}>
            Age (Optional)
          </Text>
          <TextInput
            mode="outlined"
            value={age}
            onChangeText={setAge}
            placeholder="Enter Age"
            placeholderTextColor={Colors.light.textField}
            keyboardType="numeric"
            error={!!errors.age}
            textColor={Colors.light.textFieldText}
            style={[styles.input, { backgroundColor: Colors.light.textLight }]}
          />
          <HelperText type="error" visible={!!errors.age}>
            {errors.age}
          </HelperText>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Register
          </Button>
        </View>

        <View style={styles.footerContainer}>
          <Text style={{ color: Colors.light.textWhite, fontSize: 17 }}>
            Already have an account?{" "}
            <Text
              style={{ color: Colors.light.textLight, fontWeight: "bold" }}
              onPress={() => router.push("/LoginPage")}
            >
              Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
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
    marginBottom: 10,
  },
  label: {
    borderBottomColor: "transparent",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  input: {
    width: "100%",
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
    marginBottom: 20,
  },
});