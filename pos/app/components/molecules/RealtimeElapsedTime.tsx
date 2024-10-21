import type { WithId } from "common/lib/typeguard";
import { cn } from "common/lib/utils";
import type { OrderEntity } from "common/models/order";
import dayjs from "dayjs";
import { useCurrentTime } from "../functional/useCurrentTime";

export const RealtimeElapsedTime = ({
  order,
}: { order: WithId<OrderEntity> }) => {
  const currentTime = useCurrentTime(1000);
  const createdAt = dayjs(order.createdAt);
  const getDiffTime = (order: WithId<OrderEntity>) => {
    const now = currentTime;
    return dayjs(dayjs(now).diff(dayjs(order.createdAt)));
  };
  const diffTime = getDiffTime(order);

  return (
    <div
      className={cn(
        "rounded-md",
        dayjs(currentTime).isAfter(createdAt.add(15, "minutes")) &&
          "bg-red-500 text-white",
        "px-2",
      )}
    >
      <div>経過時間 {diffTime.format("m:ss")}</div>
    </div>
  );
};
