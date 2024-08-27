import { addDoc, collection, getDocs } from "firebase/firestore";
import { converter } from "~/firebase/converter";
import { db } from "~/firebase/firestore";
import { Item, itemSchema } from "~/models/item";
import { ItemRepository } from "./type";

export const itemRepository: ItemRepository = {
  findAll: async () => {
    const colRef = collection(db, "items").withConverter(
      converter(itemSchema.required()),
    );
    const docSnaps = await getDocs(colRef);
    return docSnaps.docs.map((doc) => doc.data());
  },
  findById: async (id: string) => {
    // ここに Firestore からデータを取得する処理を記述
    return null;
  },
  create: async (data: Item) => {
    const docRef = await addDoc(collection(db, "items"), data);
  },
  update: async (data: Item) => {
    // ここに Firestore のデータを更新する処理を記述
  },
  delete: async (id: string) => {
    // ここに Firestore のデータを削除する処理を記述
  },
};
