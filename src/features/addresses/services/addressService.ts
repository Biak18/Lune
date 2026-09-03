import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type Address = Tables<"addresses">;
export type AddressInsert = Omit<Tables<"addresses">, "id" | "created_at" | "updated_at"> & { id?: string };

export const addressService = {
  async list(): Promise<Address[]> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return [];
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(payload: Omit<AddressInsert, "user_id">): Promise<Address> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    // If is_default true, unset others first
    if (payload.is_default) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId).eq("is_default", true);
    }
    const { data, error } = await supabase
      .from("addresses")
      .insert({ ...payload, user_id: userId } as any)
      .select()
      .single();
    if (error) throw error;
    return data as Address;
  },

  async update(id: string, payload: Partial<Omit<Address, "id" | "user_id">>): Promise<Address> {
    const { data, error } = await supabase.from("addresses").update(payload as any).eq("id", id).select().single();
    if (error) throw error;
    return data as Address;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) throw error;
  },

  async setDefault(id: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Please sign in");
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", userId);
    if (error) throw error;
  },
};
