import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Tabs, useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@/components/ui/modal';

// Custom import
import styles from '@/app/styles';
import FormGroup from '@/components/FormGroup';
import useShowToast from '@/hooks/useShowToast';
import { useImportTransactions } from '@/hooks/useTransactions';
import { exportAllTransactions } from '@/services/transactions';

export default function TabLayout() {
  const navigation = useNavigation();
  const showToast = useShowToast();
  const importMutation = useImportTransactions();
  const [fileType, setFileType] = useState<'json' | 'csv'>('json');
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'export' | 'import'>('export');

  const handleExportTransactions = async (fileType: 'json' | 'csv') => {
    try {
      const response = await exportAllTransactions(fileType);
      const { success, messages } = response;
      const actionType = success ? 'success' : 'info';
      showToast({ action: actionType, messages: messages });
    } catch (error) {
      showToast({ action: 'error', messages: (error as Error).message });
    }
  };

  const handleImportTransactions = (fileType: 'json' | 'csv') => {
    importMutation.mutate(fileType);
  };

  const renderMoreOptions = () => {
    return (
      <View>
        <Menu>
          <MenuTrigger>
            <Feather name="more-vertical" size={25} color="white" style={{ marginRight: 10 }} />
          </MenuTrigger>
          <MenuOptions customStyles={{
            optionsContainer: {
              width: 'auto',
            },
            optionText: styles.text,
            optionWrapper: {
              padding: 15,
            },
          }}>
            <MenuOption
              onSelect={() => {
                setActionType('export');
                setModalVisible(true);
              }}
              text="Export All Transactions"
            />
            <MenuOption
              onSelect={() => {
                setActionType('import');
                setModalVisible(true);
              }}
              text="Import Transactions"
            />
          </MenuOptions>
        </Menu>

        {/* Export/Import Transactions Modal */}
        <Modal
          isOpen={modalVisible}
          onClose={() => {
            setModalVisible(false);
          }}
          size="md"
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading>{actionType === 'import' ? 'Import Transactions' : 'Export Transactions'}</Heading>
            </ModalHeader>
            <ModalBody>
              <FormGroup
                label='Select File Type'
                isRequired={true}
              >
                <Dropdown
                  data={[
                    { label: '.json', value: 'json' },
                    { label: '.csv', value: 'csv' },
                  ]}
                  labelField="label"
                  valueField="value"
                  value={fileType}
                  onChange={(item) => setFileType(item.value)}
                  style={{
                    padding: 5,
                    paddingLeft: 10,
                    borderWidth: 1,
                  }}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <HStack space='md' className='justify-end'>
                {/* Cancel button */}
                <Button
                  variant="solid"
                  action="secondary"
                  onPress={() => {
                    setModalVisible(false);
                  }}
                >
                  <ButtonText>Cancel</ButtonText>
                </Button>
                {/* Select folder button */}
                <Button
                  onPress={() => {
                    setModalVisible(false);
                    if (actionType === 'import') {
                      handleImportTransactions(fileType);
                    } else {
                      handleExportTransactions(fileType);
                    }
                  }}
                >
                  <ButtonText>Select {actionType === 'import' ? 'file' : 'folder'}</ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </View>
    )
  };

  const renderReminderIcon = () => (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <MaterialIcons name="notifications" size={25} color="white" style={{
        marginLeft: 10,
      }} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerLeft: renderReminderIcon,
        headerRight: renderMoreOptions,
        tabBarActiveTintColor: '#ffd33d',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen name="goals" options={{
        title: 'Goals',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'flag' : 'flag-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="transactions" options={{
        title: 'Transactions',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'wallet' : 'wallet-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="budgets" options={{
        title: 'Budgets',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'funnel' : 'funnel-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24} />
        ),
      }} />
    </Tabs>
  );
}
