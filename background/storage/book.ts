import type { AddressType } from "config/wallet";

export interface IAddressBookRecord {
  name: string;
  address: string;
  addrType: AddressType;
}
