import { FormikConfig, FormikValues, useFormik } from "formik";

interface UseCustomFormikProps<T extends FormikValues, U> extends Omit<FormikConfig<T>, 'onSubmit'> {
    transformValues: (values: T) => U;
    onSubmitCallback?: (transformedValues: U, originalValues: T) => void;
}

export function useCustomFormik<T extends FormikValues, U>({
    transformValues,
    onSubmitCallback,
    ...formikConfig
}: UseCustomFormikProps<T, U>) {
    return useFormik({
        ...formikConfig,
        onSubmit: (values) => {
            const transformed = transformValues(values);
            onSubmitCallback && onSubmitCallback(transformed, values);
        },
    });
}
