import { Item } from "~/models/item";

export type BaseRepository<T> = {
  save(data: T): Promise<Required<T>>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Required<T> | null>;
};

export type ItemRepository = BaseRepository<Item>;
