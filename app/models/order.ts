import { z } from "zod";
import { itemSchema, ItemWithId } from "./item";

export const orderSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  orderId: z.number(),
  createdAt: z.date(),
  servedAt: z.date().nullable(),
  items: z.array(itemSchema.required()),
  assignee: z.string().nullable(),
  total: z.number(),
  orderReady: z.boolean(),
});

export type Order = z.infer<typeof orderSchema>;

export type OrderWithId = Required<Order>;

export class OrderEntity implements Order {
  // 全てのプロパティを private にして外部からの直接アクセスを禁止
  private constructor(
    private readonly _id: string | undefined,
    private readonly _orderId: number,
    private readonly _createdAt: Date,
    private _servedAt: Date | null,
    private _items: ItemWithId[],
    private _assignee: string | null,
    private _total: number,
    private _orderReady: boolean,
  ) {}

  static createNew(orderId: number): OrderEntity {
    return new OrderEntity(
      undefined,
      orderId,
      new Date(),
      null,
      [],
      null,
      0,
      false,
    );
  }

  static fromOrder(order: OrderWithId): OrderEntity {
    return new OrderEntity(
      order.id,
      order.orderId,
      order.createdAt,
      order.servedAt,
      order.items,
      order.assignee,
      order.total,
      order.orderReady,
    );
  }

  // --------------------------------------------------
  // getter and setter
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
  set items(items: ItemWithId[]) {
    this._items = items;
  }

  get assignee() {
    return this._assignee;
  }
  set assignee(assignee: string | null) {
    this._assignee = assignee;
  }

  get total() {
    // itemsの更新に合わせて自動で計算する
    // その代わりtotalは直接更新できない
    this._total = this._items.reduce((acc, item) => acc + item.price, 0);
    return this._total;
  }

  get orderReady() {
    return this._orderReady;
  }

  // --------------------------------------------------
  // methods
  // ------------------------------------------------

  beReady() {
    // orderReady は false -> true にしか変更できないようにする
    this._orderReady = true;
  }

  beServed() {
    // servedAt は null -> Date にしか変更できないようにする
    this._servedAt = new Date();
  }
}
