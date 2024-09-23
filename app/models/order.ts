import { z } from "zod";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, itemSchema } from "./item";

export const orderSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  orderId: z.number(),
  createdAt: z.date(),
  servedAt: z.date().nullable(),
  items: z.array(itemSchema.required()),
  total: z.number(),
  orderReady: z.boolean(),
  description: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

export class OrderEntity implements Order {
  // 全てのプロパティを private にして外部からの直接アクセスを禁止
  private constructor(
    private readonly _id: string | undefined,
    private readonly _orderId: number,
    private readonly _createdAt: Date,
    private _servedAt: Date | null,
    private _items: WithId<ItemEntity>[],
    private _total: number,
    private _orderReady: boolean,
    private _description: string,
  ) {}

  static createNew({ orderId }: { orderId: number }): OrderEntity {
    return new OrderEntity(
      undefined,
      orderId,
      new Date(),
      null,
      [],
      0,
      false,
      "",
    );
  }

  static fromOrder(order: WithId<Order>): WithId<OrderEntity> {
    return new OrderEntity(
      order.id,
      order.orderId,
      order.createdAt,
      order.servedAt,
      order.items,
      order.total,
      order.orderReady,
      order.description,
    ) as WithId<OrderEntity>;
  }

  // --------------------------------------------------
  // getter / setter
  // --------------------------------------------------

  get id() {
    return this._id;
  }

  get orderId() {
    return this._orderId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get servedAt() {
    return this._servedAt;
  }

  get items() {
    return this._items;
  }
  set items(items: WithId<ItemEntity>[]) {
    this._items = items;
  }

  get total() {
    // items の更新に合わせて total を自動で計算する
    // その代わり total は直接更新できない
    // TODO(toririm): 計算するのは items が変更された時だけでいい
    this._total = this._items.reduce((acc, item) => acc + item.price, 0);
    return this._total;
  }

  get orderReady() {
    return this._orderReady;
  }

  get description() {
    return this._description;
  }
  set description(description: string) {
    this._description = description;
  }

  // --------------------------------------------------
  // methods
  // --------------------------------------------------

  beReady() {
    // orderReady は false -> true にしか変更できないようにする
    this._orderReady = true;
  }

  beServed() {
    // servedAt は null -> Date にしか変更できないようにする
    this._servedAt = new Date();
  }

  toOrder(): Order {
    return {
      id: this.id,
      orderId: this.orderId,
      createdAt: this.createdAt,
      servedAt: this.servedAt,
      items: this.items,
      total: this.total,
      orderReady: this.orderReady,
      description: this.description,
    };
  }
}
