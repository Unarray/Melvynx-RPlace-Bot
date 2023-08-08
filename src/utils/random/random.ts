export const randomIP = (): string => {
  const randomByte = (): number => Math.floor(Math.random() * 255) + 1;

  return `${randomByte()}.${randomByte()}.${randomByte()}`;
};