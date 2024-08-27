import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

export const useOnlineStatus = () => {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
};

export const OnlineStatus = () => {
  const online = useOnlineStatus();
  return online ? <p>✅オンライン</p> : <p>⛔オフライン</p>;
};
