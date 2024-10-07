import { itemConverter, orderConverter } from "&/firebase/converter";
import { collectionSub } from "&/firebase/subscription";
import { stringToJSONSchema } from "&/lib/custom-zod";
import { OrderEntity, orderSchema } from "&/models/order";
import { parseWithZod } from "@conform-to/zod";
import { type ClientActionFunction, useSubmit } from "@remix-run/react";
import { useCallback } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { CashierV2 } from "~/components/pages/CashierV2";
import { orderRepository } from "~/repositories/order";

// コンポーネントではデータの取得と更新のみを行う
export default function Cashier() {
  const { data: items } = useSWRSubscription(
    "items",
    collectionSub({ converter: itemConverter }),
  );
  const { data: orders } = useSWRSubscription(
    "orders",
    collectionSub({ converter: orderConverter }),
  );
  const submit = useSubmit();

  const submitPayload = useCallback(
    (newOrder: OrderEntity) => {
      submit(
        { newOrder: JSON.stringify(newOrder.toOrder()) },
        { method: "POST" },
      );
    },
    [submit],
  );

  return (
    <CashierV2 items={items} orders={orders} submitPayload={submitPayload} />
  );
}

// TODO(toririm): リファクタリングするときにファイルを切り出す
export const clientAction: ClientActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const schema = z.object({
    newOrder: stringToJSONSchema.pipe(orderSchema),
  });
  const submission = parseWithZod(formData, {
    schema,
  });
  if (submission.status !== "success") {
    console.error(submission.error);
    return submission.reply();
  }

  const { newOrder } = submission.value;
  const order = OrderEntity.fromOrder(newOrder);

  const savedOrder = await orderRepository.save(order);

  console.log("savedOrder", savedOrder);

  return new Response("ok");
};
