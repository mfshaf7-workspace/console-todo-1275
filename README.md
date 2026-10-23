# console-todo-1275
Simple real to-do web application for the approved Epic 1275 Console-only idea-to-product acceptance: add, complete, delete and reload-persistent tasks.

The existing nine task-unit cases and exact base/head Git check are unconditional
source evidence for this ordinary application. They run even when no Architecture
Packet conformance cases apply. Bootstrap checks still prove owner controls
only; application tests run once the application is present. Browser operating
evidence remains a separate accepted-source verification step.

The application source is in [`app/`](app/README.md). It starts with an empty
list and stores tasks in this browser only. It has no account, backend or cloud
synchronization. Add tasks, toggle completion and delete an exact task; reloads
and same-origin tabs retain the stored list. Storage errors are shown without
reporting an unsaved change as successful.

Run `npm test` for the nine task-transition and storage-codec tests. To inspect
the app locally, serve `app/` on loopback, for example:

```sh
python3 -m http.server 8035 --bind 127.0.0.1 --directory app
```

The portable browser check uses the locked development dependency:

```sh
npm ci --ignore-scripts --no-audit
node node_modules/playwright/cli.js install chromium --only-shell
npm run test:browser
```

It runs seven serial cases against a disposable loopback server and browser
contexts, then closes both. Storage-write denial and corrupt storage are
explicit synthetic negative cases; the application itself contains no seeded
tasks or fixture fallback. These engineering checks do not create graduation,
product admission or Publication receipts. Normal source acceptance and those
domain operations remain in the Console.

[`records/prototype-source-imports/proposal-1305.json`](records/prototype-source-imports/proposal-1305.json)
records the six unchanged approved Studio files, their exact source revision
and hashes, and the already accepted Delivery references. Original owner
bootstrap provenance is retained separately. The browser policy is reviewed in
this source unit so later work can consume its actual accepted base.
