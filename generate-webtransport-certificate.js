import { writeFileSync } from "node:fs";
// https://github.com/achingbrain/webtransport-echo-server
import { generateWebTransportCertificates } from "./wt-certificate-bundle.js";
const certificates = await generateWebTransportCertificates([
  { shortName: "C", value: "US" },
  { shortName: "ST", value: "Los Angeles" },
  { shortName: "L", value: "Los Angeles" },
  { shortName: "O", value: "WebTransport Test Server" },
  { shortName: "CN", value: "127.0.0.1" },
], [{
  // can be max 14 days according to the spec
  days: 13,
}]);
// Generate certificate, once, serialize to JSON, write to files ystem
certificates[0].hash.digest = [...new Uint8Array(certificates[0].hash.digest)];
certificates[0].hash.bytes = [...certificates[0].hash.bytes];

writeFileSync("cert.json", JSON.stringify(certificates, null, 2));
