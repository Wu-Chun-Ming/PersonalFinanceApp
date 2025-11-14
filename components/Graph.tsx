import { useFont } from "@shopify/react-native-skia";
import { CartesianChart, Line } from "victory-native";

interface GraphProps {
    data: Record<string | number, number>[];
    xKey: string;
    yKeys: [string, string][];
    graphMode: "day" | "year" | "month";
}

const Graph = ({
    data,
    xKey,
    yKeys,
    graphMode,
}: GraphProps) => {
    const inter = require('@/assets/inter-medium.ttf');
    const font = useFont(inter, 12);

    return (
        <CartesianChart
            data={data}
            xKey={xKey}
            xAxis={{
                font,
                tickCount: graphMode === 'day' ? 31 : 12,
                formatXLabel: (value) => {
                    switch (graphMode) {
                        case "day":
                            return value % 5 === 0 || value === 1 ? String(value) : "";
                        case "year":
                            return value % 2 === 0 ? String(value) : "";
                        default:
                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            return months[value - 1] || "";
                    }
                },
            }}
            yKeys={yKeys.map(([key]) => key)}
            axisOptions={{
                font,
                lineColor: "#d4d4d8",
            }}
            domainPadding={{ left: 20, right: 20, top: 10, }}
        >
            {({ points }) => (
                <>
                    {yKeys.map(([yKey, color], index) => (
                        <Line
                            key={`${yKey}-${index}`}
                            points={points[yKey]}
                            color={color}
                            strokeWidth={3}
                            animate={{ type: "timing", duration: 300 }}
                        />
                    ))}
                </>
            )}
        </CartesianChart>
    );
}

export default Graph;