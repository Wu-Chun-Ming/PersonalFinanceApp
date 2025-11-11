import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';

interface MutationResponse {
  success: boolean;
  messages: string;
}

interface CustomMutationProps<TVariables, TData extends MutationResponse> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  invalidateKeys?: (variables?: TVariables) => (string | unknown[])[];
  onInvalidationComplete?: () => void;
  delayInvalidate?: number; // optional delay (default 300ms)
}

export const useCustomMutation = <TVariables, TData extends MutationResponse>({
  mutationFn,
  invalidateKeys,
  onInvalidationComplete,
  delayInvalidate = 300,
}: CustomMutationProps<TVariables, TData>) => {
  const queryClient = useQueryClient();
  const showToast = useShowToast();

  return useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: (response: {
      success: boolean;
      messages: string;
    }) => {
      const { success, messages } = response;
      const actionType = success ? 'success' : 'info';
      showToast({ action: actionType, messages: messages });
    },
    onError: (error) => {
      showToast({ action: 'warning', messages: error.message });
    },
    onSettled: (_data, error, variables) => {
      if (!error && invalidateKeys) {
        setTimeout(() => {
          const keys = invalidateKeys(variables);
          keys.forEach((key) => queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key]
          }));
          onInvalidationComplete && onInvalidationComplete();
        }, delayInvalidate);    // Wait 300ms to allow refetch to avoid warning 'useInsertionEffect must not schedule updates'
      }
    },
  });
};
