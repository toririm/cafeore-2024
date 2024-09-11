import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { useOnlineStatus } from "./components/online-status";

import "./tailwind.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">⛔オフライン</h1>
          <p className="text-xl">
            インターネット接続が切断されています。
            <br />
            接続が回復するまでお待ちください。
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
