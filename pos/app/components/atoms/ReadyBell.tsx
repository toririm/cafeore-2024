import type { WithId } from "common/lib/typeguard";
import type { OrderEntity } from "common/models/order";
import { HiBell, HiBellAlert } from "react-icons/hi2";
import { cn } from "~/lib/utils";

type props = {
  order: WithId<OrderEntity>;
  changeReady: (ready: boolean) => void;
};

export const ReadyBell = ({ order, changeReady }: props) => {
  const isReady = order.readyAt != null;
  return (
    <button
      type="button"
      onClick={() => changeReady(!isReady)}
      className="flex w-24 flex-col items-center"
    >
      {isReady ? (
        <HiBellAlert className="h-7 w-7 fill-orange-600" />
      ) : (
        <HiBell className="h-7 w-7 fill-stone-400" />
      )}
      <span
        className={cn(
          "text-xs",
          isReady ? "text-orange-600" : "text-stone-400",
        )}
      >
        {isReady ? "呼び出し中" : "呼び出しボタン"}
      </span>
    </button>
  );
};
