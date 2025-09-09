(async () => {
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
    console.log("WebTransport client ready");

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
    console.log({ outgoingTotalLength });
    let incomingTotalLength = 0;
    const writer = writable.getWriter();
    await writer.ready;
    await writer.write(header).then(() =>
      console.log(`Outgoing total length ${outgoingTotalLength} written.`)
    );
    await writer.ready;
    await writer.write(data)
      .then(() => console.log(`${data.length} bytes written.`)).catch((e) =>
        console.log(e)
      );
    await writer.ready;
    await writer.close();
    for await (const value of readable) {
      incomingTotalLength += value.length;
      if (incomingTotalLength === outgoingTotalLength) {
        console.log({ incomingTotalLength, outgoingTotalLength });
        break;
      }
    }
    client.close({ closeCode: 4999, reason: "Done streaming." });
    await client.closed
      .then(console.log).catch(console.warn);
  } catch (e) {
    console.log(e);
  }
})().catch((e) => {
  console.log(e);
});
