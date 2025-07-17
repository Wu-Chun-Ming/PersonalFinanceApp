import { Toast, ToastDescription, useToast } from '@/components/ui/toast';
import React from 'react';

const useShowToast = () => {
    const toast = useToast();
    const showToast = ({
        action,
        messages,
    }: {
        action: "error" | "warning" | "success" | "info" | "muted",
        messages: string | Record<string, string[] | string>,
        // Format 1: { 'message1': 'hello' , 'message2': 'hi' }
        // Format 2: 'hello'
        // Format 3: { 'message1': ['hello'], 'message2' : ['hi'] }      // Laravel validation message
    }) => {
        // Handle string
        messages = (typeof messages === 'string') ? { default: messages } : messages;

        // Show messages in toast
        for (const field in messages) {
            const message = Array.isArray(messages[field]) ? messages[field][0] : messages[field];

            toast.show({
                placement: "top",
                render: ({ id }) => {
                    const uniqueToastId = "toast-" + id
                    return (
                        <Toast nativeID={uniqueToastId} action={action} variant="solid" className='w-full'>
                            <ToastDescription>{message}</ToastDescription>
                        </Toast>
                    )
                },
            });
        }
    };

    return showToast;
};

export default useShowToast;