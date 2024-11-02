import type { MetaFunction } from "@remix-run/react";
import {
  cashierStateConverter,
  orderConverter,
} from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRSubscription from "swr/subscription";
import logoMotion from "~/assets/cafeore_logo_motion.webm";
import { useOrderStat } from "~/components/functional/useOrderStat";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "珈琲・俺 1号店" }];
};

export default function CasherMini() {
  const [logoShown, setLogoShown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: orderState } = useSWRSubscription(
    ["global", "cashier-state"],
    documentSub({ converter: cashierStateConverter }),
  );
  const order = orderState?.edittingOrder;
  const submittedOrderId = orderState?.submittedOrderId;

  const { data: preOrder } = useSWRSubscription(
    ["orders", submittedOrderId ?? "none"],
    documentSub({ converter: orderConverter }),
  );
  const isOperational = useOrderStat();

  const orderId = useMemo(() => {
    if (logoShown) {
      return preOrder?.orderId;
    }
    return order?.orderId;
  }, [order, logoShown, preOrder]);

  useEffect(() => {
    setLogoShown(submittedOrderId != null || !isOperational);
  }, [submittedOrderId, isOperational]);

  useEffect(() => {
    if (!logoShown) {
      return;
    }
    videoRef.current?.play();
  }, [logoShown]);

  const textBelowLogo = useMemo(() => {
    if (submittedOrderId != null) {
      return "ご注文ありがとうございました";
    }
    if (!isOperational) {
      return "しばらくお待ちください";
    }
    return "　";
  }, [isOperational, submittedOrderId]);

  return (
    <>
      <div
        className={cn(
          "absolute top-0 left-0 z-10 h-screen w-screen transition-all",
          "bg-black",
          !logoShown && "opacity-0 duration-500",
        )}
      >
        <div
          className={cn(
            "h-screen w-screen",
            "flex flex-col items-center justify-center",
          )}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            src={logoMotion}
            className="h-3/5 w-full object-contain"
          />
          <h1
            className={cn(
              "text-center font-zen text-5xl text-[#b09860] opacity-0 duration-1000",
              logoShown && "opacity-100 duration-500",
            )}
          >
            {textBelowLogo}
          </h1>
        </div>
      </div>
      <div className="wrap flex h-full flex-col bg-theme px-[50px] pt-[40px]">
        <p className="pb-[50px] font-serif text-5xl text-white">
          No. <span className="text-6xl">{orderId}</span>
        </p>
        <div className="grid grid-cols-2 items-center justify-items-center p-[20px]">
          <div>
            <p className="font-serif text-4xl text-white">
              商品点数： {order?.items.length ?? 0} 点
            </p>
          </div>
          <div>
            <p className="font-serif text-4xl text-white">
              合計： {order?.billingAmount ?? 0} 円
            </p>
            <p className="font-serif text-4xl text-white">
              お釣り： {order?.getCharge()} 円
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
