import { parseWithZod } from "@conform-to/zod";
import {
  type ClientActionFunction,
  type MetaFunction,
  useSubmit,
} from "@remix-run/react";
import { id2abbr } from "common/data/items";
import { orderConverter } from "common/firebase-utils/converter";
import { collectionSub } from "common/firebase-utils/subscription";
import { stringToJSONSchema } from "common/lib/custom-zod";
import { OrderEntity, orderSchema } from "common/models/order";
import { orderRepository } from "common/repositories/order";
import dayjs from "dayjs";
import { orderBy } from "firebase/firestore";
import { useCallback } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { InputComment } from "~/components/molecules/InputComment";
import { RealtimeElapsedTime } from "~/components/molecules/RealtimeElapsedTime";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "マスター画面" }];
};

export default function FielsOfMaster() {
  const submit = useSubmit();
  const mutateOrder = useCallback(
    (servedOrder: OrderEntity, descComment: string) => {
      const order = servedOrder.clone();
      order.addComment("master", descComment);
      submit(
        { servedOrder: JSON.stringify(order.toOrder()) },
        { method: "PUT" },
      );
    },
    [submit],
  );

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

  return (
    <div className="p-4 font-sans">
      <div className="flex justify-between pb-4">
        <h1 className="text-3xl">マスター</h1>
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
                    <div className="mb-4 grid grid-cols-2 gap-2">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          <Card
                            className={cn(
                              "pt-6",
                              item.type === "iceOre" && "bg-sky-200",
                              item.type === "ice" && "bg-blue-200",
                              item.type === "milk" && "bg-yellow-200",
                              item.name === "限定" && "bg-red-300",
                            )}
                          >
                            <CardContent>
                              <h3 className="text-center font-bold">
                                {id2abbr(item.id)}
                              </h3>
                              {item.assignee && (
                                <p className="text-sm">指名:{item.assignee}</p>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>

                    {order?.comments.length !== 0 && (
                      <div>
                        {order.comments.map((comment, index) => (
                          <div
                            key={`${index}-${comment.author}`}
                            className="my-2 flex rounded-md bg-gray-200 px-2 py-1"
                          >
                            <div className="flex-none">{comment.author}：</div>
                            <div>{comment.text}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <InputComment order={order} mutateOrder={mutateOrder} />
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
