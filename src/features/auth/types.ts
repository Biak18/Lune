import type { Session, User } from "@supabase/supabase-js";

export type AuthUser = User;
export type AuthSession = Session;

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type ResetPasswordPayload = {
  email: string;
};
