export function hex2string(hex) {
  const arr = hex.split('');
  let out = '';
  for (let i = 0; i < arr.length / 2; i++) {
    const tmp = '0x' + arr[i * 2] + arr[i * 2 + 1];
    const charValue = String.fromCharCode(tmp as any);
    out += charValue;
  }
  return out;
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
