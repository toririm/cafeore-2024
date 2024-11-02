import { itemSource } from "common/data/items";
import {
  cashierStateConverter,
  orderConverter,
} from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import useSWRSubscription from "swr/subscription";
import { BASE_CLIENT_URL } from "./_header.serve";

export default function CasherMini() {
  const items = itemSource;
  const [qrShowing, setQrShowing] = useState(false);
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

  const url = `${BASE_CLIENT_URL}/welcome?id=${submittedOrderId}`;

  const orderId = useMemo(() => {
    if (qrShowing) {
      return preOrder?.orderId;
    }
    return order?.orderId;
  }, [order, qrShowing, preOrder]);

  useEffect(() => {
    setQrShowing(submittedOrderId != null);
  }, [submittedOrderId]);

  return (
    <div className="wrap flex h-full flex-col px-[35px] pt-[25px]">
      <div className="pb-[50px]">
        <p className="font-serif text-4xl">No. {orderId}</p>
      </div>
      <div className="grid grid-cols-2 items-center justify-items-center">
        <div>
          <p className="sans-serif text-base">
            商品点数： {order?.items.length ?? 0} 点
          </p>
          <p className="sans-serif text-base">小計： {order?.total ?? 0} 円</p>
          <p className="sans-serif text-base">
            割引： {order?.discount ?? 0} 円
          </p>
        </div>
        <div>
          <p className="sans-serif text-base">
            合計： {order?.billingAmount ?? 0} 円
          </p>
          <p className="sans-serif text-base">
            お預り： {order?.received ?? 0} 円
          </p>
          <p className="sans-serif text-base">
            お釣り： {order?.getCharge()} 円
          </p>
        </div>
      </div>
      <div>{qrShowing && <QRCodeSVG value={url} />}</div>
    </div>
  );
}
