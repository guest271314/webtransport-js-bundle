/*
  node wt-server.js
  bun wt-server.js
  DENO_COMPAT=1 deno -A wt-server.js
*/
import { Http3Server } from "./webtransport-server-bundle.js";
import certificates from "./cert.json" with { type: "json" };
const server = new Http3Server({
  port: 8080,
  host: "127.0.0.1",
  secret: certificates[0].secret,
  cert: certificates[0].pem,
  privKey: certificates[0].privateKey,
});
await server.startServer();
await server.ready;
const address = server.address();
const sessionStream = server.sessionStream("/");
const sessionReader = sessionStream.getReader();
console.info("WebTransport server started");

let streams = 0;
let clients = 0;
while (true) {
  try {
    const { value: session, done } = await sessionReader.read();
    if (done) {
      break;
    }
    console.log(session.closed);
    let incomingTotalLength = 0;
    let incomingCurrentLength = 0;
    const buffer = new ArrayBuffer(0, { maxByteLength: 4 });
    const view = new DataView(buffer);
    for await (
      const { readable, writable } of session.incomingBidirectionalStreams
    ) {
      const writer = writable.getWriter();
      await readable.pipeTo(
        new WritableStream({
          async write(value) {
            if (incomingTotalLength === 0 && incomingCurrentLength === 0) {
              buffer.resize(4);
              for (let i = 0; i < 4; i++) {
                view.setUint8(i, value[i]);
              }
              incomingTotalLength = view.getUint32(0, true);
              console.log(value.length, incomingTotalLength);
              value = value.subarray(4);
            }
            await writer.ready;
            await writer.write(value);
            await writer.ready;
            incomingCurrentLength += value.length;
            // console.log(
            //  `Done writing ${value.length} bytes to writable, ${incomingCurrentLength} of ${incomingTotalLength} bytes written.`,
            // );
          },
          close() {
            console.log("WebTransport readable closed");
          },
        }),
      ).then(() => console.log("WebTransport writable closed")).catch((e) => console.log(e));
      buffer.resize(0);
      incomingTotalLength = 0;
      incomingCurrentLength = 0;
      await writer.close();
      await writer.closed;
      console.log(`Stream ${streams++}`);
    }
  await session.closed.then(() => console.log("Session done"))
  .catch((e) => e.message);
  } catch (e) {
    console.log(e);
  }
  console.log(`Clients ${clients++}`);
}
