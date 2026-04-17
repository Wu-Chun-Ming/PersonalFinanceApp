import { LLMProvider } from "@/contexts/LLMContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { OCRProvider } from "@/contexts/OCRContext";
import { ServerProvider } from "@/contexts/ServerContext";
import { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ServerProvider>
            <ModelProvider>
                <LLMProvider>
                    <OCRProvider>
                        {children}
                    </OCRProvider>
                </LLMProvider>
            </ModelProvider>
        </ServerProvider>
    );
}