/*
  ~/firefox/firefox-bin -headless -P wt wt-client.html | grep WEBTRANSPORT_CLIENT
  ~/chrome-linux/chrome --headless --enable-logging=stderr --disable-gpu --password-store=basic wt-client.html 2>&1 | grep WEBTRANSPORT_CLIENT
  node --no-warnings wt-client.js
  bun --no-warnings wt-client.js
  DENO_COMPAT=1 deno -A wt-client.js
*/
;(async () => {
  globalThis.WT_CLIENT = `WEBTRANSPORT_CLIENT: `;
  const CERT_DIGEST = new Uint8Array();
  try {
    const serverCertificateHashes = [
      {
        "algorithm": "sha-256",
        "value": CERT_DIGEST,
      },
    ];
    if (!Object.hasOwn(globalThis, "WebTransport")) {
      let { WebTransport, quicheLoaded } = await import(
        "./webtransport-client-bundle.js"
      );
      await quicheLoaded;
      globalThis.WebTransport = WebTransport;
    }
    const client = new WebTransport(
      `https://127.0.0.1:8080`,
      {
        serverCertificateHashes,
      },
    );

    await client.ready;
    console.log(`${WT_CLIENT}WebTransport client ready.`);

    const { readable, writable } = await client.createBidirectionalStream();
    let data = new Uint8Array(1024 ** 2 * 20);

    let header = new Uint8Array(Uint32Array.from(
      {
        length: 4,
      },
      (_, index) => (data.length >> (index * 8)) & 0xff,
    ));
    let view = new DataView(header.buffer);
    let outgoingTotalLength = view.getUint32(0, true);
      console.log(`${WT_CLIENT}${JSON.stringify({outgoingTotalLength})}`);
    let incomingTotalLength = 0;
    const writer = writable.getWriter();
    await writer.ready;
    await writer.write(header).then(() =>
      console.log(
        `${WT_CLIENT}Outgoing total length ${outgoingTotalLength} written.`,
      )
    );
    await writer.ready;

    await writer.write(data)
      .then(() => console.log(`${WT_CLIENT}${data.length} bytes written.`))
      .catch((e) => {
        console.log(`${WT_CLIENT}${e.message}`);
      });

    await writer.ready;
    await writer.close();
    for await (const value of readable) {
      incomingTotalLength += value.length;
      if (incomingTotalLength === outgoingTotalLength) {
        console.log(
          `${WT_CLIENT}${
            JSON.stringify({ incomingTotalLength, outgoingTotalLength })
          }`,
        );
        break;
      }
    }
    client.close({ closeCode: 4999, reason: "Done streaming." });
    return await client.closed
      .then((result) => console.log(`${WT_CLIENT}${JSON.stringify(result)}`))
      .catch((e) => {
        console.log(`${WT_CLIENT}${e.message}`);
      });
  } catch (e) {
    console.log(`${WT_CLIENT}${e.message}`);
  }
})()
  .catch((e) => {
    console.log(`${WT_CLIENT}${e.message}`);
  })
  .then(() => console.log(`${WT_CLIENT}${navigator.userAgent} closing.`))
  .finally(() => globalThis?.window?.close());
