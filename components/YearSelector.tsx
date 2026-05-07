import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

// Gluestack UI
import { HStack } from './ui/hstack';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
} from './ui/select';

interface YearSelectorProps {
  onYearChange: (year: number) => void;
  iconColor?: string;
  yearRange?: number[];
}

const YearSelector = ({
  onYearChange,
  iconColor = 'black',
  yearRange = [],
}: YearSelectorProps) => {
  const now = new Date();
  const hasYearRange = yearRange.length > 0;

  const [selectedLocalYear, setSelectedLocalYear] = useState(
    hasYearRange ? yearRange[yearRange.length - 1] : now.getFullYear(),
  );
  const yearIndex = hasYearRange
    ? Math.max(0, yearRange.indexOf(selectedLocalYear))
    : 0;
  const previous =
    hasYearRange && yearIndex > 0
      ? yearRange[yearIndex - 1]
      : selectedLocalYear - 1;
  const next =
    hasYearRange && yearIndex < yearRange.length - 1
      ? yearRange[yearIndex + 1]
      : selectedLocalYear + 1;
  const isAtStart = hasYearRange && yearIndex === 0;
  const isAtEnd = hasYearRange && yearIndex === yearRange.length - 1;

  const changeYear = (year: number) => {
    setSelectedLocalYear(year);
    onYearChange?.(year); // notify parent
  };
  const onValueChange = (year: string) => changeYear(Number(year));

  let displayYears: number[] = [];
  if (hasYearRange) {
    const minYear = Math.min(...yearRange);
    const maxYear = Math.max(...yearRange);
    displayYears = Array.from(
      { length: maxYear - minYear + 1 },
      (_, i) => minYear + i,
    );
  } else {
    displayYears = Array.from({ length: 7 }, (_, i) => {
      return now.getFullYear() - 3 + i;
    });
    yearRange = [now.getFullYear()]; // Default to current year if no range provided
  }
  const isValidYear = (year: number) => yearRange.includes(year);

  return (
    <HStack className='justify-center items-center m-2'>
      <TouchableOpacity
        disabled={!hasYearRange || isAtStart}
        onPress={() => changeYear(previous)}
      >
        <AntDesign
          name='left-circle'
          size={24}
          color={!hasYearRange || isAtStart ? 'gray' : iconColor}
          style={{ paddingHorizontal: 10 }}
        />
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginRight: 5 }}>
        Year
      </Text>
      <Select
        selectedValue={selectedLocalYear.toString()}
        onValueChange={onValueChange}
      >
        <SelectTrigger
          variant='rounded'
          size='md'
        >
          <SelectInput
            className='font-bold'
            value={selectedLocalYear.toString()}
          />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent style={{ maxHeight: '50%' }}>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <SelectScrollView>
              {displayYears.map((year) => {
                const disabled = !isValidYear(year);

                return (
                  <SelectItem
                    key={year}
                    label={`Year ${year}`}
                    value={year.toString()}
                    isDisabled={disabled}
                    className={disabled ? 'opacity-50' : ''}
                  />
                );
              })}
            </SelectScrollView>
          </SelectContent>
        </SelectPortal>
      </Select>

      <TouchableOpacity
        disabled={!hasYearRange || isAtEnd}
        onPress={() => changeYear(next)}
      >
        <AntDesign
          name='right-circle'
          size={24}
          color={!hasYearRange || isAtEnd ? 'gray' : iconColor}
          style={{ paddingHorizontal: 10 }}
        />
      </TouchableOpacity>
    </HStack>
  );
};

export default YearSelector;
