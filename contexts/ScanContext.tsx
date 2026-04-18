import { TransactionFormikProps } from "@/hooks/useTransactionsFormik";
import {
    createContext,
    ReactNode,
    useState,
} from "react";

interface ScanContextType {
    scannedData: TransactionFormikProps[];
    setScannedData: React.Dispatch<React.SetStateAction<TransactionFormikProps[]>>;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider = ({ children }: { children: ReactNode }) => {
    const [scannedData, setScannedData] = useState<TransactionFormikProps[]>([]);

    return (
        <ScanContext.Provider value={{ scannedData, setScannedData }}>
            {children}
        </ScanContext.Provider>
    );
};

export default ScanContext;