import {
  type FirestoreDataConverter,
  type QueryConstraint,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import type { SWRSubscription } from "swr/subscription";
import { prodDB } from "./firestore";

/**
 * Firestore のコレクションを監視する SWRSubscription を生成する
 */
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
