import { useContext } from 'react';

import ServerContext from '@/contexts/ServerContext';

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used inside a ServerProvider');
  }
  return context;
};
