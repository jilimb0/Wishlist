import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { BlurView } from "expo-blur"
import { useAuth } from "../context/AuthContext"

import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useI18n } from "../i18n/context"
import DashboardScreen from "../screens/DashboardScreen"
import DiscoverScreen from "../screens/DiscoverScreen"
import FollowingScreen from "../screens/FollowingScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"
import FriendsScreen from "../screens/FriendsScreen"
// Screens
import LoginScreen from "../screens/LoginScreen"
import NotificationsScreen from "../screens/NotificationsScreen"
import ProfileScreen from "../screens/ProfileScreen"
import PublicProfileScreen from "../screens/PublicProfileScreen"
import RegisterScreen from "../screens/RegisterScreen"
import ResetPasswordScreen from "../screens/ResetPasswordScreen"
import WishlistDetailScreen from "../screens/WishlistDetailScreen"
import { colors, glass, spacing } from "../theme"

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: "#0a0a0a" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  const { t } = useI18n()

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: glass.background.primary,
          borderTopColor: glass.border.subtle,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: spacing.md,
          paddingTop: spacing.sm,
          paddingHorizontal: spacing.sm,
          position: "absolute",
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: "rgba(255,255,255,0.3)",
        tabBarItemStyle: {
          paddingHorizontal: 0,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.2,
          marginBottom: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline"
          } else if (route.name === "Discover") {
            iconName = focused ? "search" : "search-outline"
          } else if (route.name === "Following") {
            iconName = focused ? "heart" : "heart-outline"
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline"
          } else {
            iconName = "ellipse"
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t("nav.my_lists"),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarLabel: t("nav.discover") }}
      />
      <Tab.Screen
        name="Following"
        component={FollowingScreen}
        options={{ tabBarLabel: t("nav.following") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: t("nav.profile") }}
      />
    </Tab.Navigator>
  )
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0a0a0a" },
        headerTintColor: "#fff",
        contentStyle: { backgroundColor: "#0a0a0a" },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="WishlistDetail"
        component={WishlistDetailScreen}
        options={{
          title: "Wishlist",
          headerBlurEffect: "dark",
          headerTransparent: true,
          headerStyle: { backgroundColor: "rgba(10, 10, 10, 0.8)" },
        }}
      />
      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{
          title: "Profile",
          headerBlurEffect: "dark",
          headerTransparent: true,
          headerStyle: { backgroundColor: "rgba(10, 10, 10, 0.8)" },
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          presentation: "modal",
          title: "Notifications",
          headerBlurEffect: "dark",
          headerTransparent: true,
          headerStyle: { backgroundColor: "rgba(10, 10, 10, 0.8)" },
        }}
      />
      <Stack.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          presentation: "modal",
          title: "Friends",
          headerBlurEffect: "dark",
          headerTransparent: true,
          headerStyle: { backgroundColor: "rgba(10, 10, 10, 0.8)" },
        }}
      />
    </Stack.Navigator>
  )
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0a0a0a",
        }}
      >
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    )
  }

  return <NavigationContainer>{user ? <AuthenticatedStack /> : <AuthStack />}</NavigationContainer>
}
