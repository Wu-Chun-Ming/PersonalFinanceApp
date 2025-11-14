import {
    getLastOpenDate,
    updateLastOpenDate,
} from "@/services/appState";
import { useEffect, useState } from "react";

export const useLastOpenDate = () => {
    const [lastOpenDate, setLastOpenDate] = useState<Date | null>(null);

    const refresh = async () => {
        const date = await getLastOpenDate();
        setLastOpenDate(date);
    };

    const update = async () => {
        await updateLastOpenDate();
        await refresh();
    };

    useEffect(() => {
        refresh();
    }, []);

    return {
        lastOpenDate,
        updateAndRefreshLastOpenDate: update,
        refreshLastOpenDate: refresh,
    };
}