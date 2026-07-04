"use client";

import { useEffect } from "react";
import { initMixpanel } from "../lib/mixpanelClient";

export default function MixpanelProvider({ children }) {
  useEffect(() => {
    initMixpanel(); // Initialize Mixpanel
  }, []);

  return <>{children}</>;
}
