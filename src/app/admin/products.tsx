import { View, Text, FlatList, Pressable, StyleSheet, Switch, ActivityIndicator, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AdminGuard } from "@/features/admin/components/AdminGuard";
import { adminService } from "@/features/admin/services/adminService";
import { colors } from "@/design/colors";
import { spacing, radius } from "@/design/spacing";
import * as Haptics from "expo-haptics";
import { useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminProductsScreen() {
  const qc = useQueryClient();
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [editingCat, setEditingCat] = useState<any | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "products-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, slug, is_active, base_price, category:categories(name)").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminService.getCategoriesAdmin(),
  });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminService.toggleProductActive(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products-list"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const createCat = useMutation({
    mutationFn: () => {
      const name = catName.trim();
      const slug = (catSlug.trim() || slugify(name));
      if (!name || !slug) throw new Error("Name required");
      return adminService.createCategory({ name, slug });
    },
    onSuccess: () => {
      setCatName(""); setCatSlug("");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const toggleCat = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => adminService.updateCategory(id, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteCat = useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  const saveEditCat = useMutation({
    mutationFn: () => {
      if (!editingCat) throw new Error("No category");
      return adminService.updateCategory(editingCat.id, { name: editingCat.name, slug: editingCat.slug });
    },
    onSuccess: () => {
      setEditingCat(null);
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <AdminGuard>
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.back, { marginTop: 4 }]} hitSlop={8}>
            <Text style={styles.backText}>← Admin</Text>
          </Pressable>
          <Text style={styles.heading}>Products & Categories</Text>
          <Text style={styles.sub}>Active toggles reflect instantly on Home/Shop via query invalidation</Text>
        </View>

        {/* Categories */}
        <View style={styles.catSection}>
          <Text style={styles.sectionTitle}>Categories • {categories?.length ?? 0}</Text>
          <View style={styles.catForm}>
            <TextInput placeholder="New category name" placeholderTextColor={colors.mutedLight} value={catName} onChangeText={(v) => { setCatName(v); if (!catSlug || catSlug === slugify(catName)) setCatSlug(slugify(v)); }} style={styles.input} />
            <TextInput placeholder="slug (auto)" placeholderTextColor={colors.mutedLight} value={catSlug} onChangeText={setCatSlug} style={[styles.input, { flex: 1 }]} autoCapitalize="none" />
            <Pressable onPress={() => createCat.mutate()} disabled={createCat.isPending} style={[styles.addBtn, createCat.isPending && { opacity: 0.6 }]}>
              <Text style={styles.addBtnText}>{createCat.isPending ? "…" : "+ Add"}</Text>
            </Pressable>
          </View>
          {createCat.isError ? <Text style={styles.error}>{String((createCat.error as Error).message)}</Text> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: spacing.xl }} showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
            {(categories ?? []).map((c: any) => (
              <View key={c.id} style={[styles.catChip, !c.is_active && { opacity: 0.6 }]}>
                {editingCat?.id === c.id ? (
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    <TextInput value={editingCat.name} onChangeText={(v) => setEditingCat({ ...editingCat, name: v, slug: slugify(v) })} style={[styles.editInput]} />
                    <Pressable onPress={() => saveEditCat.mutate()} style={styles.miniBtn}><Text style={styles.miniText}>Save</Text></Pressable>
                    <Pressable onPress={() => setEditingCat(null)} style={styles.miniBtn}><Text style={styles.miniText}>Cancel</Text></Pressable>
                  </View>
                ) : (
                  <>
                    <Pressable onPress={() => setEditingCat(c)} style={{ flex: 1 }}>
                      <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                      <Text style={styles.catSlug}>{c.slug} {c.is_active ? "" : "• hidden"}</Text>
                    </Pressable>
                    <Switch value={!!c.is_active} onValueChange={(v) => toggleCat.mutate({ id: c.id, is_active: v })} trackColor={{ true: colors.foreground }} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                    <Pressable
                      onPress={() => Alert.alert("Delete category?", `${c.name} — products will become uncategorized.`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => deleteCat.mutate(c.id) }])}
                      hitSlop={8}
                      style={styles.deleteCat}
                    >
                      <Text style={styles.deleteText}>×</Text>
                    </Pressable>
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.divider} />

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.foreground} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.desc}>{String((error as Error)?.message ?? "Failed")}</Text>
            <Pressable onPress={() => refetch()} style={styles.retry}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={data ?? []}
            keyExtractor={(it: any) => it.id}
            contentContainerStyle={{ padding: spacing.xl, gap: 10, paddingBottom: 32 }}
            ListHeaderComponent={<Text style={styles.sectionTitle}>Products • {data?.length ?? 0}</Text>}
            renderItem={({ item }: any) => (
              <View style={styles.card}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.meta}>{item.category?.name ?? "No category"} • ${Number(item.base_price).toFixed(0)} • {item.slug}</Text>
                </View>
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Text style={styles.meta}>{item.is_active ? "Active" : "Hidden"}</Text>
                  <Switch
                    value={!!item.is_active}
                    onValueChange={async (v) => {
                      try { await Haptics.selectionAsync(); } catch {}
                      toggle.mutate({ id: item.id, isActive: v });
                    }}
                    trackColor={{ true: colors.foreground }}
                  />
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} />
        )}
      </SafeAreaView>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: 6,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.foreground,
    marginTop: 4,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.foreground,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: 8,
  },
  desc: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
  },
  retry: {
    marginTop: 8,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.surface,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 13, fontWeight: "700", color: colors.foreground },
  meta: { fontSize: 11, color: colors.muted },
  sub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  catSection: { paddingHorizontal: spacing.xl, gap: 8, paddingTop: 8 },
  sectionTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", color: colors.foreground },
  catForm: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: { flex: 1, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 10, fontSize: 12, color: colors.foreground },
  addBtn: { height: 36, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.foreground, alignItems: "center", justifyContent: "center" },
  addBtnText: { fontSize: 11, fontWeight: "800", color: colors.surface },
  catChip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, height: 44, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, maxWidth: 260 },
  catName: { fontSize: 12, fontWeight: "700", color: colors.foreground },
  catSlug: { fontSize: 10, color: colors.muted },
  miniBtn: { paddingHorizontal: 8, height: 28, borderRadius: 999, backgroundColor: colors.surfaceMuted, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  miniText: { fontSize: 10, fontWeight: "700", color: colors.foreground },
  deleteCat: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.errorBackground, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  deleteText: { fontSize: 14, fontWeight: "700", color: colors.error, lineHeight: 14 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: 12 },
  error: { fontSize: 11, color: colors.error, paddingHorizontal: spacing.xl },
  editInput: { width: 110, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 8, fontSize: 12, color: colors.foreground, paddingVertical: 0 },
});
