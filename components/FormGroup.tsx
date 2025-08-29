import Ionicons from '@expo/vector-icons/build/Ionicons';
import React from 'react';

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

const FormGroup = ({ isRequired, isDisabled, isReadOnly, isInvalid, style, label, children, helperText, errorText }: any) => {
  return (
    <FormControl
      size="lg"
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      style={style}
    >
      {label && <FormControlLabel className="my-2">
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>}

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
