import React from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/design/colors";

type ScreenProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  contentStyle?: ViewStyle;
  padded?: boolean;
  centered?: boolean;
};

export function Screen({
  children,
  scrollable = true,
  contentStyle,
  padded = true,
  centered = false,
}: ScreenProps) {
  const content = (
    <View style={[padded && styles.padded, centered && styles.paddedCentered, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.scrollContent, centered && styles.scrollContentCentered]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
           showsHorizontalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.flex, centered && styles.flexCentered]}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background, // paper
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
    backgroundColor: colors.background,
  },
  scrollContentCentered: {
    justifyContent: "center",
    minHeight: "100%",
  },
  flexCentered: {
    justifyContent: "center",
  },
  padded: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 0,
    backgroundColor: colors.background,
  },
  paddedCentered: {
    flex: 1,
    justifyContent: "center",
  },
});
