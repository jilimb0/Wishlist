import { StyleSheet } from "react-native"
import { colors, fontSize, fontWeight, glass, radius, spacing } from "./tokens"

/**
 * Общие переиспользуемые стили
 */

export const commonStyles = StyleSheet.create({
  // Контейнеры
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing["4xl"],
  },

  // Карточки
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: spacing.lg,
  },
  cardCompact: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: spacing.md,
  },

  // Кнопки
  button: {
    backgroundColor: colors.accent.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  buttonSecondary: {
    backgroundColor: colors.background.tertiary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSecondaryText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  // Инпуты
  input: {
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
  inputLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },

  // Текст
  textPrimary: {
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
  textSecondary: {
    color: colors.text.tertiary,
    fontSize: fontSize.base,
  },
  textMuted: {
    color: colors.text.quaternary,
    fontSize: fontSize.sm,
  },

  // Заголовки
  h1: {
    color: colors.text.primary,
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
  },
  h2: {
    color: colors.text.primary,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.semibold,
  },
  h3: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  h4: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },

  // Секции
  section: {
    marginBottom: spacing.xl,
  },

  // Разделители
  divider: {
    height: 1,
    backgroundColor: colors.border.primary,
    marginVertical: spacing.lg,
  },

  // Центрирование
  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Flex
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Glass компоненты
  glassCard: {
    borderRadius: spacing.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: glass.border.light,
  },
  glassCardInner: {
    padding: spacing.lg,
    backgroundColor: glass.background.secondary,
  },
  glassButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: glass.border.light,
    justifyContent: "center",
    alignItems: "center",
  },
  glassHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.xs,
    backgroundColor: glass.handle,
  },
})
