import { FormikValues, getIn } from 'formik';
import { DatePickerModal } from 'react-native-paper-dates';

interface DateModalProps {
    visible?: boolean;
    fieldName: string;
    formik: FormikValues;
    minimumDate?: Date;
    onClose?: () => void;
}

const DatePicker = ({
    visible = true,
    fieldName,
    formik,
    minimumDate,
    onClose,
}: DateModalProps) => {
    if (!visible) return null;

    const fieldValue: string[] = getIn(formik.values, fieldName);
    const dates = fieldValue ? fieldValue.map((d: string) => new Date(d)) : [new Date()];

    return (
        <DatePickerModal
            locale='en'
            mode='multiple'
            visible={visible}
            onDismiss={() => onClose?.()}
            dates={dates}
            onConfirm={({ dates }) => {
                formik.setFieldValue(
                    fieldName,
                    dates.map((d) => d.toString())
                );
            }}
            validRange={{
                startDate: minimumDate,
            }}
        />
    );
}

export default DatePicker;