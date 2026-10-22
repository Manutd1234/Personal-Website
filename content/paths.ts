export const assetBase = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) =>
  `${assetBase}/${path.replace(/^\//, "")}`;
