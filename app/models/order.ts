import { z } from "zod";
import type { WithId } from "~/lib/typeguard";
import { type ItemEntity, itemSchema } from "./item";

export const orderSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  orderId: z.number(),
  createdAt: z.date(),
  servedAt: z.date().nullable(),
  items: z.array(itemSchema.required()),
  total: z.number(), // sum of item.price
  orderReady: z.boolean(),
  description: z.string().nullable(),
  billingAmount: z.number(), // total - discount
  received: z.number(), // お預かり金額
  discountInfo: z.object({
    previousOrderId: z.number().nullable(),
    validCups: z.number(), // min(this.items.length, previousOrder.items.length)
    discount: z.number(), // validCups * 100
  }),
});

export type Order = z.infer<typeof orderSchema>;
type DiscountInfo = Order["discountInfo"];

const DISCOUNT_RATE_PER_CUP = 100;

// OrderEntity の内部でのみ使うクラス
class DiscountInfoEntity implements DiscountInfo {
  constructor(
    readonly previousOrderId: number | null,
    readonly validCups: number,
  ) {}

  get discount() {
    return this.validCups * DISCOUNT_RATE_PER_CUP;
  }

  static fromDiscountInfo(
    discountInfo: Omit<DiscountInfo, "discount">,
  ): DiscountInfoEntity {
    return new DiscountInfoEntity(
      discountInfo.previousOrderId,
      discountInfo.validCups,
    );
  }
}

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
    private _description: string | null,
    private _billingAmount: number,
    private _received: number,
    private _discountInfo: DiscountInfoEntity = new DiscountInfoEntity(null, 0),
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
      null,
      0,
      0,
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
      order.billingAmount,
      order.received,
      DiscountInfoEntity.fromDiscountInfo(order.discountInfo),
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
  set description(description: string | null) {
    this._description = description;
  }

  get billingAmount() {
    this._billingAmount = this.total - this._discountInfo.discount;
    return this._billingAmount;
  }

  get received() {
    return this._received;
  }
  set received(received: number) {
    this._received = received;
  }

  get discountInfo() {
    return this._discountInfo;
  }

  // --------------------------------------------------
  // methods
  // --------------------------------------------------

  _getCoffeeCount() {
    // milk 以外のアイテムの数を返す
    // TODO(toririm): このメソッドは items が変更された時だけでいい
    return this.items.filter((item) => item.type !== "milk").length;
  }

  beReady() {
    // orderReady は false -> true にしか変更できないようにする
    this._orderReady = true;
  }

  beServed() {
    // servedAt は null -> Date にしか変更できないようにする
    this._servedAt = new Date();
  }

  /* このメソッドのみで discountInfo を更新する */
  applyDiscount(previousOrder: OrderEntity) {
    const validCups = Math.min(
      this._getCoffeeCount(),
      previousOrder._getCoffeeCount(),
    );

    this._discountInfo = DiscountInfoEntity.fromDiscountInfo({
      previousOrderId: previousOrder.orderId,
      validCups,
    });
    return this._discountInfo;
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
      billingAmount: this.billingAmount,
      received: this.received,
      discountInfo: this.discountInfo,
    };
  }
}
