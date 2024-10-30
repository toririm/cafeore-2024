import { z } from "zod";
import { orderSchema } from "./order";

export const GlobalCashierStateSchema = z.object({
  id: z.literal("cashier-state"),
  edittingOrder: orderSchema,
});

export type GlobalCashierState = z.infer<typeof GlobalCashierStateSchema>;

const orderStatTypes = ["stop", "operational"] as const;

export const orderStatSchema = z.object({
  createdAt: z.date(),
  type: z.enum(orderStatTypes),
});

export type OrderStatType = (typeof orderStatTypes)[number];
export type OrderStat = z.infer<typeof orderStatSchema>;

export const GlobalMasterStateSchema = z.object({
  id: z.literal("master-state"),
  orderStats: z.array(orderStatSchema),
});

export type GlobalMasterState = z.infer<typeof GlobalMasterStateSchema>;

export const globalStatSchema = z.union([
  GlobalCashierStateSchema,
  GlobalMasterStateSchema,
]);

export type GlobalStat = z.infer<typeof globalStatSchema>;

export class MasterStateEntity implements GlobalMasterState {
  constructor(
    public id: "master-state",
    private _orderStats: OrderStat[],
  ) {}

  static fromMasterState(state: GlobalMasterState): MasterStateEntity {
    return new MasterStateEntity(state.id, state.orderStats);
  }

  static createNew(): MasterStateEntity {
    return new MasterStateEntity("master-state", []);
  }

  get orderStats() {
    return this._orderStats;
  }

  addOrderStat(stat: OrderStatType) {
    this._orderStats.push({
      createdAt: new Date(),
      type: stat,
    });
  }
}
