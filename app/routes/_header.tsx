import { Outlet } from "@remix-run/react";

import { OnlineStatus } from "~/components/online-status";

export default function BaseHeader() {
  return (
    <div>
      <header className="bg-gray-800 p-4 text-white">
        <h1 className="text-3xl">かふぇおれPOS 2024</h1>
        <OnlineStatus />
      </header>
      <Outlet />
    </div>
  );
}

// cacher.tsx -> _header.cacher.tsx と変更することで
// cacher.tsx ページに対して上記ヘッダーを付与することができる
// 子となったcacher.tsxの中身が <Outlet /> に入るイメージ
