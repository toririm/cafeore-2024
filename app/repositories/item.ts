import { addDoc, collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { converter } from "~/firebase/converter";
import { db } from "~/firebase/firestore";
import { hasId } from "~/lib/typeguard";
import { itemSchema } from "~/models/item";
import { ItemRepository } from "./type";

export const itemRepository: ItemRepository = {
  save: async (item) => {
    if (hasId(item)) {
      const docRef = doc(db, "items", item.id).withConverter(
        converter(itemSchema.required()),
      );
      await setDoc(docRef, item);
      return item;
    } else {
      const colRef = collection(db, "items").withConverter(converter(itemSchema));
      const docRef = await addDoc(colRef, item);
      const resultDoc = await getDoc(
        docRef.withConverter(converter(itemSchema.required())),
      );
      if (resultDoc.exists()) {
        return resultDoc.data();
      }
      throw new Error("Failed to save item");
    }
  },
  delete: async (id) => {},
  findById: async (id: string) => {
    // ここに Firestore からデータを取得する処理を記述
    return null;
  },
  findAll: async () => {
    const colRef = collection(db, "items").withConverter(
      converter(itemSchema.required()),
    );
    const docSnaps = await getDocs(colRef);
    return docSnaps.docs.map((doc) => doc.data());
  },
};
