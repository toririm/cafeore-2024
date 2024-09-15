import {
  type ClientActionFunction,
  type ClientActionFunctionArgs,
} from "@remix-run/react";

import { OrderEntity } from "~/models/order";
import { orderRepository } from "~/repositories/order";

export const createOrder: ClientActionFunction = async () => {
  console.log("save(create)のテスト");
  const newOrder = OrderEntity.createNew({ orderId: 1 });
  const savedOrder = await orderRepository.save(newOrder);
  console.log("created", savedOrder);
  return null;
};

export const updateOrder = async ({ request }: ClientActionFunctionArgs) => {
  const formData = await request.formData();
  console.log("save(update)のテスト");
  const id2 = formData.get("id");
  const order = await orderRepository.findById(id2 as string);
  if (order) {
    order.beServed();
    await orderRepository.save(order);
  }
  return null;
};
