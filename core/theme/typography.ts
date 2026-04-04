import { TextStyle } from "react-native"
import { typography } from "./tokens"

export const textStyles = {
  h1: {
    fontSize: typography.fontSize["4xl"],
    lineHeight: typography.lineHeight["4xl"],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  } as TextStyle,

  h2: {
    fontSize: typography.fontSize["3xl"],
    lineHeight: typography.lineHeight["3xl"],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  } as TextStyle,

  h3: {
    fontSize: typography.fontSize["2xl"],
    lineHeight: typography.lineHeight["2xl"],
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  h4: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  h5: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  h6: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  bodyLarge: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  bodySmall: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  labelLarge: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  labelSmall: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  caption: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.normal,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  buttonLarge: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  button: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  buttonSmall: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  } as TextStyle,

  overline: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: "uppercase" as const,
  } as TextStyle,
} as const

export type TextStyleName = keyof typeof textStyles
