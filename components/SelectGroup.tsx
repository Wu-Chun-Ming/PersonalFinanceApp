import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Gluestack UI
import { ChevronDownIcon } from '@/components/ui/icon';
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectPortal,
    SelectScrollView,
    SelectTrigger
} from '@/components/ui/select';

const SelectGroup = ({
    initialLabel,
    selectedValue,
    onValueChange,
    isDisabled,
    placeholder = 'Select option',
    scrollViewStyle,
    children,
}: any) => {
    const insets = useSafeAreaInsets();

    return (
        <Select
            initialLabel={initialLabel}
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            isDisabled={isDisabled}
        >
            <SelectTrigger variant='outline' size='md'>
                <SelectInput placeholder={placeholder} className='flex-1' />
                <SelectIcon className='mr-3' as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
                <SelectBackdrop />
                <SelectContent style={{
                    paddingBottom: insets.bottom,
                }}>
                    <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectScrollView
                        showsVerticalScrollIndicator={true}
                        style={scrollViewStyle}
                    >
                        {children}
                    </SelectScrollView>
                </SelectContent>
            </SelectPortal>
        </Select>
    );
};

export default SelectGroup;
