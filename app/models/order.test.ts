import { describe, expect, test } from "bun:test";
import type { WithId } from "~/lib/typeguard";
import { type Item, ItemEntity } from "./item";
import { OrderEntity } from "./order";

describe("[unit] order entity", () => {
  test("total auto calc", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.total).toBe(0);

    // TODO(toririm):
    // 現在はItemEntityにメソッドが生えていないためこれで正常に動くが
    // メソッドが生えると型エラーが発生する。ちゃんと`fromItem`等を使って
    // インスタンスを生成するように修正する
    const items: WithId<ItemEntity>[] = [
      {
        id: "1",
        name: "item1",
        price: 100,
        type: "hot",
        assignee: null,
      },
      {
        id: "2",
        name: "item2",
        price: 341,
        type: "ice",
        assignee: null,
      },
    ];
    order.items.push(...items);
    expect(order.total).toBe(441);

    order.items.push({
      id: "3",
      name: "item3",
      price: 100,
      type: "ore",
      assignee: null,
    });
    expect(order.total).toBe(541);
  });

  test("beReady", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.orderReady).toBe(false);

    order.beReady();
    expect(order.orderReady).toBe(true);
  });

  test("beServed", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.servedAt).toBe(null);

    order.beServed();
    expect(order.servedAt).not.toBe(null);
    expect(order.servedAt).toBeInstanceOf(Date);
  });

  test("billingAmount", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.billingAmount).toBe(0);

    const items: WithId<Item>[] = [
      {
        id: "1",
        name: "item1",
        price: 400,
        type: "hot",
        assignee: null,
      },
      {
        id: "2",
        name: "item2",
        price: 500,
        type: "ice",
        assignee: null,
      },
    ];
    const itemEntities = items.map((item) => ItemEntity.fromItem(item));

    order.items = itemEntities;
    expect(order.billingAmount).toBe(900);

    const previousOrder = OrderEntity.fromOrder({
      id: "1",
      orderId: 99999,
      createdAt: new Date(),
      servedAt: null,
      items: itemEntities.slice(0, 1),
      total: 900,
      orderReady: false,
      description: null,
      billingAmount: 900,
      received: 0,
      discountInfo: {
        previousOrderId: null,
        validCups: 0,
        discount: 0,
      },
    });

    order.applyDiscount(previousOrder);
    expect(order.discountInfo.previousOrderId).toBe(99999);
    expect(order.discountInfo.validCups).toBe(1);
    expect(order.discountInfo.discount).toBe(100);
    expect(order.billingAmount).toBe(800);
  });

  test("received", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.received).toBe(0);

    order.received = 1000;
    expect(order.received).toBe(1000);
  });
});
