import {
  cashierStateConverter,
  orderConverter,
} from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRSubscription from "swr/subscription";
import logoMotion from "~/assets/cafeore_logo_motion.webm";
import { cn } from "~/lib/utils";

export default function CasherMini() {
  const [thanksShowing, setThanksShowing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: orderState } = useSWRSubscription(
    ["global", "cashier-state"],
    documentSub({ converter: cashierStateConverter }),
  );
  const order = orderState?.edittingOrder;
  const [charge, setCharge] = useState(0);
  const submittedOrderId = orderState?.submittedOrderId;

  const { data: preOrder } = useSWRSubscription(
    ["orders", submittedOrderId ?? "none"],
    documentSub({ converter: orderConverter }),
  );

  const orderId = useMemo(() => {
    if (thanksShowing) {
      return preOrder?.orderId;
    }
    return order?.orderId;
  }, [order, thanksShowing, preOrder]);

  useEffect(() => {
    setThanksShowing(submittedOrderId != null);
  }, [submittedOrderId]);

  useEffect(() => {
    if (!thanksShowing) {
      return;
    }
    videoRef.current?.play();
  }, [thanksShowing]);

  useEffect(() => {
    setCharge(order?.received - order?.billingAmount);
  }, [order?.received, order?.billingAmount]);

  return (
    <>
      <div
        className={cn(
          "absolute top-0 left-0 z-10 h-screen w-screen transition-all duration-300",
          "flex items-center justify-center bg-black",
          "grid columns-4",
          !thanksShowing && "opacity-0",
        )}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          src={logoMotion}
          className="h-3/5 w-full object-contain"
        />
      </div>
      <div className="wrap flex h-screen flex-col bg-theme px-[50px] pt-[40px]">
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
              お釣り： {charge > 0 ? charge : 0} 円
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
