import type React from 'react';
import { Dropdown } from 'react-native-element-dropdown';

type DropdownValue = string | number;

export interface DropdownOption<T extends DropdownValue = DropdownValue> {
  label: string;
  value: T;
}

type BaseDropdownProps = React.ComponentProps<typeof Dropdown>;

interface AppDropdownProps<
  T extends DropdownValue = DropdownValue,
> extends Omit<
  BaseDropdownProps,
  'data' | 'value' | 'onChange' | 'labelField' | 'valueField'
> {
  data: DropdownOption<T>[];
  value?: T | null;
  onChange: (value: T, item: DropdownOption<T>) => void;
}

const AppDropdown = <T extends DropdownValue = DropdownValue>({
  data,
  value,
  onChange,
  ...rest
}: AppDropdownProps<T>) => {
  return (
    <Dropdown
      data={data}
      labelField='label'
      valueField='value'
      value={value}
      onChange={(item) => onChange(item.value as T, item as DropdownOption<T>)}
      {...rest}
    />
  );
};

export default AppDropdown;
