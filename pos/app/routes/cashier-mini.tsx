import type { MetaFunction } from "@remix-run/react";
import {
  cashierStateConverter,
  orderConverter,
} from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRSubscription from "swr/subscription";
import bellSound from "~/assets/bell.mp3";
import logoSVG from "~/assets/cafeore.svg";
import logoMotion from "~/assets/cafeore_logo_motion.webm";
import { useOrderStat } from "~/components/functional/useOrderStat";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "珈琲・俺 1号店" }];
};

export default function CasherMini() {
  const [logoShown, setLogoShown] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundRef1 = useRef<HTMLAudioElement>(null);
  const soundRef2 = useRef<HTMLAudioElement>(null);
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

  useEffect(() => {
    if (submittedOrderId === null) {
      return;
    }
    soundRef1.current?.play();
    const timer = setTimeout(() => {
      soundRef2.current?.play();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [submittedOrderId]);

  const textBelowLogo = useMemo(() => {
    if (submittedOrderId != null) {
      return "ご注文ありがとうございました";
    }
    if (!isOperational) {
      return "しばらくお待ちください";
    }
    return "　ご来店ありがとうございます";
  }, [isOperational, submittedOrderId]);

  const charge = useMemo(() => order?.getCharge() ?? 0, [order]);

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
            className="h-3/5 w-full flex-none object-contain"
          />
          <h1
            className={cn(
              "text-center font-zen text-6xl text-[#b09860] opacity-0 duration-1000 ease-in-out",
              logoShown && "mt-5 text-5xl opacity-100 duration-500",
            )}
          >
            {textBelowLogo}
          </h1>
        </div>
      </div>
      <div
        className={cn(
          "absolute top-0 left-0 z-0 h-screen w-screen",
          "bg-gradient-to-br from-[#A877D9] via-[#E665C5] to-[#E67651]",
        )}
      >
        <button type="button" className="absolute top-0 left-0 h-24 w-60" />
        <img src={logoSVG} alt="" className="absolute h-screen w-screen p-28" />
        <div className="wrap flex flex-col px-[50px] pt-[40px]">
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
                お釣り： {Math.max(charge, 0)} 円
              </p>
            </div>
          </div>
        </div>
      </div>
      <audio src={bellSound} ref={soundRef1}>
        <track kind="captions" />
      </audio>
      <audio src={bellSound} ref={soundRef2}>
        <track kind="captions" />
      </audio>
    </>
  );
}
