import fs from "node:fs";
import { orderRepository } from "common/repositories/order";

const orderEntities = await orderRepository.findAll();
const orders = orderEntities.map((order) => order.toOrder());

const output = { orders };

fs.writeFileSync("orders.json", JSON.stringify(output, null, 2));
