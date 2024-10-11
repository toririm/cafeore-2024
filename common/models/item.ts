import { z } from "zod";
import type { WithId } from "../lib/typeguard";

export const itemtypes = [
  "hot",
  "ice",
  "hotOre",
  "iceOre",
  "milk",
  "others",
] as const;

export const itemSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  name: z.string({ required_error: "名前が未入力です" }),
  price: z.number({ required_error: "価格が未入力です" }),
  type: z.enum(itemtypes, {
    required_error: "種類が未選択です",
    invalid_type_error: "不正な種類です",
  }),
  assignee: z.string().nullable(),
});

export type Item = z.infer<typeof itemSchema>;

export type ItemType = Item["type"];

export const type2label = {
  hot: "ホット",
  ice: "アイス",
  hotOre: "ホットオレ",
  iceOre: "アイスオレ",
  milk: "アイスミルク",
  others: "その他",
} as const satisfies Record<ItemType, string>;

export class ItemEntity implements Item {
  constructor(
    public readonly _id: string | undefined,
    public _name: string,
    public _price: number,
    public _type: ItemType,
    public _assignee: string | null,
  ) {}

  static createNew({ name, price, type }: Omit<Item, "assignee">): ItemEntity {
    return new ItemEntity(undefined, name, price, type, null);
  }

  static fromItem(item: WithId<Item>): WithId<ItemEntity> {
    return new ItemEntity(
      item.id,
      item.name,
      item.price,
      item.type,
      item.assignee,
    ) as WithId<ItemEntity>;
  }

  get id() {
    return this._id;
  }

  get name() {
    return this._name;
  }

  get price() {
    return this._price;
  }

  get type() {
    return this._type;
  }

  get assignee() {
    return this._assignee;
  }
  set assignee(assignee: string | null) {
    if (assignee === "") {
      this._assignee = null;
    } else {
      this._assignee = assignee;
    }
  }
}
