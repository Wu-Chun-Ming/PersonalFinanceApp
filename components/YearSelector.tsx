import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { HStack } from "./ui/hstack";

interface YearSelectorProps {
    onYearChange: (year: number) => void;
    iconColor?: string;
}

const YearSelector = ({
    onYearChange,
    iconColor = 'black',
}: YearSelectorProps) => {
    const now = new Date();
    const [selectedLocalYear, setSelectedLocalYear] = useState(now.getFullYear());

    const changeYear = (year: number) => {
        setSelectedLocalYear(year);
        onYearChange?.(year);        // notify parent
    };

    return (
        <HStack className="justify-center items-center m-2">
            <TouchableOpacity onPress={() => changeYear(selectedLocalYear - 1)}>
                <AntDesign name="leftcircle" size={24} color={iconColor} style={{ paddingHorizontal: 10 }} />
            </TouchableOpacity>

            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Year {selectedLocalYear}
            </Text>

            <TouchableOpacity onPress={() => changeYear(selectedLocalYear + 1)}>
                <AntDesign name="rightcircle" size={24} color={iconColor} style={{ paddingHorizontal: 10 }} />
            </TouchableOpacity>
        </HStack>
    );
}

export default YearSelector;