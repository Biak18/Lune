import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FieldInput } from "@/components/ui/FieldInput";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { useResetPasswordMutation } from "@/features/auth/hooks/useAuthMutations";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/utils/validation";
import { getAuthErrorMessage } from "@/utils/errors";
import { colors } from "@/design/colors";
import { env } from "@/config/env";

export default function ForgotPasswordScreen() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const reset = useResetPasswordMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    setSuccessMessage(null);
    reset.mutate(
      { email: values.email },
      {
        onSuccess: () => {
          setSuccessMessage(
            "If an account exists for this email, you’ll receive a password reset link shortly. Please also check your spam folder."
          );
        },
      }
    );
  };

  const formError = reset.isError ? getAuthErrorMessage(reset.error) : null;
  const isEnvMissing = !env.isSupabaseConfigured();

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={24}
        enableAutomaticScroll
       showsHorizontalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(480).springify().damping(16)}>
          <AuthHeader
            title="Reset password"
            subtitle="Enter your email and we’ll send you a link to reset your password."
          />
        </Animated.View>

        {isEnvMissing ? (
          <Animated.View entering={FadeInUp.delay(80).duration(420).springify()}>
            <View style={styles.envWarning}>
              <Text style={styles.envWarningText}>
                Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and
                EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env to enable this feature.
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.form}>
        <Animated.View entering={FadeInUp.delay(100).duration(420).springify()}>
          <FormError message={formError} />
        </Animated.View>
        {successMessage ? (
          <Animated.View entering={FadeInUp.delay(120).duration(420).springify()}>
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(140).duration(420).springify()}>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                editable={!reset.isPending}
              />
            )}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(420).springify()}>
          <Button title="Send reset link" onPress={handleSubmit(onSubmit)} loading={reset.isPending} disabled={isEnvMissing} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(420).springify()} style={styles.footer}>
          <Text style={styles.footerText}>Remember your password?</Text>
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text style={styles.link}>Back to sign in</Text>
            </Pressable>
          </Link>
        </Animated.View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  form: {
    gap: 16,
    paddingTop: 24,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: colors.muted,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.foreground,
    textDecorationLine: "underline",
  },
  successBox: {
    backgroundColor: colors.successBackground,
    borderWidth: 1,
    borderColor: "#A3D9B1",
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.success,
  },
  envWarning: {
    backgroundColor: "#FFF8E1",
    borderWidth: 1,
    borderColor: "#FFE082",
    borderRadius: 12,
    padding: 12,
  },
  envWarningText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#7A5C00",
  },
});
