import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

interface StoreProviderProps {
  children: ReactNode;
}

// This component sets up the Redux store and provides it to the application
export const StoreProvider = ({ children }: StoreProviderProps) => {
  const store = makeStore();

  return <Provider store={store}>{children}</Provider>;
};
