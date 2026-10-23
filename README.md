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
records the original byte-for-byte transfer of six approved Studio files,
their source revision and hashes, and the accepted Delivery references.
Original owner bootstrap provenance is retained separately. The browser policy
landed with the first application source unit; the later manifest change
consumes that accepted base.

The [initial product owner manifest](product-publication/manifest.json) binds
the accepted application snapshot, completed native graduation and active
product registration. Its `owner_revision` is that earlier source snapshot;
the later merged commit containing the manifest is the distinct manifest
revision. This manifest and guidance update preserves all six imported files
and their original mapping hashes.

The product's current governed endpoint is owner-managed source. The manifest
records no managed runtime or release and starts from an unlisted posture.
Internal Publication, its canonical receipt and fresh-browser recovery must be
completed separately through the Console. That operation does not host the app
or change how its browser-local data is stored.

This root README is the current owner operating procedure. The imported
`app/README.md` remains byte-for-byte source provenance under the accepted
six-file preservation boundary; its incubation-era instructions about future
Studio graduation are historical. Native graduation has completed and this
repository is the active durable source owner. Source1 and its import record
are preserved by the later manifest/documentation change.
