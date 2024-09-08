import { expect, test } from "vitest";

import { type ItemWithId } from "./item";
import { OrderEntity } from "./order";

test("order total auto calc", () => {
  const order = OrderEntity.createNew(2024);
  expect(order.total).toBe(0);

  const items: ItemWithId[] = [
    {
      id: "1",
      name: "item1",
      price: 100,
      type: "hot",
    },
    {
      id: "2",
      name: "item2",
      price: 341,
      type: "ice",
    },
  ];
  order.items.push(...items);
  expect(order.total).toBe(441);

  order.items.push({
    id: "3",
    name: "item3",
    price: 100,
    type: "ore",
  });
  expect(order.total).toBe(541);
});

test("order beReady", () => {
  const order = OrderEntity.createNew(2024);
  expect(order.orderReady).toBe(false);

  order.beReady();
  expect(order.orderReady).toBe(true);
});

test("order beServed", () => {
  const order = OrderEntity.createNew(2024);
  expect(order.servedAt).toBe(null);

  order.beServed();
  expect(order.servedAt).not.toBe(null);
  expect(order.servedAt).toBeInstanceOf(Date);
});
