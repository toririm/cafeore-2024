import { itemSource } from "common/data/items";
import { cashierStateConverter } from "common/firebase-utils/converter";
import { documentSub } from "common/firebase-utils/subscription";
import useSWRSubscription from "swr/subscription";

export default function CasherMini() {
  const items = itemSource;
  const { data: orderState } = useSWRSubscription(
    ["global", "cashier-state"],
    documentSub({ converter: cashierStateConverter }),
  );
  const order = orderState?.edittingOrder;

  return (
    <div className="wrap flex h-full flex-col px-[35px] pt-[25px]">
      <div className="pb-[50px]">
        <p className="font-serif text-4xl">No. {order?.orderId}</p>
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
            {/* お釣り： {(order?.received ?? 0) - (order?.billingAmount ?? 0)} 円 */}
            お釣り： {order?.getCharge() ?? 0} 円
          </p>
        </div>
      </div>
    </div>
  );
}
