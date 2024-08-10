import { Item } from "~/models/item";
import { ItemRepository } from "./type";

export const itemRepository: ItemRepository = {
  findAll: async () => {
    // ここに Firestore からデータを取得する処理を記述
    return [];
  },
  findById: async (id: string) => {
    // ここに Firestore からデータを取得する処理を記述
    return null;
  },
  create: async (data: Item) => {
    // ここに Firestore にデータを作成する処理を記述
  },
  update: async (data: Item) => {
    // ここに Firestore のデータを更新する処理を記述
  },
  delete: async (id: string) => {
    // ここに Firestore のデータを削除する処理を記述
  },
};
