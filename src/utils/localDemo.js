export function isLocalDemoOrigin(location = window.location) {
  const port = process.env.REACT_APP_LOCAL_DEMO_PORT || "3014";
  return process.env.NODE_ENV === "development" && location.port === port &&
    ["localhost", "127.0.0.1"].includes(location.hostname);
}

export const controlCentreEnabled = () => process.env.REACT_APP_CONTROL_CENTRE_ENABLED === "true";
