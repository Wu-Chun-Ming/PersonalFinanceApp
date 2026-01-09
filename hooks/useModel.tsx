import ModelContext from "@/contexts/ModelContext";
import { useContext } from "react";

export const useModel = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModel must be used inside a ModelProvider');
    }
    return context;
};