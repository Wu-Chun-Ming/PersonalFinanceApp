import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface CustomQueryProps<TData> {
  queryKey: (string | number)[];
  queryFn: () => Promise<TData>;
  onError?: (error: unknown) => void;
  fallbackValue: TData;
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>;
}

export const useCustomQuery = <TData,>({
  queryKey,
  queryFn,
  onError,
  fallbackValue,
  options,
}: CustomQueryProps<TData>) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        console.error(error);
        onError && onError(error);
        return fallbackValue;
      }
    },
    ...options,
  });
};
