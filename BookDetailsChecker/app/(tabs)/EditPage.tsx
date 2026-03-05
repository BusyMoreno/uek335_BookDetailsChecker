import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "../../constants/theme";
import FormActions from "../../components/FormActions";
import { useBookForm } from "../../hooks/useBookForm";
import {
  FormInput,
  DatePicker,
  FormContainer,
} from "../../components/FormInput";

/**
 * EditBook page component
 * Allows users to update an existing book's details with form validation
 *
 * All business logic is handled by the useBookForm hook
 * This component only handles UI rendering, data loading, and user interactions
 *
 * @component
 * @returns {React.ReactElement} The edit book page
 */
const EditBook = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = Number(params.bookId || params.id);

  const form = useBookForm("edit", bookId);
  const {
    formData,
    loading,
    handleFieldChange,
    handleSave,
    loadBookData,
    getErrorForField,
  } = form;

  // Validate bookId and load data when page gains focus
  useFocusEffect(
    React.useCallback(() => {
      if (!bookId || bookId === 0) {
        Alert.alert(
          "Invalid Book",
          "The book couldn't be loaded. Please return to the book list and try again.",
          [{ text: "Go Back", onPress: () => router.back(), style: "cancel" }],
        );
        return;
      }

      loadBookData();
    }, [bookId, loadBookData]),
  );

  const handleSaveAndNavigate = async () => {
    const result = await handleSave();
    if (result === true) {
      router.replace({
        pathname: "/(tabs)/BookDetailPage",
        params: { id: bookId.toString() },
      });
    }
  };

  // Show loading indicator while fetching book data
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.light.textLight} />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Edit Book</Text>
        <Text style={styles.subHeader}>Update your book details</Text>

        <FormContainer>
          <FormInput
            label="Title"
            value={formData.title}
            onChangeText={(text) => handleFieldChange("title", text)}
            error={getErrorForField("title")}
            required
          />

          <FormInput
            label="ISBN-13"
            value={formData.isbn13 || ""}
            onChangeText={(text) => handleFieldChange("isbn13", text)}
            error={getErrorForField("isbn13")}
            placeholder="e.g. 978-3-16-148410-0"
          />

          <FormInput
            label="Number of Pages"
            value={formData.pages}
            onChangeText={(text) => handleFieldChange("pages", text)}
            error={getErrorForField("pages")}
            keyboardType="numeric"
            required
          />

          <DatePicker
            label="Publication Date"
            value={formData.releaseDate}
            onChange={(date) => handleFieldChange("releaseDate", date)}
            error={getErrorForField("releaseDate")}
          />

          <FormInput
            label="Publisher"
            value={formData.publisherName}
            onChangeText={(text) => handleFieldChange("publisherName", text)}
            error={getErrorForField("publisherName")}
            required
          />

          <FormInput
            label="Author"
            value={formData.authorName}
            onChangeText={(text) => handleFieldChange("authorName", text)}
            error={getErrorForField("authorName")}
            required
          />

          <FormInput
            label="Language"
            value={formData.languageName}
            onChangeText={(text) => handleFieldChange("languageName", text)}
            error={getErrorForField("languageName")}
            required
          />
        </FormContainer>

        <FormActions
          onSave={handleSaveAndNavigate}
          onCancel={() => router.back()}
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
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 25,
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: 20,
  },
  subHeader: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 30,
    marginTop: 5,
  },
  loadingText: {
    color: "white",
    marginTop: 12,
  },
});

export default EditBook;
