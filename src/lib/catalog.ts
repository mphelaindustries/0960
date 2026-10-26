import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getReceipt, getSettings, listProducts } from "./catalog.functions";

export const productsQuery = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });
export const settingsQuery = queryOptions({ queryKey: ["settings"], queryFn: () => getSettings() });
export const receiptQuery = (id: string) =>
  queryOptions({ queryKey: ["receipt", id], queryFn: () => getReceipt({ data: { id } }) });

export function useProducts() {
  return useSuspenseQuery(productsQuery).data;
}
export function useSettings() {
  return useSuspenseQuery(settingsQuery).data;
}
