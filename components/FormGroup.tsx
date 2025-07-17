import Ionicons from '@expo/vector-icons/build/Ionicons';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

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
const FormGroup = ({ isRequired, isDisabled, isReadOnly, label, children, helperText, isInvalid, errorText }: any) => {
  return (
    <FormControl
      size="lg"
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
    >
      <FormControlLabel className="my-2">
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>

      {children}
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
          <FormControlErrorText>
            {errorText}
          </FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
export default FormGroup;
