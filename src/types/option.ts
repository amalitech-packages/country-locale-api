export interface LocaleOption {
  key: string;
  label: string;
  countryName?: string;
}

export type NumberFormatOption = Pick<LocaleOption, 'key' | 'label' | 'countryName'>;

export type DateFormatOption = Pick<LocaleOption, 'key' | 'label' | 'countryName'>;
