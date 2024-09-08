import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { converter } from "~/firebase/converter";
import { db } from "~/firebase/firestore";
import { hasId } from "~/lib/typeguard";
import { itemSchema } from "~/models/item";

import { type ItemRepository } from "./type";

export const itemRepository: ItemRepository = {
  save: async (item) => {
    if (hasId(item)) {
      const docRef = doc(db, "items", item.id).withConverter(
        converter(itemSchema.required()),
      );
      await setDoc(docRef, item);
      return item;
    } else {
      const colRef = collection(db, "items").withConverter(
        converter(itemSchema),
      );
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

  delete: async (id) => {
    await deleteDoc(doc(db, "items", id));
  },

  findById: async (id) => {
    const docRef = doc(db, "items", id).withConverter(
      converter(itemSchema.required()),
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  },

  findAll: async () => {
    const colRef = collection(db, "items").withConverter(
      converter(itemSchema.required()),
    );
    const docSnaps = await getDocs(colRef);
    return docSnaps.docs.map((doc) => doc.data());
  },
};
