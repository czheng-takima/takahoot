
export function hexStringToByte(byteAsHexStr: string) {
  return parseInt(byteAsHexStr, 16);
}

export function hexStringToBytes(hexStr: string) {
  const SEPARATORS = new RegExp('[-:]', 'g');
  let str = hexStr.replace(SEPARATORS,'');
  let size = str.length / 2;
  let bytes = new Uint8Array(size + 2);
  for (let i = 0; i < size; ++i) {
    bytes[i] = this.hexStringToByte(str.substr(2 *  i, 2));
  }
  bytes[size] = 0x0D;
  bytes[size + 1] = 0x0A;
  return bytes;
}

export function byteToHexString(byte: number) {
  return (((byte & 0xF0) >> 4).toString(16) + (byte & 0x0F).toString(16)).toLowerCase();
}

export function bytesToPrettyHexString(bytes: Array<number>) {
  let hex = '';
  for (let byte of bytes) {
    if (hex.length > 0) {
      hex += ':';
    }
    hex += this.byteToHexString(byte);
  }
  return hex.toLowerCase();
}

export function buf2hex(buffer: ArrayBuffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), (x: number) => ('00' + x.toString(16)).slice(-2)).join('');
}
