import { z } from "zod";
import { orderSchema } from "./order";

export const globalCashierStateSchema = z.object({
  id: z.literal("cashier-state"),
  edittingOrder: orderSchema,
  submittedOrderId: z.string().nullable(),
});

export type GlobalCashierState = z.infer<typeof globalCashierStateSchema>;

export const orderStatTypes = ["stop", "operational"] as const;

export const orderStatSchema = z.object({
  createdAt: z.date(),
  type: z.enum(orderStatTypes),
});

export type OrderStatType = (typeof orderStatTypes)[number];
export type OrderStat = z.infer<typeof orderStatSchema>;

export const globalMasterStateSchema = z.object({
  id: z.literal("master-state"),
  orderStats: z.array(orderStatSchema),
});

export type GlobalMasterState = z.infer<typeof globalMasterStateSchema>;

export const globalStatSchema = z.union([
  globalCashierStateSchema,
  globalMasterStateSchema,
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
    const initOrderStat: OrderStat = {
      createdAt: new Date(),
      type: "operational",
    };
    return new MasterStateEntity("master-state", [initOrderStat]);
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
