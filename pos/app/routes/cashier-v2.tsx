import { parseWithZod } from "@conform-to/zod";
import { type ClientActionFunction, useSubmit } from "@remix-run/react";
import { itemSource } from "common/data/items";
import { orderConverter } from "common/firebase-utils/converter";
import { collectionSub } from "common/firebase-utils/subscription";
import { stringToJSONSchema } from "common/lib/custom-zod";
import { OrderEntity, orderSchema } from "common/models/order";
import { orderRepository } from "common/repositories/order";
import { useCallback } from "react";
import useSWRSubscription from "swr/subscription";
import { z } from "zod";
import { CashierV2 } from "~/components/pages/CashierV2";

// コンポーネントではデータの取得と更新のみを行う
export default function Cashier() {
  const items = itemSource;
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
