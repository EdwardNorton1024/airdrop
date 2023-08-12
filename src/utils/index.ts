export function hex2string(hex: string, charset: BufferEncoding = undefined) {
  if (!hex.startsWith('0x')) hex = '0x' + hex;
  return Buffer.from(hex.toString().slice(2), 'hex').toString(charset);
}

export function sequential(
  context: any,
  fn_list: ((...params: any) => Promise<any>)[],
  arg: any,
  index = 0,
) {
  if (index >= fn_list.length) return Promise.resolve(arg);
  return fn_list[index]
    .bind(context)(arg)
    .then((res) => sequential(context, fn_list, res, index + 1));
}
