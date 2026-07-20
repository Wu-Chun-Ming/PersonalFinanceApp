import { useModel } from './useModel';
import { usePreferences } from './usePreferences';
import { useServer } from './useServer';

export const useSettings = () => {
  const model = useModel();
  const server = useServer();
  const preferences = usePreferences();

  return {
    ...model,
    ...server,
    preferences,
  };
};
