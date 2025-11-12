import * as Yup from 'yup';

export const goalSchema = Yup.object().shape({
    savings: Yup.object().shape({
        date: Yup.date()
            .optional()
            .test('date-or-amount', 'Date is required for savings goal', function (value) {
                const { amount } = this.parent;
                // If amount exists, date must be provided
                return !amount || (amount && value);
            }),
        amount: Yup.number()
            .typeError('Amount must be a number')
            .min(0, 'Minimum amount is 0')
            .optional()
            .test('amount-or-date', 'Amount is required for savings goal', function (value) {
                const { date } = this.parent;
                // If date exists, amount must be provided
                return !date || (date && value);
            }),
    }),
    income: Yup.object().shape({
        perDay: Yup.number()
            .typeError('Must be a number')
            .min(0, 'Minimum amount is 0')
            .optional(),
        perMonth: Yup.number()
            .typeError('Must be a number')
            .min(0, 'Minimum amount is 0')
            .optional(),
        perYear: Yup.number()
            .typeError('Must be a number')
            .min(0, 'Minimum amount is 0')
            .optional(),
    }),
});