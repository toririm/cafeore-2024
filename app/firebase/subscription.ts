import { collection, onSnapshot, query } from "firebase/firestore";
import { type SWRSubscription } from "swr/subscription";
import { type ZodSchema } from "zod";

import { converter } from "./converter";
import { db } from "./firestore";

export const collectionSub = <T>(schema: ZodSchema<T>) => {
  const sub: SWRSubscription<string, T[], Error> = (key, { next }) => {
    const unsub = onSnapshot(
      query(collection(db, key)).withConverter(converter(schema)),
      (snapshot) => {
        next(
          null,
          snapshot.docs.map((doc) => doc.data()),
        );
      },
      (err) => {
        next(err);
      },
    );
    return unsub;
  };
  return sub;
};
