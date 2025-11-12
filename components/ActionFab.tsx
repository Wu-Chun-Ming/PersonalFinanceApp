import React from 'react';

// Gluestack UI
import { Href, router } from 'expo-router';
import { Fab, FabIcon } from './ui/fab';

interface ActionFabProps {
    icon: React.ElementType;
    href: Href;
}

export const ActionFab = ({
    icon,
    href,
}: ActionFabProps) => {
    return (
        <Fab
            size="lg"
            placement="bottom right"
            onPress={() => router.push(href)}
        >
            <FabIcon as={icon} size='xl' />
        </Fab>
    );
};