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
    <div className="wrap flex h-full flex-col bg-theme px-[50px] pt-[40px]">
      <p className="pb-[50px] font-serif text-5xl text-white">
        No. <span className="font-serif text-6xl">{order?.orderId}</span>
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
            お釣り： {(order?.received ?? 0) - (order?.billingAmount ?? 0)} 円
            {/* お釣り： {order?.getCharge() ?? 0} 円 */}
          </p>
        </div>
      </div>
    </div>
  );
}
