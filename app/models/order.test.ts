import { describe, expect, test } from "bun:test";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "./item";
import { OrderEntity } from "./order";

describe("[unit] order entity", () => {
  test("order total auto calc", () => {
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

  test("order beReady", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.orderReady).toBe(false);

    order.beReady();
    expect(order.orderReady).toBe(true);
  });

  test("order beServed", () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    expect(order.servedAt).toBe(null);

    order.beServed();
    expect(order.servedAt).not.toBe(null);
    expect(order.servedAt).toBeInstanceOf(Date);
  });
});
