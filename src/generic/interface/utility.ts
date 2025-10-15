export type MakeFieldPartial<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
