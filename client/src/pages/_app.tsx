import { StoreProvider } from '../store/StoreProvider';
import type { AppProps } from 'next/app';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  );
}

export default MyApp;
