import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { usePriceHistory } from "../hooks/api"

type PriceRow = {
  id: string
  price: number
  currency: string
  checkedAt: string
}

export function PriceHistoryList({ itemId, enabled }: { itemId: string; enabled?: boolean }) {
  const { data: history, isLoading } = usePriceHistory(itemId)

  if (!enabled) return null
  if (isLoading) return <ActivityIndicator size="small" color="#a78bfa" />
  if (!history?.length) return null

  const recent = history.slice(0, 5) as PriceRow[]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price history</Text>
      {recent.map((row: PriceRow) => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.date}>{new Date(row.checkedAt).toLocaleDateString()}</Text>
          <Text style={styles.price}>{formatPrice(row.price, row.currency)}</Text>
        </View>
      ))}
    </View>
  )
}

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(price)
  } catch {
    return `$${price.toFixed(2)}`
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
    maxHeight: 96,
  },
  title: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#71717a",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  date: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  price: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a78bfa",
  },
})
