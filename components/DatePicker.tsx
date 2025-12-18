import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { FormikValues, getIn } from 'formik';

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

    const fieldValue = getIn(formik.values, fieldName);
    const currentDate = fieldValue ? new Date(fieldValue) : new Date();

    return (
        <DateTimePicker
            value={currentDate}
            mode='date'
            minimumDate={minimumDate}
            onChange={(event, selectedDate) => {
                // If user selected date and pressed OK
                if (event.type === 'set' && selectedDate) {
                    formik.setFieldValue(
                        fieldName,
                        dayjs(selectedDate).format('YYYY-MM-DD')
                    );
                }
                onClose?.();
            }}
        />

    );
}

export default DatePicker;