import * as Panelbear from "@panelbear/panelbear-js";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const usePanelbear = (site, config = {}) => {
  const router = useRouter();

  useEffect(() => {
    if (!site) {
      console.log("skipping panelbear initialization");
      return;
    }

    Panelbear.load(site, { ...config, scriptSrc: '/bear.js' });

    // Trigger initial page view
    Panelbear.trackPageview();

    // Add on route change handler for client-side navigation
    const handleRouteChange = () => Panelbear.trackPageview();
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);
};
