import mixpanel from "mixpanel-browser";

// const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

const MIXPANEL_TOKEN = "0c148ce055d32e1a5780196cb8f3721a";

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn("Mixpanel token is missing! Check your .env file.");
    return;
  }

  mixpanel.init(MIXPANEL_TOKEN, { autocapture: true });
};
