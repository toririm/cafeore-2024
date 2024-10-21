import type { WithId } from "common/lib/typeguard";
import type { ItemEntity } from "common/models/item";
import type { OrderEntity } from "common/models/order";

export type BaseRepository<T extends { id?: unknown }> = {
  save(data: T): Promise<WithId<T>>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<WithId<T> | null>;
  findAll(): Promise<WithId<T>[]>;
};

export type ItemRepository = BaseRepository<ItemEntity>;

export type OrderRepository = BaseRepository<OrderEntity>;
