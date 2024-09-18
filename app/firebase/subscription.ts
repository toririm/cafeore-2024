import {
  collection,
  onSnapshot,
  query,
  type FirestoreDataConverter,
  type QueryConstraint,
} from "firebase/firestore";
import { type SWRSubscription } from "swr/subscription";

import { prodDB } from "./firestore";

export const collectionSub = <T>(
  { converter }: { converter: FirestoreDataConverter<T> },
  ...queryConstraints: QueryConstraint[]
) => {
  const sub: SWRSubscription<string, T[], Error> = (key, { next }) => {
    const unsub = onSnapshot(
      query(collection(prodDB, key), ...queryConstraints).withConverter(
        converter,
      ),
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
