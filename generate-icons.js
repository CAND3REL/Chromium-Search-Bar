const fs = require('fs');
const zlib = require('zlib');

const sizes = [16, 32, 48, 128];

// CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function createIHDR(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data.writeUInt8(8, 8);  // bit depth
  data.writeUInt8(6, 9);  // color type (RGBA)
  data.writeUInt8(0, 10); // compression
  data.writeUInt8(0, 11); // filter
  data.writeUInt8(0, 12); // interlace
  return createChunk('IHDR', data);
}

// Create a search icon PNG
function createSearchIconPNG(size) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.28;
  const lineWidth = Math.max(2, size * 0.12);

  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter byte for each row
    for (let x = 0; x < size; x++) {
      // Calculate distance from center for the magnifying glass circle (offset slightly up-left)
      const dx = x - centerX + size * 0.1;
      const dy = y - centerY - size * 0.1;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if point is on the circle outline
      const onCircle = Math.abs(dist - radius) < lineWidth / 2;

      // Check if point is on the handle (diagonal line from circle)
      const handleStartX = centerX + radius * 0.707 - size * 0.1;
      const handleStartY = centerY + radius * 0.707 + size * 0.1;
      const handleLength = size * 0.3;

      const hx = x - handleStartX;
      const hy = y - handleStartY;
      const handleAngle = Math.PI / 4;
      const proj = hx * Math.cos(handleAngle) + hy * Math.sin(handleAngle);
      const perpDist = Math.abs(-hx * Math.sin(handleAngle) + hy * Math.cos(handleAngle));
      const onHandle = proj >= 0 && proj <= handleLength && perpDist < lineWidth / 2;

      if (onCircle || onHandle) {
        // Kagi-inspired orange/amber color (#FF8C00 - Dark Orange)
        rawData.push(255, 140, 0, 255); // RGBA
      } else {
        // Transparent
        rawData.push(0, 0, 0, 0);
      }
    }
  }

  // Compress with zlib
  const compressed = zlib.deflateSync(Buffer.from(rawData));

  const ihdr = createIHDR(size, size);
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate icons
sizes.forEach(size => {
  const filename = `icons/icon${size}.png`;
  const png = createSearchIconPNG(size);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
});

console.log('Icons generated successfully!');
