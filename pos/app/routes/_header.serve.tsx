import { parseWithZod } from "@conform-to/zod";
import {
  type ClientActionFunction,
  type MetaFunction,
  useSubmit,
} from "@remix-run/react";
import { orderConverter } from "common/firebase-utils/converter";
import { collectionSub } from "common/firebase-utils/subscription";
import { stringToJSONSchema } from "common/lib/custom-zod";
import { type2label } from "common/models/item";
import { OrderEntity, orderSchema } from "common/models/order";
import { orderRepository } from "common/repositories/order";
import dayjs from "dayjs";
import { orderBy } from "firebase/firestore";
import { useCallback } from "react";
import { toast } from "sonner";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { RealtimeElapsedTime } from "~/components/molecules/RealtimeElapsedTime";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "提供画面" }];
};

export const clientLoader = async () => {
  const orders = await orderRepository.findAll();
  return { orders };
};

export default function Serve() {
  const submit = useSubmit();
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }, orderBy("orderId", "asc")),
  );

  const unserved = orders?.reduce((acc, cur) => {
    if (cur.servedAt == null) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const submitPayload = useCallback(
    (servedOrder: OrderEntity) => {
      const order = servedOrder.clone();
      order.beServed();
      submit(
        { servedOrder: JSON.stringify(order.toOrder()) },
        { method: "PUT" },
      );
    },
    [submit],
  );

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">提供</h1>
        <p>提供待ちオーダー数：{unserved}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {orders?.map(
          (order) =>
            order.servedAt === null && (
              <div key={order.id}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{`No. ${order.orderId}`}</CardTitle>
                      <CardTitle className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-500">
                        {order.items.length}
                      </CardTitle>
                      <div className="grid">
                        <div className="px-2 text-right">
                          {dayjs(order.createdAt).format("H:mm:ss")}
                        </div>
                        <RealtimeElapsedTime order={order} />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {order.items.map((item, idx) => (
                        <div key={`${idx}-${item.id}`}>
                          <Card
                            className={cn(
                              "pt-6",
                              item.type === "milk" && "bg-yellow-200",
                              item.type === "hotOre" && "bg-orange-300",
                              item.type === "iceOre" && "bg-sky-300",
                            )}
                          >
                            <CardContent>
                              <h3>{item.name}</h3>
                              <p className="text-sm text-stone-400">
                                {type2label[item.type]}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                    <p>{order.orderReady}</p>
                    {order?.description && (
                      <div className="mt-4 flex rounded-md bg-gray-200 p-1">
                        <div className="flex-none">備考：</div>
                        <div>{order?.description}</div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-between">
                      <Button
                        onClick={() => {
                          const now = new Date();
                          submitPayload(order);
                          toast(`提供完了 No.${order.orderId}`, {
                            description: `${dayjs(now).format("H:mm:ss")}`,
                            action: {
                              label: "取消",
                              onClick: () => console.log("Undo"),
                            },
                          });
                        }}
                      >
                        提供
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ),
        )}
      </div>
    </div>
  );
}

export const clientAction: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const schema = z.object({
    servedOrder: stringToJSONSchema.pipe(orderSchema),
  });
  const submission = parseWithZod(formData, {
    schema,
  });
  if (submission.status !== "success") {
    console.error(submission.error);
    return submission.reply();
  }

  const { servedOrder } = submission.value;
  const order = OrderEntity.fromOrder(servedOrder);

  const savedOrder = await orderRepository.save(order);

  console.log("savedOrder", savedOrder);

  return new Response("ok");
};
