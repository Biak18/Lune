/* eslint-disable @typescript-eslint/no-unused-vars -- Google auth temporarily disabled */
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { FieldInput } from "@/components/ui/FieldInput";
import { PasswordRequirements } from "@/components/ui/PasswordRequirements";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { Divider } from "@/components/ui/Divider";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { useRegisterMutation, useGoogleAuthMutation } from "@/features/auth/hooks/useAuthMutations";
import { registerSchema, type RegisterFormValues } from "@/utils/validation";
import { getAuthErrorMessage } from "@/utils/errors";
import { colors } from "@/design/colors";
import { env } from "@/config/env";

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const register = useRegisterMutation();
  const googleAuth = useGoogleAuthMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = useWatch({ control, name: "password" });

  const onSubmit = (values: RegisterFormValues) => {
    setProviderError(null);
    setSuccessMessage(null);
    register.mutate(
      { email: values.email, password: values.password, fullName: values.fullName || undefined },
      {
        onSuccess: (data) => {
          if (data.session) {
            router.replace("/");
          } else {
            setSuccessMessage("Account created. Check your email to confirm your account, then sign in.");
          }
        },
      }
    );
  };

  const handleGooglePress = () => {
    setProviderError(null);
    googleAuth.mutate(undefined, {
      onSuccess: () => router.replace("/"),
      onError: (e) => setProviderError(getAuthErrorMessage(e)),
    });
  };

  const googleError = googleAuth.isError ? getAuthErrorMessage(googleAuth.error) : null;
  const formError = register.isError ? getAuthErrorMessage(register.error) : null;
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
            title="Create account"
            subtitle="Join the boutique. Save dresses, track orders, and discover new collections."
          />
        </Animated.View>

        {isEnvMissing ? (
          <Animated.View entering={FadeInUp.delay(80).duration(420).springify()}>
            <View style={styles.envWarning}>
              <Text style={styles.envWarningText}>
                Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and
                EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env to enable authentication.
              </Text>
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.form}>
        <Animated.View entering={FadeInUp.delay(100).duration(420).springify()}>
          <FormError message={providerError ?? googleError ?? formError} />
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
            name="fullName"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput
                label="Full name"
                hint="Optional"
                placeholder="Alex Morgan"
                autoCapitalize="words"
                autoCorrect={false}
                textContentType="name"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
                editable={!register.isPending}
              />
            )}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(420).springify()}>
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
                editable={!register.isPending}
              />
            )}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(260).duration(420).springify()} style={{ gap: 4 }}>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput
                label="Password"
                placeholder="At least 6 characters"
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                editable={!register.isPending}
                rightElement={
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.toggle}
                    accessibilityRole="button"
                  >
                    <Text style={styles.toggleText}>{showPassword ? "Hide" : "Show"}</Text>
                  </Pressable>
                }
              />
            )}
          />
          {(passwordValue?.length ?? 0) > 0 || !!errors.password ? (
            <PasswordRequirements password={passwordValue ?? ""} />
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(320).duration(420).springify()}>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput
                label="Confirm password"
                placeholder="Repeat password"
                secureTextEntry
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                editable={!register.isPending}
              />
            )}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(380).duration(420).springify()}>
          <Button
            title="Create account"
            onPress={handleSubmit(onSubmit)}
            loading={register.isPending}
            disabled={isEnvMissing}
          />
        </Animated.View>

        {/* Google auth temporarily disabled
        <Animated.View entering={FadeInUp.delay(440).duration(420).springify()}>
          <Divider label="or" />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(420).springify()}>
          <Button title="Continue with Google" variant="secondary" onPress={handleGooglePress} loading={googleAuth.isPending} disabled={isEnvMissing} style={styles.googleBtn} />
        </Animated.View>
        */}

        <Animated.View entering={FadeInUp.delay(560).duration(420).springify()} style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/auth/login" asChild>
            <Pressable>
              <Text style={styles.link}>Sign in</Text>
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
  toggle: {
    height: 36,
    paddingHorizontal: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    color: colors.muted,
  },
  googleBtn: { borderColor: colors.border },
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
