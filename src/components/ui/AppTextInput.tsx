import { forwardRef } from "react";
import { TextInput, TextInputProps, TextStyle, ViewStyle } from "react-native";
import { FieldInput } from "./FieldInput";

/**
 * @deprecated Use `FieldInput` from `@/components/ui/FieldInput` for all new code.
 * This wrapper preserves the legacy `AppTextInput` API but now delegates to `FieldInput`
 * so there is a single visual implementation going forward.
 *
 * Migration:
 * ```tsx
 * // before
 * import { AppTextInput } from "@/components/ui/AppTextInput";
 * <AppTextInput label="Email" value={email} onChangeText={setEmail} error={err} />
 *
 * // after
 * import { FieldInput } from "@/components/ui/FieldInput";
 * <FieldInput label="Email" value={email} onChangeText={setEmail} error={err} />
 * ```
 */
type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
};

export const AppTextInput = forwardRef<TextInput, Props>(function AppTextInput(
  { label, error, hint, containerStyle, style, value, ...props },
  ref
) {
  // If a label is provided we can fully delegate to the canonical component.
  if (label) {
    return (
      <FieldInput
        ref={ref}
        label={label}
        value={(value as string) ?? ""}
        error={error}
        hint={hint}
        containerStyle={containerStyle}
        inputStyle={style as TextStyle}
        {...props}
      />
    );
  }

  // Fallback: legacy mode without floating label — still delegate with placeholder-as-label
  // to keep styling consistent. `FieldInput` requires a label, so derive one.
  const fallbackLabel = (props.placeholder as string) || "Field";
  return (
    <FieldInput
      ref={ref}
      label={fallbackLabel}
      value={(value as string) ?? ""}
      error={error}
      hint={hint}
      containerStyle={containerStyle}
      inputStyle={style as TextStyle}
      placeholder={props.placeholder as string}
      {...props}
    />
  );
});
