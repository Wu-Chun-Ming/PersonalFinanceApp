import styles from "@/app/styles";
import { useFont } from "@shopify/react-native-skia";
import { Text, View } from 'react-native';
import { BarGroup, CartesianChart } from "victory-native";
import { Box } from "./ui/box";
import { HStack } from "./ui/hstack";

interface BarChartProps {
    data: Record<string | number, number>[];
    xKey: string;
    yKeys: [string, string][];
    legends?: [string, string][];
}

const BarChart = ({
    data,
    xKey,
    yKeys,
    legends,
}: BarChartProps) => {
    const inter = require('@/assets/inter-medium.ttf');
    const font = useFont(inter, 12);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <View style={{
            flex: 1,
            width: '95%',
        }}>
            <CartesianChart
                data={data}
                xKey={xKey}
                xAxis={{
                    font,
                    tickCount: 12,
                    formatXLabel: (value) => {
                        return monthNames[(value - 1) % 12];
                    },
                }}
                yKeys={yKeys.map(([key]) => key)}
                axisOptions={{
                    font,
                    lineColor: "#d4d4d8",
                }}
                domainPadding={{ left: 20, right: 20, top: 20, }}
            >
                {({ points, chartBounds }) => (
                    // Bar Group
                    <BarGroup
                        chartBounds={chartBounds}
                        betweenGroupPadding={0.2}
                        withinGroupPadding={0.1}
                    >
                        {yKeys.map(([yKey, color], index) => (
                            <BarGroup.Bar
                                key={`${yKey}-${index}`}
                                points={points[yKey]}
                                color={color}
                            />
                        ))}
                    </BarGroup>
                )}
            </CartesianChart>
            {/* Legends */}
            <HStack className='justify-center items-center'>
                {legends && legends.map(([label, color], index) => (
                    <HStack
                        key={`${label}-${index}`}
                        className='items-center'
                    >
                        <Box
                            className="w-5 h-5 rounded"
                            style={{
                                backgroundColor: color,
                            }}
                        />
                        <Text style={[styles.text, {
                            marginHorizontal: 5
                        }]}>{label}</Text>
                    </HStack>
                ))}
            </HStack>
        </View>
    );
};

export default BarChart;