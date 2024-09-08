import fs from "fs";

import { describe, expect, test } from "bun:test";

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { type Firestore } from "firebase/firestore";

import { OrderEntity } from "~/models/order";

import { orderRepoFactory } from "./order";

describe("[db] orderRepository", async () => {
  // To use this environment, firebase emulator must be running.
  const testEnv = await initializeTestEnvironment({
    projectId: "cafeore-2024",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
  const anno = testEnv.unauthenticatedContext();
  const testDb = anno.firestore();
  testDb.settings({
    ignoreUndefinedProperties: true,
  });
  const orderRepository = orderRepoFactory(testDb as unknown as Firestore);

  test("orderRepository is defined", () => {
    expect(orderRepository).toBeDefined();
  });

  test("orderRepository.save", async () => {
    const order = OrderEntity.createNew({ orderId: 2024 });
    const savedOrder = await orderRepository.save(order);
    expect(savedOrder.id).toBeDefined();
  });

  test("orderRepository.findById", async () => {
    const order = OrderEntity.createNew({ orderId: 2025 });
    const savedOrder = await orderRepository.save(order);
    const foundOrder = await orderRepository.findById(savedOrder.id);
    expect(foundOrder).toEqual(savedOrder);
  });

  test("orderRepository.findAll", async () => {
    const order = OrderEntity.createNew({ orderId: 2026 });
    const savedOrder = await orderRepository.save(order);
    const orders = await orderRepository.findAll();
    expect(orders).toContainEqual(savedOrder);
  });

  test("orderRepository.delete", async () => {
    const order = OrderEntity.createNew({ orderId: 2027 });
    const savedOrder = await orderRepository.save(order);
    await orderRepository.delete(savedOrder.id);
    const foundOrder = await orderRepository.findById(savedOrder.id);
    expect(foundOrder).toBeNull();
  });
});
