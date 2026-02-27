import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/theme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.85;
const ITEM_HEIGHT = ITEM_WIDTH * 1.4;
const SPACING = 10;
const FULL_ITEM_WIDTH = ITEM_WIDTH + SPACING * 2;

const carouselData = [
  {
    id: "8468",
    isbn: "9780891906797",
    title: "Blockbuster",
    uri: "https://covers.openlibrary.org/b/isbn/9780891906797-L.jpg",
  },
  {
    id: "7027",
    isbn: "9780753812938",
    title: "Historical Fiction",
    uri: "https://covers.openlibrary.org/b/isbn/9780753812938-L.jpg",
  },
  {
    id: "5983",
    isbn: "9780674992559",
    title: "Poetry",
    uri: "https://covers.openlibrary.org/b/isbn/9780674992559-L.jpg",
  },
  {
    id: "10291",
    isbn: "9781851588527",
    title: "Autobiography",
    uri: "https://covers.openlibrary.org/b/isbn/9781851588527-L.jpg",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= carouselData.length) nextIndex = 0;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  const customTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: Colors.light.textLight,
      background: Colors.light.background,
      surface: Colors.light.button,
    },
  };

  return (
    <PaperProvider theme={customTheme}>
      <ScrollView
        style={{ backgroundColor: Colors.light.background }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.headerContainer}>
          <Text
            variant="headlineMedium"
            style={[styles.title, { color: Colors.light.textWhite }]}
          >
            Welcome Back
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: Colors.light.textWhite }]}
          >
            Discover your next favorite book
          </Text>
        </View>
        <View style={styles.carouselWrapper}>
          <FlatList
            ref={flatListRef}
            data={carouselData}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={FULL_ITEM_WIDTH}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({
              length: FULL_ITEM_WIDTH,
              offset: FULL_ITEM_WIDTH * index,
              index,
            })}
            contentContainerStyle={{
              paddingHorizontal: (width - ITEM_WIDTH) / 2,
            }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  router.push({
                    pathname: "/BookDetailPage",
                    params: { id: item.id },
                  });
                }}
              >
                <View style={styles.cardContainer}>
                  <Image source={{ uri: item.uri }} style={styles.image} />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.pagination}>
            {carouselData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === activeIndex
                        ? Colors.light.textLight
                        : "rgba(255,255,255,0.2)",
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => router.push("/BookListPage")}
            buttonColor={Colors.light.button}
            textColor={Colors.light.textWhite}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Find Book
          </Button>
        </View>
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    alignItems: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    opacity: 0.7,
    textAlign: "center",
  },
  carouselWrapper: {
    width: "100%",
    height: ITEM_HEIGHT + 60,
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginHorizontal: SPACING,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    backgroundColor: Colors.light.textDark,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 25,
    marginTop: 40,
  },
  button: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.light.buttonBorder,
  },
  buttonContent: {
    paddingVertical: 10,
  },
});
