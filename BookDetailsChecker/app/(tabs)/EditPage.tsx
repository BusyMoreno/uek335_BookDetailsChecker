import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Colors } from "../../constants/theme";
import FormActions from "../../components/FormActions";
import { Calendar } from "react-native-calendars";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";
import { api } from "../../services/api";

const EditBook = ({ navigation }: any) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [language, setLanguage] = useState("");
  const [pages, setPages] = useState("");
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
            Alert.alert("Error", "Could not load create page.");
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Edit Book</Text>
        <Text style={styles.subHeader}>Book-Details</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Publisher</Text>
            <TextInput
              style={styles.input}
              value={publisher}
              onChangeText={setPublisher}
            />
          </View>

          <Text style={styles.label}>Publication Date</Text>
          <View style={styles.calendarWrapper}>
            <Calendar
              onDayPress={(day: any) => {
                setReleaseDate(new Date(day.dateString));
              }}
              markedDates={{
                [releaseDate?.toISOString().split("T")[0] || ""]: {
                  selected: true,
                  selectedColor: Colors.light.textLight,
                },
              }}
              theme={{
                backgroundColor: Colors.light.background,
                calendarBackground: Colors.light.background,
                textSectionTitleColor: Colors.light.textLight,
                selectedDayBackgroundColor: Colors.light.textLight,
                selectedDayTextColor: Colors.light.background,
                todayTextColor: Colors.light.textLight,
                dayTextColor: Colors.light.textWhite,
                arrowColor: Colors.light.textLight,
                monthTextColor: Colors.light.textWhite,
              }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Language</Text>
            <TextInput
              style={styles.input}
              value={language}
              onChangeText={setLanguage}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numbers of pages</Text>
            <TextInput
              style={styles.input}
              value={pages}
              onChangeText={setPages}
              keyboardType="numeric"
            />
          </View>
        </View>

        <FormActions
          onSave={() => console.log("Save pressed")}
          onCancel={() => navigation?.goBack()}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: 25,
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    color: Colors.light.textWhite,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 20,
  },
  subHeader: {
    color: Colors.light.textWhite,
    textAlign: "center",
    fontSize: 16,
    marginBottom: 30,
    marginTop: 5,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: Colors.light.textWhite,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: Colors.light.textLight,
    padding: 14,
    borderRadius: 10,
    color: Colors.light.textFieldText,
    fontSize: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  calendarWrapper: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.buttonBorder,
  },
});

export default EditBook;
