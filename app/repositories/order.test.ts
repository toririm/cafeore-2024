import { describe, expect, test } from "bun:test";

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { type Firestore } from "firebase/firestore";

import { orderRepoFactory } from "./order";

describe("[db] orderRepository", async () => {
  // To use this environment, firebase emulator must be running.
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-project-1234",
    firestore: { host: "localhost", port: 8080 },
  });
  const anno = testEnv.unauthenticatedContext();
  const testDb = anno.firestore();
  const orderRepository = orderRepoFactory(testDb as unknown as Firestore);

  test("orderRepository is defined", () => {
    expect(orderRepository).toBeDefined();
  });
});
