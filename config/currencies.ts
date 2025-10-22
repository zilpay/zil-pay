export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export const CURRENCIES: Currency[] = [
  { code: "BTC", name: "Bitcoin", symbol: "₿" },
  { code: "ETH", name: "Ethereum", symbol: "Ξ" },
  { code: "LTC", name: "Litecoin", symbol: "Ł" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "CHF", name: "Swiss Franc", symbol: "₣" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SOL", name: "Solana", symbol: "◎" },
  { code: "USDT", name: "Tether", symbol: "₮" },
  { code: "DOGE", name: "Dogecoin", symbol: "Ð" },
  { code: "GOLD", name: "Gold", symbol: "Au" },
  { code: "SILVER", name: "Silver", symbol: "Ag" },
  { code: "OIL", name: "Oil", symbol: "🛢️" },
  { code: "GAS", name: "Gas", symbol: "⛽" },
  { code: "PLAT", name: "Platinum", symbol: "Pt" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "XMR", name: "Monero", symbol: "ɱ" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£" },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
];

const CURRENCY_MAP = new Map<string, string>(
  CURRENCIES.map((c) => [c.code, c.symbol]),
);

export const getCurrencySymbol = (code: string): string => {
  return CURRENCY_MAP.get(code) ?? code;
};

export const getCurrency = (code: string): Currency | undefined => {
  return CURRENCIES.find((c) => c.code === code);
};
