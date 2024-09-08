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
import { orderSchema, type Order, type OrderWithId } from "~/models/order";

import { type OrderRepository } from "./type";

export const orderRepository: OrderRepository = {
  save: async (order) => {
    if (hasId(order)) {
      return await update(order);
    } else {
      return await create(order);
    }
  },

  delete: async (id) => {
    await deleteDoc(doc(db, "orders", id));
  },

  findById: async (id) => {
    const docRef = doc(db, "orders", id).withConverter(
      converter(orderSchema.required()),
    );
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  },

  findAll: async () => {
    const colRef = collection(db, "orders").withConverter(
      converter(orderSchema.required()),
    );
    const docSnaps = await getDocs(colRef);
    return docSnaps.docs.map((doc) => doc.data());
  },
};

const update = async (order: OrderWithId): Promise<OrderWithId> => {
  const docRef = doc(db, "orders", order.id).withConverter(
    converter(orderSchema.required()),
  );
  await setDoc(docRef, order);
  return order;
};

const create = async (order: Order): Promise<OrderWithId> => {
  const colRef = collection(db, "orders").withConverter(converter(orderSchema));
  const docRef = await addDoc(colRef, order);
  const resultDoc = await getDoc(
    docRef.withConverter(converter(orderSchema.required())),
  );
  if (resultDoc.exists()) {
    return resultDoc.data();
  }
  throw new Error("Failed to save order");
};
