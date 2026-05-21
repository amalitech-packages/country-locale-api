export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface NumberFormat {
  decimalSeparator: string;
  thousandSeparator: string;
  example: string;
}

export interface Country {
  code: string;
  flag: string;
  phoneCode: string;
  name: string;
  aliases?: readonly string[];
  locale: string;
  timezone?: string;
  timezones?: string[];
  utcOffset?: string;
  utcOffsets?: string[];
  currency: Currency;
  dateFormat: string;
  timeFormat: string;
  numberFormat: NumberFormat;
}
