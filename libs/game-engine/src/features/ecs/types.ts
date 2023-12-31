import type { ECSComponent } from './ECSComponent';

export type BrandFromComponent<C extends ECSComponent<string>> =
  C extends ECSComponent<infer Brand> ? Brand : never;

export type BrandsFromComponents<C extends ECSComponent<string>[]> = {
  [Key in keyof C]: BrandFromComponent<C[Key]>;
};

export type ECSComponentProps<C extends ECSComponent<string>> =
  C extends ECSComponent<any, infer Props> ? Props : never;
