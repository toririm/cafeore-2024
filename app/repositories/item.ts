import { addDoc, collection, getDocs } from "firebase/firestore";
import { converter } from "~/firebase/converter";
import { db } from "~/firebase/firestore";
import { Item, itemSchema } from "~/models/item";
import { Repository } from "./type";

export const itemRepository: Repository<Item> = {
  findAll: async () => {
    const itemsRef = collection(db, "items").withConverter(
      converter(itemSchema),
    );
    const docSnap = await getDocs(itemsRef);
    const items = docSnap.docs.map((doc) => doc.data());
    console.log(items);
    return items;
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
