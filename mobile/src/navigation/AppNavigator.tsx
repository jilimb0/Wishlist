import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAuth } from "../context/AuthContext"

import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native"
import { useNotifications } from "../hooks/api"
import DashboardScreen from "../screens/DashboardScreen"
import DiscoverScreen from "../screens/DiscoverScreen"
import FollowingScreen from "../screens/FollowingScreen"
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen"
// Screens
import LoginScreen from "../screens/LoginScreen"
import NotificationsScreen from "../screens/NotificationsScreen"
import ProfileScreen from "../screens/ProfileScreen"
import PublicProfileScreen from "../screens/PublicProfileScreen"
import RegisterScreen from "../screens/RegisterScreen"
import ResetPasswordScreen from "../screens/ResetPasswordScreen"
import WishlistDetailScreen from "../screens/WishlistDetailScreen"

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

function MainTabs({ navigation }: any) {
  const { data } = useNotifications(10)
  const unreadCount = data?.notifications.filter((n) => !n.isRead).length || 0

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#18181b",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#ffc107",
        tabBarInactiveTintColor: "#71717a",
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
          headerShown: true,
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTitleStyle: { color: "#fff", fontWeight: "800" },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Notifications")}
              style={{ marginRight: 15, position: "relative" }}
            >
              <Ionicons name="notifications-outline" size={24} color="#f5f5f5" />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    backgroundColor: "#ef4444",
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#0a0a0a",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 8, fontWeight: "900" }}>
                    {unreadCount > 9 ? "!" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Following" component={FollowingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="WishlistDetail"
        component={WishlistDetailScreen}
        options={{ title: "Wishlist" }}
      />
      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ presentation: "modal", title: "Notifications" }}
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
