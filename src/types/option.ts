export interface LocaleOption {
  key: string;
  label: string;
  countryName?: string;
}

export type NumberFormatOption = Pick<LocaleOption, 'key' | 'label' | 'countryName'>;
