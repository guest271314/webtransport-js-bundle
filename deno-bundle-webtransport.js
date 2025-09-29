import $ from "jsr:@david/dax";

await $`deno clean`;
await $`rm -rf node_modules deno.json deno.lock`;
await $`deno install npm:@fails-components/webtransport-transport-http3-quiche \
npm:@fails-components/webtransport \
--allow-scripts=npm:@fails-components/webtransport-transport-http3-quiche \
--node-modules-dir=auto`;
const patches = {
  "node_modules/@fails-components/webtransport-transport-http3-quiche/lib/clientsocket.js":
    "https://raw.githubusercontent.com/guest271314/webtransport-1/refs/heads/guest271314-patch-1/transports/http3-quiche/lib/clientsocket.js",
  "node_modules/@fails-components/webtransport-transport-http3-quiche/lib/serversocket.js":
    "https://raw.githubusercontent.com/guest271314/webtransport-1/refs/heads/guest271314-patch-1/transports/http3-quiche/lib/serversocket.js",
};
for (const [file, url] of Object.entries(patches)) {
  console.log(`Fetching patch ${url} for ${file}\n`);
  await $`echo ${await (await fetch(url)).text()} > ${$.path(file)}`;
}
await $`deno bundle --allow-scripts=npm:@fails-components/webtransport-transport-http3-quiche export-webtransport-client.js --node-modules-dir=auto -o webtransport-client-bundle.js`;
await $`deno bundle --allow-scripts=npm:@fails-components/webtransport-transport-http3-quiche export-webtransport-server.js --node-modules-dir=auto -o webtransport-server-bundle.js`;
await $`cat ./node_modules/@fails-components/webtransport-transport-http3-quiche/build/Release/webtransport.node > ${
  $.path("webtransport.node")
}`;
await $`deno -A generate-webtransport-certificate.js`;
const serverBundle = (await $`cat webtransport-server-bundle.js`.text())
  .replace('buildpath + "/Release/webtransport.node"', `"./webtransport.node"`)
  // Replace duplicate createRequire import output by deno bundle
  .replace('import { createRequire } from "node:module";', "").trim();
await $`echo ${serverBundle} > ${$.path("webtransport-server-bundle.js")}`;
const clientBundle = (await $`cat webtransport-client-bundle.js`.text())
  .replace('buildpath + "/Release/webtransport.node"', `"./webtransport.node"`)
  // Replace duplicate createRequire import output by deno bundle
  .replace('import { createRequire } from "node:module";', "").trim();
await $`rm ${$.path("webtransport-client-bundle.js")}`;
await $`echo ${clientBundle} > ${$.path("webtransport-client-bundle.js")}`;
const [{ hash: { digest } }] = await $`cat cert.json`.json();
const clientScript = (await $`cat wt-client.js`.text()).replace(
  /CERT_DIGEST.+(?=;)/,
  `CERT_DIGEST = new Uint8Array(${JSON.stringify(digest)})`,
).trim();
await $`rm ${$.path("wt-client.js")}`;
await $`echo ${clientScript} > ${$.path("wt-client.js")}`;
const clientScriptHTML = `<script type="module">\n${clientScript}\n</script>`;
await $`printf ${clientScriptHTML} > ${$.path("wt-client.html")}`;
await $`rm -rf node_modules deno.json deno.lock`;
await $`deno clean`;
