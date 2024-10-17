import type { WithId } from "common/lib/typeguard";
import type { OrderEntity } from "common/models/order";
import dayjs from "dayjs";
import { useCurrentTime } from "../functional/useCurrentTime";

export const RealtimeElapsedTime = ({
  order,
}: { order: WithId<OrderEntity> }) => {
  const currentTime = useCurrentTime(5000);
  const diffTime = (order: OrderEntity) => {
    const now = currentTime;
    return dayjs(dayjs(now).diff(dayjs(order.createdAt))).format("m:ss");
  };

  return <div>経過時間：{diffTime(order)}</div>;
};
