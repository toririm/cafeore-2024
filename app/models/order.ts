import { z } from "zod";
import { itemSchema } from "./item";

export const orderSchema = z.object({
  id: z.string().optional(), // Firestore のドキュメント ID
  orderId: z.number(),
  createdAt: z.date(),
  servedAt: z.date().nullable(),
  items: z.array(itemSchema),
  assignee: z.string().nullable(),
  total: z.number(),
  orderReady: z.boolean(),
});

export type Order = z.infer<typeof orderSchema>;
