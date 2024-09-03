import { type ClientActionFunction } from "@remix-run/react";
import { deleteItem } from "./actions/deleteItem";

import { addItem } from "./actions/addItem";

export const action: ClientActionFunction = async (args) => {
  const { request } = args;
  switch (request.method) {
    case "POST":
      return addItem(args);
    case "DELETE":
      return deleteItem(args);
    default:
      console.error("Invalid method", request.method);
      return new Response(null, { status: 405 });
  }
};
