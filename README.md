# webtransport-js-bundle

[@fails-components/webtransport](https://github.com/fails-components/webtransport)
server and client bundled with Bun. Based on [achingbrain/webtransport-echo-server](https://github.com/achingbrain/webtransport-echo-server).
Self-signed certificate generation uses [certificate.js](https://github.com/achingbrain/webtransport-echo-server/blob/main/certificate.js).

## Details

`@fails-components/webtransport` depends on [`libquiche`](https://github.com/google/quiche), which is written to `webtransport.node`
using Node.js [Addons](https://nodejs.org/api/addons.html). Deno does not support running `.node` files. Deno does have
it's own `WebTransport` server and client implementations, exposed with `--unstable-net`
flag. Deno's server implementation halts when echoing around 8 MB, and does not
propagate `closeCode` and `reason` when closing the connection. Bun exits with 
an `Napi::Error`, though still completes the request. Chromium and Firefox (with `network.http.speculative-parallel-limit` set to `0` in `about:config`, see https://bugzilla.mozilla.org/show_bug.cgi?id=1955877#c27)
browser clients both exit without errors.


## Usage

### Install and bundle dependencies

```
bun bundle-webtransport.js
```

After fetching dependencies and bundling `webtransport-server-bundle.js`
and `webtransport-client-bundle.js` to standalone scripts the created `node_modules` folder is
deleted.

### Server

```
node --no-warnings wt-server.js
```

```
bun --no-warnings wt-server.js
```

### Client

```
node wt-client.js
```

```
bun wt.client.js
```

```
deno -A --unstable-net wt-client.js
```

The server and client code in this repository uses the Native Messaging 
protocol to keep track of the length of the messages sent and received both ways.

The client sends 20 MB, and the server echoes 20 MB back to the client.

## TODO

- Compile the relevant `libquiche` dependencies to WASM, and port to JavaScript
- Create a public WebTransport echo server using this source code

# Licenses

- @fails-components/webtransport license is [BSD-3-Clause](https://github.com/guest271314/webtransport-1/blob/master/package.json#L13C15-L13C27)
- achingbrain/webtransport-echo-server
license is [ISC](https://github.com/achingbrain/webtransport-echo-server/blob/main/package.json#L11).

The license for this repository is Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)

