import { $ } from "bun";
const pwd = (await $`pwd`.text()).trim();
await $`bun pm cache rm`.nothrow().quiet();
await $`rm -rf node_modules package.json bun.lock webtransport-server-bundle.js webtransport-client-bundle.js webtransport.node`;
await $`bun add @fails-components/webtransport`.nothrow().quiet();
await $`bun install --trust @fails-components/webtransport-transport-http3-quiche`;
await $`bun build export-webtransport-server.js --target=node --outfile=${pwd}/webtransport-server-bundle.js`;
await $`bun build export-webtransport-client.js --target=node --outfile=${pwd}/webtransport-client-bundle.js`;
await $`cat ${pwd}/node_modules/@fails-components/webtransport-transport-http3-quiche/build/Release/webtransport.node > ${pwd}/webtransport.node`;
await $`bun generate-webtransport-certificate.js`;
const serverBundle = (await $`cat webtransport-server-bundle.js`.text())
  .replace(/wtpath.+;/, `wtpath = "./webtransport.node";`).trim();
await $`rm ${pwd}/webtransport-server-bundle.js`;
await $`echo ${serverBundle} > ${pwd}/webtransport-server-bundle.js`;
const clientBundle = (await $`cat webtransport-client-bundle.js`.text())
  .replace(/wtpath.+;/, `wtpath = "./webtransport.node";`).trim();
await $`rm ${pwd}/webtransport-client-bundle.js`;
await $`echo ${clientBundle} > ${pwd}/webtransport-client-bundle.js`;
const [{ hash: { digest } }] = await $`cat cert.json`.json();
const clientScript = (await $`cat wt-client.js`.text()).replace(
  /CERT_DIGEST.+(?=;)/,
  `CERT_DIGEST = new Uint8Array(${JSON.stringify(digest)});`,
).trim();
await $`rm ${pwd}/wt-client.js`;
await $`echo ${clientScript} > ${pwd}/wt-client.js`;
await $`bun pm cache rm`.nothrow().quiet();
await $`rm -rf node_modules bun.lock`;
