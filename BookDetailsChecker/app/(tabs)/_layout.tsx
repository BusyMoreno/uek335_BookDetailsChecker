import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Colors } from "../../constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.textLight,
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopWidth: 0,
          height: 90,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarBackground: () => (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: "5%",
              right: "5%",
              height: 1.5,
              backgroundColor: Colors.light.textLight,
              opacity: 0.8,
              borderRadius: 1,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="Homepage"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="BookListPage"
        options={{
          title: "Book List",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="CreateBook"
        options={{
          title: "New book",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfilePage"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="EditPage"
        options={{
          title: "Edit Book",

          href: null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "create" : "create-outline"}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="LoginPage"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="RegisterPage"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="StartingPage"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="BookDetailPage"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
