import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { api } from "../../services/api";
import { Colors } from "../../constants/theme";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const checkAuthAndFetchProfile = async () => {
        setLoading(true);
        setUser(null);

        const token = await SecureStore.getItemAsync("userToken");
        const storedId = await SecureStore.getItemAsync("userId");

        if (!token || !storedId) {
          router.replace("/LoginPage");
          return;
        }

        try {
          const response = await api.get(`/users/${storedId}`);
          setUser(response.data);
        } catch (error: any) {
          if (error.response?.status === 401) {
            await handleSignOut();
          } else {
            Alert.alert("Error", "Could not load profile data.");
          }
        } finally {
          setLoading(false);
        }
      };

      checkAuthAndFetchProfile();

      return () => {
        setUser(null);
      };
    }, []),
  );

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userId");

    router.replace("/LoginPage");
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.textLight} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Book Details Checker</Text>

      {/* Email */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          mode="flat"
          value={user?.email || ""}
          editable={false}
          textColor="#000000"
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          mode="flat"
          value={user?.firstname || ""}
          editable={false}
          textColor="#000000"
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          mode="flat"
          value={user?.lastname || ""}
          editable={false}
          textColor="#000000"
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          mode="flat"
          value={user?.age?.toString() || ""}
          editable={false}
          textColor="#000000"
          style={styles.input}
          underlineColor="transparent"
          activeUnderlineColor="transparent"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSignOut}
        style={styles.signOutButton}
        labelStyle={styles.signOutLabel}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 25,
    paddingTop: 60,
    alignItems: "center",
  },
  centered: {
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.textWhite,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.textWhite,
    marginBottom: 40,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    color: Colors.light.textWhite,
    fontSize: 16,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  input: {
    backgroundColor: Colors.light.textLight,
    borderRadius: 10,
    height: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  signOutButton: {
    marginTop: 40,
    width: "100%",
    height: 55,
    justifyContent: "center",
    backgroundColor: Colors.light.button,
    borderWidth: 3,
    borderColor: Colors.light.buttonBorder,
    borderRadius: 10,
  },
  signOutLabel: {
    color: Colors.light.textWhite,
    fontSize: 16,
  },
});
