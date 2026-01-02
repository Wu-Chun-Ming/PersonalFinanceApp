import Ionicons from '@expo/vector-icons/build/Ionicons';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

// Gluestack UI
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText
} from "@/components/ui/form-control";

interface FormGroupProps {
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  style?: StyleProp<ViewStyle>;
  direction?: "row" | "column";
  label?: string;
  children: React.ReactNode;
  helperText?: string;
  errorText?: string;
}

const FormGroup = ({
  isRequired,
  isDisabled,
  isReadOnly,
  isInvalid,
  style,
  direction = "column",
  label,
  children,
  helperText,
  errorText,
}: FormGroupProps) => {
  return (
    <FormControl
      size="lg"
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      style={style}
    >
      <View style={[
        direction === "row" && {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }
      ]}>
        {label && <FormControlLabel className="my-2">
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>}

        {children}
      </View>
      {helperText && (
        <FormControlHelper>
          <FormControlHelperText>
            {helperText}
          </FormControlHelperText>
        </FormControlHelper>
      )}

      {isInvalid && errorText && (
        <FormControlError>
          <Ionicons name="alert-circle-outline" size={22} color="red" />
          <FormControlErrorText style={{ flexShrink: 1 }}>
            {errorText}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};

export default FormGroup;
