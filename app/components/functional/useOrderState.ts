import { useReducer } from "react";
import type { WithId } from "~/lib/typeguard";
import type { ItemEntity } from "~/models/item";
import { OrderEntity } from "~/models/order";

type Clear = { type: "clear"; effectFn?: () => void };
type UpdateOrderId = { type: "updateOrderId"; orderId: number };
type AddItem = {
  type: "addItem";
  item: WithId<ItemEntity>;
};
type MutateItem = {
  type: "mutateItem";
  idx: number;
  action: (prev: WithId<ItemEntity>) => WithId<ItemEntity>;
};
type ApplyDiscount = {
  type: "applyDiscount";
  discountOrder: WithId<OrderEntity>;
};
type RemoveDiscount = { type: "removeDiscount" };
type SetReceived = { type: "setReceived"; received: string };
type SetDescription = { type: "setDescription"; description: string };

export type OrderAction =
  | Clear
  | UpdateOrderId
  | AddItem
  | MutateItem
  | ApplyDiscount
  | RemoveDiscount
  | SetReceived
  | SetDescription;

type OrderReducer<T extends OrderAction> = (
  state: OrderEntity,
  action: T,
) => OrderEntity;

const clear: OrderReducer<Clear> = (state, action) => {
  const effectFn = action.effectFn;
  if (effectFn) {
    effectFn();
  }
  return OrderEntity.createNew({ orderId: state.orderId });
};

const updateOrderId: OrderReducer<UpdateOrderId> = (state, action) => {
  const updated = state.clone();
  updated.orderId = action.orderId;
  return updated;
};

const addItem: OrderReducer<AddItem> = (state, action) => {
  const updated = state.clone();
  updated.items = [...updated.items, action.item];
  return updated;
};

const mutateItem: OrderReducer<MutateItem> = (state, action) => {
  const updated = state.clone();
  updated.items[action.idx] = action.action(updated.items[action.idx]);
  return updated;
};

const applyDiscount: OrderReducer<ApplyDiscount> = (state, action) => {
  const updated = state.clone();
  updated.applyDiscount(action.discountOrder);
  return updated;
};

const removeDiscount: OrderReducer<RemoveDiscount> = (state, action) => {
  const updated = state.clone();
  updated.removeDiscount();
  return updated;
};

const setReceived: OrderReducer<SetReceived> = (state, action) => {
  const updated = state.clone();
  updated.received = Number(action.received);
  return updated;
};

const setDescription: OrderReducer<SetDescription> = (state, action) => {
  const updated = state.clone();
  updated.description = action.description;
  return updated;
};

const reducer: OrderReducer<OrderAction> = (state, action): OrderEntity => {
  switch (action.type) {
    case "clear":
      return clear(state, action);
    case "applyDiscount":
      return applyDiscount(state, action);
    case "removeDiscount":
      return removeDiscount(state, action);
    case "addItem":
      return addItem(state, action);
    case "mutateItem":
      return mutateItem(state, action);
    case "setReceived":
      return setReceived(state, action);
    case "setDescription":
      return setDescription(state, action);
    case "updateOrderId":
      return updateOrderId(state, action);
  }
};

const useOrderState = () =>
  useReducer(reducer, OrderEntity.createNew({ orderId: -1 }));

export { useOrderState };
