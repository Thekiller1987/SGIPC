const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Registrar matchers personalizados solo cuando Jest ya esté cargado
if (typeof expect !== "undefined") {
  require("@testing-library/jest-dom");
}
