import type { MetaFunction } from "@remix-run/react";
import {
  cashierStateConverter,
  orderConverter,
} from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRSubscription from "swr/subscription";
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

  /**
   * BAD: useEffect内でstateを更新している
   * https://ja.react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes
   */
  useEffect(() => {
    setLogoShown(submittedOrderId != null || !isOperational);
  }, [submittedOrderId, isOperational]);

  /**
   * OK
   */
  useEffect(() => {
    if (!logoShown) {
      return;
    }
    videoRef.current?.play();
  }, [logoShown]);

  /**
   * OK
   */
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
        <img
          src={logoSVG}
          alt=""
          className="absolute bottom-10 h-screen w-screen p-40"
        />
        <div className="flex h-screen w-screen flex-col px-28 py-10 font-noto">
          <p className="flex-none pb-16 font-medium text-5xl text-white">
            No. <span className="font-semibold text-7xl">{orderId}</span>
          </p>
          <div className="flex h-4/5 flex-col justify-between">
            <div className="">
              {order?.items.map((item, idx) => {
                return (
                  <div
                    key={`${idx}-${item.id}`}
                    className="flex items-center justify-between pb-7"
                  >
                    <p className="flex-none pr-14 font-bold text-6xl text-white">
                      {idx + 1}
                    </p>
                    <p className="flex-1 font-bold text-5xl text-white">
                      {item.name}
                    </p>
                    <p className="flex-none font-bold text-5xl text-white">
                      {item.price} 円
                    </p>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pb-7">
                {(order?.discount ?? 0) > 0 && (
                  <>
                    <p className="flex-none pr-14 font-bold text-3xl text-white">
                      割引
                    </p>
                    <p className="font-bold text-4xl text-white">
                      -{order?.discount} 円
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="">
              <div className="mb-7 h-1 w-full bg-white" />
              <div className="flex items-center justify-between pb-7">
                <p className="flex-none pr-14 font-bold text-5xl text-white">
                  合計
                </p>
                <p className="font-bold text-5xl text-white">
                  {order?.billingAmount} 円
                </p>
              </div>
              <div className="flex h-14 items-center justify-between pb-7">
                {(order?.received ?? 0) > 0 && (
                  <>
                    <p className="flex-none pr-14 font-bold text-4xl text-white">
                      お預かり
                    </p>
                    <p className="font-bold text-4xl text-white">
                      {order?.received} 円
                    </p>
                  </>
                )}
              </div>
              <div className="flex h-12 items-center justify-between pb-7">
                {charge >= 0 && (
                  <>
                    <p className="flex-none pr-14 font-bold text-4xl text-white">
                      おつり
                    </p>
                    <p className="font-bold text-4xl text-white">{charge} 円</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
