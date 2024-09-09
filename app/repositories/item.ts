import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { itemConverter } from "~/firebase/converter";
import { prodDB } from "~/firebase/firestore";
import { hasId } from "~/lib/typeguard";

import { type ItemRepository } from "./type";

export const itemRepository: ItemRepository = {
  save: async (item) => {
    if (hasId(item)) {
      const docRef = doc(prodDB, "items", item.id).withConverter(itemConverter);
      await setDoc(docRef, item);
      return item;
    } else {
      const colRef = collection(prodDB, "items").withConverter(itemConverter);
      const docRef = await addDoc(colRef, item);
      const resultDoc = await getDoc(docRef.withConverter(itemConverter));
      if (resultDoc.exists()) {
        return resultDoc.data();
      }
      throw new Error("Failed to save item");
    }
  },

  delete: async (id) => {
    await deleteDoc(doc(prodDB, "items", id));
  },

  findById: async (id) => {
    const docRef = doc(prodDB, "items", id).withConverter(itemConverter);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  },

  findAll: async () => {
    const colRef = collection(prodDB, "items").withConverter(itemConverter);
    const docSnaps = await getDocs(colRef);
    return docSnaps.docs.map((doc) => doc.data());
  },
};
