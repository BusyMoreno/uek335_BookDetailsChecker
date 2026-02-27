import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Colors } from "@/constants/theme";
import { createBook } from "../../services/bookService";
import { api } from "../../services/api";
import FormActions from "../../components/FormActions";
import {
  getPublisherByName,
  createPublisher,
} from "../../services/publisherService";
import { getAuthorByName, createAuthor } from "../../services/authorService";
import {
  getLanguageByName,
  createLanguage,
} from "../../services/languageService";
import { Calendar } from "react-native-calendars";
import * as SecureStore from "expo-secure-store";
import { useRouter, useFocusEffect } from "expo-router";

const CreateBook = () => {
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

  const [title, setTitle] = useState("");
  const [isbn13, setIsbn13] = useState("");
  const [pages, setPages] = useState("");
  const [releaseDate, setReleaseDate] = useState<Date | null>(null);
  const [publisherName, setPublisherName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [languageName, setLanguageName] = useState("");

  const handleSave = async () => {
    try {
      const formattedDate = releaseDate
        ? releaseDate.toISOString().split("T")[0]
        : "";

      // Check/create Publisher
      const publishers = await getPublisherByName(publisherName);
      const publisherId = publishers.length
        ? publishers[0].id
        : (await createPublisher(publisherName)).id;

      // Check/createauthor
      const authors = await getAuthorByName(authorName);
      const authorId = authors.length
        ? authors[0].id
        : (await createAuthor(authorName)).id;

      // Check/create language
      const languages = await getLanguageByName(languageName);
      const languageId = languages.length
        ? languages[0].id
        : (await createLanguage(languageName)).id;

      // Create book
      const newBook = await createBook({
        title,
        isbn13,
        num_pages: Number(pages),
        publication_date: formattedDate,
        publisher_id: publisherId,
        language_id: languageId,
      });

      // Connect book and author
      if (newBook && newBook.id) {
        await api.post("/book_author", {
          id: Date.now(),
          book_id: newBook.id,
          author_id: authorId,
        });
      }

      Alert.alert("Success", "Book saved and linked to author");
      handleCancel();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while saving.");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setIsbn13("");
    setPages("");
    setReleaseDate(null);
    setPublisherName("");
    setAuthorName("");
    setLanguageName("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Create new Book</Text>
        <Text style={styles.sectionTitle}>Book Details</Text>

        <FormInput label="Title" value={title} onChangeText={setTitle} />
        <FormInput label="ISBN13" value={isbn13} onChangeText={setIsbn13} />
        <FormInput
          label="Number of Pages"
          value={pages}
          onChangeText={setPages}
          keyboardType="numeric"
        />

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

        <FormInput
          label="Publisher"
          value={publisherName}
          onChangeText={setPublisherName}
        />
        <FormInput
          label="Author"
          value={authorName}
          onChangeText={setAuthorName}
        />
        <FormInput
          label="Language"
          value={languageName}
          onChangeText={setLanguageName}
        />

        <FormActions onSave={handleSave} onCancel={handleCancel} />
      </ScrollView>
    </SafeAreaView>
  );
};

const FormInput = ({ label, value, onChangeText, keyboardType }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      placeholderTextColor={Colors.light.textField}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    padding: 25,
    paddingBottom: 100,
  },
  header: {
    fontSize: 28,
    color: Colors.light.textWhite,
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 10,
  },
  sectionTitle: {
    color: Colors.light.textWhite,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 15,
  },
  inputGroup: {
    marginBottom: 15,
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
  },
  calendarWrapper: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.buttonBorder,
  },
});

export default CreateBook;
