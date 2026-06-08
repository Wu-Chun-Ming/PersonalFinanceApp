import React from 'react';
import { Href, router } from 'expo-router';

// Gluestack UI
import { Fab, FabIcon } from './ui/fab';

interface ActionFabProps {
  icon: React.ElementType;
  href: Href;
  style?: React.ComponentProps<typeof Fab>['style'];
}

const ActionFab = ({ icon, href, style }: ActionFabProps) => {
  return (
    <Fab
      size='lg'
      placement='bottom right'
      onPress={() => router.push(href)}
      style={style}
    >
      <FabIcon
        as={icon}
        size='xl'
      />
    </Fab>
  );
};

export default ActionFab;
