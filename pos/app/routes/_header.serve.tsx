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
import { OrderEntity, OrderStatus, orderSchema } from "common/models/order";
import { orderRepository } from "common/repositories/order";
import { orderBy } from "firebase/firestore";
import { useCallback } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
    if (cur.status !== OrderStatus.Served) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const submitPayload = useCallback(
    (order: OrderEntity) => {
      const updatedOrder = order.clone();
      if (order.status === OrderStatus.Preparing) {
        updatedOrder.beReady();
        submit(
          { readyOrder: JSON.stringify(updatedOrder.toOrder()) },
          { method: "PUT" },
        );
      } else if (order.status === OrderStatus.Ready) {
        updatedOrder.beServed();
        submit(
          { servedOrder: JSON.stringify(updatedOrder.toOrder()) },
          { method: "PUT" },
        );
      }
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
      {orders?.filter(order => order.status !== OrderStatus.Served).map(
    (order) => (
      <div key={order.id}>
        <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{`No. ${order.orderId}`}</CardTitle>
                      <CardTitle className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-stone-500">
                        {order.items.length}
                      </CardTitle>
                      <p>{order.createdAt.toLocaleTimeString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {order.items.map((item, idx) => (
                        <div key={`${idx}-${item.id}`}>
                          <Card>
                            <CardContent
                              className={cn(
                                "pt-6",
                                item.type === "milk" && "bg-yellow-200",
                                item.type === "hotOre" && "bg-orange-300",
                                item.type === "iceOre" && "bg-sky-300",
                              )}
                            >
                              <h3>{item.name}</h3>
                              <p className="text-sm text-stone-400">
                                {type2label[item.type]}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                    <p>{order.status}</p>
                    <div className="flex justify-between pt-4">
  {order.status === OrderStatus.Preparing && (
    <Button onClick={() => submitPayload(order)}>
      準備完了
    </Button>
  )}
  {order.status === OrderStatus.Ready && (
    <Button onClick={() => submitPayload(order)}>
      提供
    </Button>
  )}
</div>
              </CardContent>
                  <CardFooter>備考欄：{order?.description}</CardFooter>
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
    servedOrder: stringToJSONSchema.pipe(orderSchema).optional(),
    readyOrder: stringToJSONSchema.pipe(orderSchema).optional(),
  });
  const submission = parseWithZod(formData, {
    schema,
  });
  if (submission.status !== "success") {
    console.error(submission.error);
    return submission.reply();
  }

  const { servedOrder, readyOrder } = submission.value;
  let order;
  if (servedOrder) {
    order = OrderEntity.fromOrder(servedOrder);
  } else if (readyOrder) {
    order = OrderEntity.fromOrder(readyOrder);
  } else {
    return new Response("Invalid request", { status: 400 });
  }

  const savedOrder = await orderRepository.save(order);

  console.log("savedOrder", savedOrder);

  return new Response("ok");
};
