import styles from "@/app/styles";
import { useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Text, View } from "react-native";
import { Button, ButtonText } from "./ui/button";

type QueryStateProps = {
    isLoading: boolean;
    isRefetching: boolean;
    isError: boolean;
    isRefetchError: boolean;
    queryKey: string;
    message?: string;
    onRetry: () => void;
};

const QueryState = ({
    isLoading = false,
    isRefetching = false,
    isError = false,
    isRefetchError = false,
    queryKey,
    message = "Error loading data",
    onRetry,
}: QueryStateProps) => {
    const queryClient = useQueryClient();

    // If still loading or refetching
    if (isLoading || isRefetching) {
        return (
            <View style={styles.centeredFlex}>
                <ActivityIndicator size={80} color="#0000ff" />
            </View>
        );
    }

    // If error occurs
    if (isError || isRefetchError) {
        return (
            <View style={styles.centeredFlex}>
                <Text style={{ color: "red" }}>{message}</Text>
                <Button onPress={() => {
                    queryClient.invalidateQueries({ queryKey: [queryKey], exact: true });
                    onRetry();
                }}>
                    <ButtonText>Try again</ButtonText>
                </Button>
            </View>
        );
    }

    return null;
};

export default QueryState;