import { ModelProvider } from "@/contexts/ModelContext";
import { OcrProvider } from "@/contexts/OcrContext";
import { ServerProvider } from "@/contexts/ServerContext";
import { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ServerProvider>
            <ModelProvider>
                <OcrProvider>
                    {children}
                </OcrProvider>
            </ModelProvider>
        </ServerProvider>
    );
}