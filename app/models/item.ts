import { z } from "zod";

import { type WithId } from "~/lib/typeguard";

export const itemtypes = ["hot", "ice", "ore", "milk"] as const;

export const itemSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  name: z.string({ required_error: "名前が未入力です" }),
  price: z.number({ required_error: "価格が未入力です" }),
  type: z.enum(itemtypes, {
    required_error: "種類が未選択です",
    invalid_type_error: "不正な種類です",
  }),
});

export type Item = z.infer<typeof itemSchema>;

export type ItemWithId = WithId<Item>;

export type ItemType = Pick<Item, "type">["type"];

export const type2label = {
  hot: "ホット",
  ice: "アイス",
  ore: "オレ",
  milk: "ミルク",
} as const satisfies Record<ItemType, string>;

export class ItemEntity implements Item {
  private constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly price: number,
    public readonly type: ItemType,
  ) {}

  static createNew({ name, price, type }: Item): ItemEntity {
    return new ItemEntity(undefined, name, price, type);
  }

  static fromItem(item: ItemWithId): WithId<ItemEntity> {
    return new ItemEntity(
      item.id,
      item.name,
      item.price,
      item.type,
    ) as WithId<ItemEntity>;
  }
}
