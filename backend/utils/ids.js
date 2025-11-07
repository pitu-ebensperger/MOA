import { customAlphabet } from 'nanoid';

const nano4 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);
const nano6 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export const newPublicId = () => customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)();

export const newSku = (catPrefix = 'GEN', seq = 1) =>
  `${catPrefix}-${customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)()}-${String(seq).padStart(4, '0')}`;

export const newOrderCode = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `MOA-${y}${m}${d}-${nano4()}`;
};