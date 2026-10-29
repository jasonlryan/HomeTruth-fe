import { decodePixels } from './CodeScanner';
import code from './fixtures/code.json';
test('real QR pixels decode locally without a provider request', async () => {
  const scale = 4,
    border = 4,
    size = (code.rows.length + border * 2) * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const row = Math.floor(y / scale) - border,
      col = Math.floor(x / scale) - border;
    if (code.rows[row]?.[col] === '1') {
      const i = (y * size + x) * 4;
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
    }
  }
  expect(await decodePixels(pixels, size, size)).toBe(code.text);
});
test('a blank photo gives no false code', async () => {
  expect(await decodePixels(new Uint8ClampedArray(40 * 40 * 4).fill(255), 40, 40)).toBeNull();
});
