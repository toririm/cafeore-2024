import type {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import type { ZodSchema } from "zod";

export const converter = <T>(schema: ZodSchema<T>) => {
  return {
    toFirestore: (data: T) => {
      return data as DocumentData;
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ) => {
      const data = snapshot.data(options);
      return schema.parse(data);
    },
  };
};
