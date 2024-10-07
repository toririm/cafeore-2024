import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import _ from "lodash";
import { z, type ZodSchema } from "zod";
import type { WithId } from "../lib/typeguard";
import { ItemEntity, itemSchema } from "../models/item";
import { OrderEntity, OrderStatus, orderSchema } from "../models/order";

export const converter = <T>(
  schema: ZodSchema<T>,
): FirestoreDataConverter<T> => {
  return {
    toFirestore: (data: T) => {
      try {
        const parsedData = schema.parse(data);
        const dataWithoutId = _.omit(parsedData as object, "id");
        return dataWithoutId;
      } catch (error) {
        console.error("Error in toFirestore:", error);
        if (error instanceof z.ZodError) {
          console.error(
            "Zod validation errors:",
            JSON.stringify(error.errors, null, 2),
          );
        }
        throw error;
      }
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ) => {
      try {
        const data = snapshot.data(options);
        const dataWithId = { ...data, id: snapshot.id };
        const dateParsedData = parseDateProperty(dataWithId);
        return schema.parse(dateParsedData);
      } catch (error) {
        console.error("Error in fromFirestore for document:", snapshot.id);
        console.error("Raw data:", JSON.stringify(snapshot.data(options), null, 2));
        if (error instanceof z.ZodError) {
          console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        }
        throw error;
      }
    },
  };
};

const parseDateProperty = (data: DocumentData): DocumentData => {
  return _.mapValues(data, (value) => {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    if (_.isPlainObject(value)) {
      return parseDateProperty(value as DocumentData);
    }
    if (_.isArray(value)) {
      return value.map((item) => 
        _.isPlainObject(item) ? parseDateProperty(item as DocumentData) : item
      );
    }
    return value;
  });
};

export const itemConverter: FirestoreDataConverter<WithId<ItemEntity>> = {
  toFirestore: converter(itemSchema).toFirestore,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ) => {
    try {
      const convertedData = converter(itemSchema.required()).fromFirestore(
        snapshot,
        options,
      );
      return ItemEntity.fromItem(convertedData);
    } catch (error) {
      console.error("Error in itemConverter.fromFirestore for document:", snapshot.id);
      throw error;
    }
  },
};

export const orderConverter: FirestoreDataConverter<WithId<OrderEntity>> = {
  toFirestore: converter(orderSchema).toFirestore,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): WithId<OrderEntity> => {
    try {
      console.log("Processing order document:", snapshot.id);
      const rawData = snapshot.data(options);
      console.log("Raw order data:", JSON.stringify(rawData, null, 2));

      let transformedData = { ...rawData };
      if (transformedData.status === undefined && transformedData.orderReady !== undefined) {
        transformedData.status = transformedData.orderReady ? OrderStatus.Ready : OrderStatus.Preparing;
      }

      const dateParsedData = parseDateProperty(transformedData);
      console.log("Date parsed data:", JSON.stringify(dateParsedData, null, 2));

      const convertedData = orderSchema.required().parse({
        ...dateParsedData,
        id: snapshot.id
      });
      console.log("Converted order data:", JSON.stringify(convertedData, null, 2));
      
      convertedData.items = convertedData.items.map((item) =>
        ItemEntity.fromItem(item),
      );
      
      const orderEntity = OrderEntity.fromOrder(convertedData);
      console.log("Created OrderEntity:", JSON.stringify(orderEntity, null, 2));
      
      return orderEntity;
    } catch (error) {
      console.error("Error in orderConverter.fromFirestore for document:", snapshot.id);
      console.error("Raw data:", JSON.stringify(snapshot.data(options), null, 2));
      if (error instanceof z.ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        console.error("Zod error issues:");
        error.issues.forEach((issue, index) => {
          console.error(`Issue ${index + 1}:`, JSON.stringify(issue, null, 2));
        });
      } else {
        console.error("Unexpected error:", error);
      }
      throw error;
    }
  },
};