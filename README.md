# webtransport-js-bundle

[@fails-components/webtransport](https://github.com/fails-components/webtransport)
server and client, modified to support Node.js, Deno, and Bun, bundled. Based on [achingbrain/webtransport-echo-server](https://github.com/achingbrain/webtransport-echo-server).
Self-signed certificate generation uses [certificate.js](https://github.com/achingbrain/webtransport-echo-server/blob/main/certificate.js).

## Details

`@fails-components/webtransport` depends on [`libquiche`](https://github.com/google/quiche), which is written to `webtransport.node`
using Node.js [Addons](https://nodejs.org/api/addons.html). 

Server tested using `node`, `bun`, `deno`. Clients tested using `node`, `bun`, `deno`, `chrome`, `firefox`. `deno` client completes sending and getting data back from server, then exits with `Segmentation fault`. 

For testing with Firefox client set `network.http.speculative-parallel-limit` set to `0` in `about:config`, see https://bugzilla.mozilla.org/show_bug.cgi?id=1955877#c27.


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
node wt-server.js
```

```
bun wt-server.js 
```

```
DENO_COMPAT=1 deno -A wt-server.js 
```

### Client

```
node wt-client.js
```

```
bun wt.client.js 
```

```
NODE_OPTIONS=--no-warnings DENO_COMPAT=1 deno -A wt-client.js
```

For Firefox headless, create profile
```
$HOME/firefox/firefox-bin -CreateProfile wt
```

set preference to print `console.log()` calls to `STDOUT`

```
printf "user_pref('devtools.console.stdout.content', true);\n" > "$HOME/.mozilla/firefox/$(ls $HOME/.mozilla/firefox | grep '\.wt')/user.js"
```

then launch `firefox` with URL `wt-client.html`, pipe through `node` to close `firefox` when done

```
$HOME/firefox/firefox-bin -headless -P wt wt-client.html | grep WEBTRANSPORT_CLIENT:
```

For Chromium headless

```
$HOME/chrome-linux/chrome --headless --enable-logging=stderr --disable-gpu --password-store=basic wt-client.html 2>&1 | grep WEBTRANSPORT_CLIENT
```

For V8 Inspector Protocol

```
NODE_OPTIONS=--no-warnings DENO_COMPAT=1 deno -A --inspect-wait wt-client.js
```

```
node --no-warnings --inspect-wait wt-client.js
```

navigate to `chrome://inspect` and click "inspect".

For Bun

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

