import React, { useState } from "react";
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

const CreateBook = () => {
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

      // 1. Publisher check/create
      const publishers = await getPublisherByName(publisherName);
      const publisherId = publishers.length
        ? publishers[0].id
        : (await createPublisher(publisherName)).id;

      // 2. Author check/create (Fix: author_name statt name)
      const authors = await getAuthorByName(authorName);
      const authorId = authors.length
        ? authors[0].id
        : (await createAuthor(authorName)).id;

      // 3. Language check/create
      const languages = await getLanguageByName(languageName);
      const languageId = languages.length
        ? languages[0].id
        : (await createLanguage(languageName)).id;

      // 4. Create book
      const newBook = await createBook({
        title,
        isbn13,
        num_pages: Number(pages),
        publication_date: formattedDate,
        publisher_id: publisherId,
        language_id: languageId,
      });

      // 5. Connect book and author (Fix: Manuelle ID für json-server)
      if (newBook && newBook.id) {
        await api.post("/book_author", {
          id: Date.now(), // Verhindert den TypeError: Cannot read properties of undefined (reading 'id')
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
