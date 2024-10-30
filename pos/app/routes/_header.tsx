import { Outlet } from "@remix-run/react";
import { useOnlineStatus } from "~/components/functional/useOnlineStatus";
import { useOrderStat } from "~/components/functional/useOrderStat";
import { cn } from "~/lib/utils";

export default function BaseHeader() {
  const isOnline = useOnlineStatus();
  const isOperational = useOrderStat();

  return (
    <div>
      <header
        className={cn(
          "sticky top-0 z-10 h-2",
          isOnline && "bg-green-600",
          !isOnline && "h-min bg-red-700",
          !isOperational && "h-min bg-violet-600",
        )}
      >
        {!isOnline && (
          <div className="p-2 text-center text-white">オフライン</div>
        )}
        {!isOperational && (
          <div className="p-2 text-center text-white">オーダーストップ中</div>
        )}
      </header>
      <Outlet />
    </div>
  );
}

// cacher.tsx -> _header.cacher.tsx と変更することで
// cacher.tsx ページに対して上記ヘッダーを付与することができる
// 子となったcacher.tsxの中身が <Outlet /> に入るイメージ
