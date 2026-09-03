import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldInput } from "@/components/ui/FieldInput";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  recipient_name: z.string().min(2, "Name required"),
  phone: z.string().optional(),
  label: z.string().optional(),
  address_line_1: z.string().min(5, "Address required"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().min(2, "Country required"),
  is_default: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof schema>;

type Props = {
  onSubmit: (values: AddressFormValues) => void;
  submitting?: boolean;
  defaultValues?: Partial<AddressFormValues>;
};

export function AddressForm({ onSubmit, submitting, defaultValues }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      recipient_name: "",
      phone: "",
      label: "Home",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
      is_default: true,
      ...defaultValues,
    },
  });

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="recipient_name"
        render={({ field: { value, onChange, onBlur } }) => (
          <FieldInput label="Full name" placeholder="Jane Doe" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.recipient_name?.message} autoCapitalize="words" />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { value, onChange, onBlur } }) => (
          <FieldInput label="Phone (optional)" placeholder="+1 555 0100" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} error={errors.phone?.message} keyboardType="phone-pad" />
        )}
      />
      <Controller
        control={control}
        name="label"
        render={({ field: { value, onChange, onBlur } }) => (
          <FieldInput label="Label (Home / Work)" placeholder="Home" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} error={errors.label?.message} />
        )}
      />
      <Controller
        control={control}
        name="address_line_1"
        render={({ field: { value, onChange, onBlur } }) => (
          <FieldInput label="Address line 1" placeholder="123 Market St" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.address_line_1?.message} />
        )}
      />
      <Controller
        control={control}
        name="address_line_2"
        render={({ field: { value, onChange, onBlur } }) => (
          <FieldInput label="Address line 2 (optional)" placeholder="Apt 4B" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} error={errors.address_line_2?.message} />
        )}
      />
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="city"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput label="City" placeholder="New York" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.city?.message} />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="state"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput label="State" placeholder="NY" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} error={errors.state?.message} />
            )}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="postal_code"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput label="Postal code" placeholder="10001" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} error={errors.postal_code?.message} />
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="country"
            render={({ field: { value, onChange, onBlur } }) => (
              <FieldInput label="Country" placeholder="US" value={value ?? ""} onChangeText={onChange} onBlur={onBlur} error={errors.country?.message} autoCapitalize="characters" />
            )}
          />
        </View>
      </View>
      <Button title={submitting ? "Saving…" : "Save address"} onPress={handleSubmit(onSubmit as any)} loading={!!submitting} disabled={!!submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
    paddingTop: 8,
  },
});
