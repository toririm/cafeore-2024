import { type WithId } from "~/lib/typeguard";
import { type Item } from "~/models/item";
import { type Order } from "~/models/order";

export type BaseRepository<T extends { id?: unknown }> = {
  save(data: T): Promise<WithId<T>>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<WithId<T> | null>;
  findAll(): Promise<WithId<T>[]>;
};

export type ItemRepository = BaseRepository<Item>;

export type OrderRepository = BaseRepository<Order>;
