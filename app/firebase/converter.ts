import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import _ from "lodash";
import type { ZodSchema } from "zod";
import type { WithId } from "~/lib/typeguard";
import { ItemEntity, itemSchema } from "~/models/item";
import { OrderEntity, orderSchema } from "~/models/order";

export const converter = <T>(
  schema: ZodSchema<T>,
): FirestoreDataConverter<T> => {
  return {
    toFirestore: (data: T) => {
      // Zod のパースを挟まないと、Entityオブジェクトのgetter/setterは無視され
      // privateプロパティがFirestoreに保存されてしまう
      const parsedData = schema.parse(data);
      // id は ドキュメントには含めない
      const dataWithoutId = _.omit(parsedData as object, "id");
      return dataWithoutId;
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ) => {
      const data = snapshot.data(options);
      // id は Firestore のドキュメント ID を使う
      const dataWithId = { ...data, id: snapshot.id };
      const dateParsedData = parseDateProperty(dataWithId);
      return schema.parse(dateParsedData);
    },
  };
};

// 通常の Firestore のデータは上記 Zod によってパースできるが
// Firestore の Timestamp はパースできないため、個別でパースする

// この関数の型注釈は若干嘘
const parseDateProperty = (data: DocumentData): DocumentData => {
  const parsedData = _.mapValues(data, (value) =>
    // firestore 固有の Timestamp 型を Date に変換
    value instanceof Timestamp ? value.toDate() : value,
  );
  const recursivelyParsedData = _.mapValues(parsedData, (value) => {
    // 再帰的にパースする
    switch (Object.prototype.toString.call(value)) {
      case "[object Object]":
        return parseDateProperty(value);
      case "[object Array]":
        return (value as Array<DocumentData>).map((v) => parseDateProperty(v));
      default:
        return value;
    }
  });
  return recursivelyParsedData;
};

/**
 * Firestore のデータを ItemEntity に変換する
 */
export const itemConverter: FirestoreDataConverter<WithId<ItemEntity>> = {
  toFirestore: converter(itemSchema).toFirestore,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ) => {
    const convertedData = converter(itemSchema.required()).fromFirestore(
      snapshot,
      options,
    );
    return ItemEntity.fromItem(convertedData);
  },
};

/**
 * Firestore のデータを OrderEntity に変換する
 */
export const orderConverter: FirestoreDataConverter<WithId<OrderEntity>> = {
  toFirestore: converter(orderSchema).toFirestore,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): WithId<OrderEntity> => {
    const convertedData = converter(orderSchema.required()).fromFirestore(
      snapshot,
      options,
    );
    convertedData.items = convertedData.items.map((item) =>
      ItemEntity.fromItem(item),
    );
    return OrderEntity.fromOrder(convertedData);
  },
};
