import { type ClientActionFunction } from "@remix-run/react";

import { createOrder, updateOrder } from "./actions/addOrder";
import { deleteOrder } from "./actions/deleteOrder";

export const clientAction: ClientActionFunction = async (args) => {
  const { request } = args;
  switch (request.method) {
    case "POST":
      return createOrder(args);
    case "DELETE":
      return deleteOrder(args);
    case "PUT":
      return updateOrder(args);
    default:
      console.error("Invalid method", request.method);
      return new Response(null, { status: 405 });
  }
};
