import { ConfigService as NestConfigService } from '@nestjs/config';
import { Configuration } from '../../config';

declare global {
  interface JSON {
    parse(
      text: string,
      reviver?: (key: string, value: unknown) => unknown,
    ): unknown;
  }
}

declare module '@nestjs/config' {
  type ObjectPaths<T extends object> = {
    [K in keyof T]: T[K] extends object
      ? K extends string
        ? K | `${K}.${ObjectPaths<T[K]>}`
        : never
      : K extends string
        ? K
        : never;
  }[keyof T];

  type TypeAtPath<
    T extends object,
    Path extends string,
  > = Path extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? T[K] extends object
        ? TypeAtPath<T[K], Rest>
        : never
      : never
    : Path extends keyof T
      ? T[Path]
      : never;

  class ConfigService<
    K = Configuration,
    WasValidated extends boolean = true,
  > extends NestConfigService<K, WasValidated> {
    constructor(config: K);
    get<Path extends ObjectPaths<K> = ObjectPaths<K>>(
      propertyPath: Path,
    ): TypeAtPath<K, Path>;
    getOrThrow<Path extends ObjectPaths<K> = ObjectPaths<K>>(
      propertyPath: Path,
    ): TypeAtPath<K, Path>;
  }
}
