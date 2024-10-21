import { Outlet } from "@remix-run/react";
import { OnlineStatus, useOnlineStatus } from "~/components/online-status";

export default function BaseHeader() {
  const isOnline = useOnlineStatus();

  if (!isOnline) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-4xl">⛔オフライン</h1>
          <p className="text-xl">
            インターネット接続が切断されています。
            <br />
            接続が回復するまでお待ちください。
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      {/* TODO(toririm): デザインが微妙にダサいので何とかする。
      この手のコンポーネントは必要だが別にこの形でなくてもいい */}
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
