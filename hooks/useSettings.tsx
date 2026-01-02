import { useModel } from "./useModel";
import { useServer } from "./useServer";

export const useSettings = () => {
    const model = useModel();
    const server = useServer();

    return {
        ...model,
        ...server
    };
};