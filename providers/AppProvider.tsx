import { ModelProvider } from "@/contexts/ModelContext";
import { ServerProvider } from "@/contexts/ServerContext";
import { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ServerProvider>
            <ModelProvider>
                {children}
            </ModelProvider>
        </ServerProvider>
    );
}