import { Address } from 'oracle-contract';
export const formatShortAddress = (
  inputString: string | null | undefined | typeof Address,
  maxLength = 20
) => {
  // if (typeof inputString !== "string") {
  //   console.error(`Expected a string but received: ${inputString}`);
  //   return inputString ? String(inputString).substring(0, 4) + '...' : "";
  // }

  if (String(inputString).length <= maxLength) return inputString;
  const prefixLength = Math.floor((maxLength - 3) / 2);
  const suffixLength = maxLength - prefixLength - 3;
  const prefix = String(inputString).substring(0, prefixLength);
  const suffix = String(inputString).substring(String(inputString).length - suffixLength);
  return `${prefix}...${suffix}`;
};

export const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};
