import { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { usePanelbear } from "./../hooks/panelbear";
import { PANELBEAR_SITE_ID } from '../constants'

import "../styles/main.css";

export default function App({ Component, pageProps }: AppProps) {
  if (PANELBEAR_SITE_ID) {
    usePanelbear(PANELBEAR_SITE_ID, {});
  }
  return (
    <ThemeProvider attribute="class" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
