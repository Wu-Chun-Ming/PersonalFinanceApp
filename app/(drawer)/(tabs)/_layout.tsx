import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, Tabs, useNavigation } from 'expo-router';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Menu, MenuItem, MenuItemLabel } from '@/components/ui/menu';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';

// Custom import
import AppDropdown from '@/components/AppDropdown';
import FormGroup from '@/components/FormGroup';
import { useImport } from '@/hooks/useBackup';
import useShowToast from '@/hooks/useShowToast';
import { exportAllData } from '@/services/backupService';
import { FileType } from '@/types';

export default function TabLayout() {
  const navigation = useNavigation();
  const showToast = useShowToast();
  const importMutation = useImport();
  const [fileType, setFileType] = useState<FileType>('json');
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'export' | 'import'>('export');

  const handleExportTransactions = async (fileType: FileType) => {
    try {
      const response = await exportAllData(fileType);
      const { success, messages } = response;
      const actionType = success ? 'success' : 'info';
      showToast({ action: actionType, messages: messages });
    } catch (error) {
      showToast({ action: 'error', messages: (error as Error).message });
    }
  };

  const handleImportTransactions = (fileType: FileType) => {
    importMutation.mutate(fileType);
  };

  const renderMoreOptions = () => {
    return (
      <View>
        <Menu
          offset={-30}
          trigger={({ ...triggerProps }) => {
            return (
              <Pressable {...triggerProps}>
                <Feather
                  name='more-vertical'
                  size={25}
                  color='white'
                  style={{ marginRight: 10 }}
                />
              </Pressable>
            );
          }}
        >
          <MenuItem
            key='Export'
            textValue='Export Data'
            onPress={() => {
              setActionType('export');
              setModalVisible(true);
            }}
          >
            <Feather
              name='share'
              size={20}
              color='black'
            />
            <MenuItemLabel
              size='md'
              className='ml-2'
            >
              Export Data
            </MenuItemLabel>
          </MenuItem>
          <MenuItem
            key='import'
            textValue='Import Data'
            onPress={() => {
              setActionType('import');
              setModalVisible(true);
            }}
          >
            <Feather
              name='file-plus'
              size={20}
              color='black'
            />
            <MenuItemLabel
              size='md'
              className='ml-2'
            >
              Import Data
            </MenuItemLabel>
          </MenuItem>
          <MenuItem
            key='notifications'
            textValue='Notifications'
            onPress={() => {
              router.navigate(`/notification/listing`);
            }}
          >
            <Ionicons
              name='notifications-outline'
              size={20}
              color='black'
            />
            <MenuItemLabel
              size='md'
              className='ml-2'
            >
              Notifications
            </MenuItemLabel>
          </MenuItem>
          <MenuItem
            key='settings'
            textValue='Settings'
            onPress={() => {
              router.navigate(`/(stack)/settings`);
            }}
          >
            <Feather
              name='settings'
              size={20}
              color='black'
            />
            <MenuItemLabel
              size='md'
              className='ml-2'
            >
              Settings
            </MenuItemLabel>
          </MenuItem>
        </Menu>

        {/* Export/Import Data Modal */}
        <Modal
          isOpen={modalVisible}
          onClose={() => {
            setModalVisible(false);
          }}
          size='md'
        >
          <ModalBackdrop />
          <ModalContent>
            <ModalHeader>
              <Heading>
                {actionType === 'import' ? 'Import Data' : 'Export Data'}
              </Heading>
            </ModalHeader>
            <ModalBody>
              <FormGroup
                label='Select File Type'
                isRequired={true}
              >
                <AppDropdown
                  data={[
                    { label: '.json', value: 'json' },
                    { label: '.csv', value: 'csv' },
                  ]}
                  value={fileType}
                  onChange={(value) => setFileType(value)}
                  style={{
                    padding: 5,
                    paddingLeft: 10,
                    borderWidth: 1,
                  }}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <HStack
                space='md'
                className='justify-end'
              >
                {/* Cancel button */}
                <Button
                  variant='solid'
                  action='secondary'
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
                  <ButtonText>
                    Select {actionType === 'import' ? 'file' : 'folder'}
                  </ButtonText>
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </View>
    );
  };

  const renderReminderIcon = () => (
    <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <MaterialIcons
        name='notifications'
        size={25}
        color='white'
        style={{
          marginLeft: 10,
        }}
      />
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
      <Tabs.Screen
        name='goals'
        options={{
          title: 'Goals',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'trophy' : 'trophy-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='transactions'
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='budgets'
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name='more'
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
