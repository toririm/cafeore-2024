import { z } from "zod";
import type { WithId } from "../lib/typeguard";
import { ItemEntity, itemSchema } from "./item";

const AUTHORS = ["cashier", "master", "serve", "others"] as const;

export type Author = (typeof AUTHORS)[number];

export const orderSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  orderId: z.number(),
  createdAt: z.date(),
  readyAt: z.date().nullable(),
  servedAt: z.date().nullable(),
  items: z.array(itemSchema.required()),
  total: z.number(), // sum of item.price
  comments: z.array(
    z.object({
      author: z.enum(AUTHORS),
      text: z.string(),
    }),
  ),
  billingAmount: z.number(), // total - discount
  received: z.number(), // お預かり金額
  discountOrderId: z.number().nullable(),
  discountOrderCups: z.number(),
  DISCOUNT_PER_CUP: z.number(),
  discount: z.number(), // min(this.getCoffeeCount(), discountOrderCups) * DISCOUNT_PER_CUP
});

export type Order = z.infer<typeof orderSchema>;

// 途中から割引額を変更する場合はこの値を変更する
const STATIC_DISCOUNT_PER_CUP = 100;

export class OrderEntity implements Order {
  order: ItemEntity | undefined;
  // 全てのプロパティを private にして外部からの直接アクセスを禁止
  private constructor(
    private readonly _id: string | undefined,
    private _orderId: number,
    private _createdAt: Date,
    private _readyAt: Date | null,
    private _servedAt: Date | null,
    private _items: WithId<ItemEntity>[],
    private _total: number,
    private _comments: Order["comments"],
    private _billingAmount: number,
    private _received: number,
    private _discountOrderId: number | null,
    private _discountOrderCups: number,
    private readonly _DISCOUNT_PER_CUP: number,
    private _discount: number,
  ) {}

  static createNew({ orderId }: { orderId: number }): OrderEntity {
    return new OrderEntity(
      undefined,
      orderId,
      new Date(),
      null,
      null,
      [],
      0,
      [],
      0,
      0,
      null,
      0,
      STATIC_DISCOUNT_PER_CUP,
      0,
    );
  }

  static fromOrder(order: WithId<Order>): WithId<OrderEntity>;
  static fromOrder(order: Order): OrderEntity;
  static fromOrder(
    order: WithId<Order> | Order,
  ): WithId<OrderEntity> | OrderEntity {
    return new OrderEntity(
      order.id,
      order.orderId,
      order.createdAt,
      order.readyAt,
      order.servedAt,
      order.items.map((item) => ItemEntity.fromItem(item)),
      order.total,
      order.comments,
      order.billingAmount,
      order.received,
      order.discountOrderId,
      order.discountOrderCups,
      order.DISCOUNT_PER_CUP,
      order.discount,
    );
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
  set orderId(orderId: number) {
    this._orderId = orderId;
  }

  get createdAt() {
    return this._createdAt;
  }

  get readyAt() {
    return this._readyAt;
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

  get comments() {
    return this._comments;
  }
  // set comments(a) {
  //   if (description === "") {
  //     this._description = null;
  //   } else {
  //     this._description = description;
  //   }
  // }

  get billingAmount() {
    this._billingAmount = this.total - this.discount;
    return this._billingAmount;
  }

  get received() {
    return this._received;
  }
  set received(received: number) {
    this._received = received;
  }

  get discountOrderId() {
    return this._discountOrderId;
  }

  get discountOrderCups() {
    return this._discountOrderCups;
  }

  get DISCOUNT_PER_CUP() {
    return this._DISCOUNT_PER_CUP;
  }

  get discount() {
    this._discount =
      Math.min(this.getCoffeeCount(), this._discountOrderCups) *
      this._DISCOUNT_PER_CUP;
    return this._discount;
  }

  // --------------------------------------------------
  // methods
  // --------------------------------------------------

  /**
   * コーヒーの数を取得する
   * @returns 割引の対象となるコーヒーの数
   */
  getCoffeeCount() {
    // milk 以外のアイテムの数を返す
    // TODO(toririm): このメソッドは items が変更された時だけでいい
    return this.items.filter(
      (item) => item.type !== "milk" && item.type !== "others",
    ).length;
  }

  /**
   * オーダーを準備完了状態に変更する
   */
  beReady() {
    this._readyAt = new Date();
  }

  /**
   * 準備完了状態を取り消す
   */
  undoReady() {
    this._readyAt = null;
  }

  addComment(author: Author, text: string) {
    if (text === "") {
      return;
    }
    this._comments.push({ author, text });
  }

  /**
   * オーダーを提供済み状態に変更する
   * もし readyAt が null ならば readyAt を現在時刻に設定する
   */
  beServed() {
    const now = new Date();
    this._servedAt = now;
    if (this._readyAt === null) {
      this._readyAt = now;
    }
  }

  /**
   * 提供済み状態を取り消す
   */
  undoServed() {
    // readyAt も同時に更新された場合のみ readyAt を null にする
    if (this._readyAt === this._servedAt) {
      this._readyAt = null;
    }
    this._servedAt = null;
  }

  /**
   * 割引を適用する
   * @param previousOrder 割引の参照となる前回のオーダー
   */
  applyDiscount(previousOrder: OrderEntity) {
    this._discountOrderId = previousOrder.orderId;
    this._discountOrderCups = previousOrder.getCoffeeCount();
  }

  /**
   * 割引を解除する
   */
  removeDiscount() {
    this._discountOrderId = null;
    this._discountOrderCups = 0;
  }

  /**
   * オーダーを作成した時刻を更新する
   */
  nowCreated() {
    // createdAt を更新
    this._createdAt = new Date();
  }

  /**
   * お釣りを計算する
   * @returns お釣り
   */
  getCharge() {
    return this.received - this.billingAmount;
  }

  /**
   * メソッドを持たない Order オブジェクトに変換する
   * @returns Order オブジェクト
   */
  toOrder(): Order {
    return {
      id: this.id,
      orderId: this.orderId,
      createdAt: this.createdAt,
      readyAt: this.readyAt,
      servedAt: this.servedAt,
      items: this.items.map((item) => item.toItem()),
      total: this.total,
      comments: this.comments,
      billingAmount: this.billingAmount,
      received: this.received,
      discountOrderId: this.discountOrderId,
      discountOrderCups: this.discountOrderCups,
      DISCOUNT_PER_CUP: this.DISCOUNT_PER_CUP,
      discount: this.discount,
    };
  }

  /**
   * オーダーを複製する
   */
  clone(): WithId<OrderEntity>;
  clone(): OrderEntity;
  clone(): WithId<OrderEntity> | OrderEntity {
    return OrderEntity.fromOrder(this.toOrder());
  }
}
