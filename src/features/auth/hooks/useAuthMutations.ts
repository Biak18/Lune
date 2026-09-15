import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "../services/authService";

import type { LoginPayload, RegisterPayload } from "../types";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.signIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.signOut(),

    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.signUp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: { email: string }) =>
      authService.requestPasswordReset(payload.email),
  });
}

export function useGoogleAuthMutation() {
  return useMutation({
    mutationFn: async (): Promise<never> => {
      throw new Error("Google sign-in is not available on this backend.");
    },
  });
}
