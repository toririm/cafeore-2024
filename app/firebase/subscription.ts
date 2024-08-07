import {
  collection,
  type DocumentData,
  onSnapshot,
  query,
} from "firebase/firestore";
import { type SWRSubscription } from "swr/subscription";
import { db } from "./firestore";

// データの型はあとでマシなものにする
export const collectionSub: SWRSubscription<string, DocumentData[], Error> = (
  key,
  { next },
) => {
  const unsub = onSnapshot(
    query(collection(db, key)),
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
