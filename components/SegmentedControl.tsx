import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: Props<T>) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.text, isActive && styles.activeText]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    padding: 4,
    alignSelf: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeText: {
    color: '#111827',
  },
});

export default SegmentedControl;
