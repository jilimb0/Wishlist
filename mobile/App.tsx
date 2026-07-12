import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message"
import { AuthProvider } from "./src/context/AuthContext"
import { I18nProvider } from "./src/i18n/context"
import AppNavigator from "./src/navigation/AppNavigator"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

interface ToastProps {
  text1?: string
  text2?: string
  props?: Record<string, unknown>
}

const toastConfig = {
  success: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#fbbf24",
        backgroundColor: "#18181b",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 13,
        color: "#a1a1aa",
      }}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444",
        backgroundColor: "#18181b",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 13,
        color: "#a1a1aa",
      }}
    />
  ),
  info: (props: ToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#3b82f6",
        backgroundColor: "#18181b",
        borderLeftWidth: 5,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
      }}
      text2Style={{
        fontSize: 13,
        color: "#a1a1aa",
      }}
    />
  ),
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <I18nProvider>
            <StatusBar style="light" />
            <AppNavigator />
            <Toast config={toastConfig} topOffset={60} />
          </I18nProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
