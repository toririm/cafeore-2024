import { z } from "zod";

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

export type ItemWithId = Required<Item>;

export type ItemType = Pick<Item, "type">["type"];

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

  static fromItem(item: ItemWithId): ItemEntity {
    return new ItemEntity(item.id, item.name, item.price, item.type);
  }
}
