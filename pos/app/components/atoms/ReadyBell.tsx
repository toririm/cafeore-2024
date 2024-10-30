import type { WithId } from "common/lib/typeguard";
import type { OrderEntity } from "common/models/order";
import { HiBell, HiBellAlert } from "react-icons/hi2";

type props = {
  order: WithId<OrderEntity>;
  changeReady: (ready: boolean) => void;
};

export const ReadyBell = ({ order, changeReady }: props) => {
  const isReady = order.readyAt != null;
  return isReady ? (
    <button type="button" onClick={() => changeReady(false)}>
      <HiBellAlert className="h-7 w-7 fill-orange-600" />
    </button>
  ) : (
    <button type="button" onClick={() => changeReady(true)}>
      <HiBell className="h-7 w-7 fill-stone-400" />
    </button>
  );
};
