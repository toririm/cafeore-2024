import { Item } from "~/models/item";
import { Order } from "~/models/order";

export type BaseRepository<T> = {
  save(data: T): Promise<Required<T>>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Required<T> | null>;
  findAll(): Promise<Required<T>[]>;
};

export type ItemRepository = BaseRepository<Item>;

export type OrderRepository = BaseRepository<Order>;
