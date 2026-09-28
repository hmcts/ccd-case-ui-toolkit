# Source-host coverage baseline

This inventory describes synthetic browser contracts implemented in `playwright_tests/tests/`. It is a review map, not a line/branch coverage report or a claim of complete toolkit migration. A listed test is implemented coverage; passing status requires the matching run evidence. Existing Karma/Jasmine tests remain in place.

Paths below are relative to the repository root. **Covered** means the named bounded contract has executable assertions. **Partial** identifies a material remaining component contract. **Consumer-owned** means deployed integration needs evidence from the application/service owner. No row implies that every permutation is covered.

| Domain | Executable specs | Named contract and boundary |
| --- | --- | --- |
| 1. Primitive controls | `playwright_tests/tests/mandatory-fields.positive.spec.ts`; `playwright_tests/tests/mandatory-fields.negative.spec.ts` | Covered: text, number, email, UK phone, textarea, Yes/No and fixed-list/radio/multiselect binding and required-state correction. Partial: exhaustive format/length/configuration combinations. |
| 2. Field form composition | `playwright_tests/tests/field-form.positive.spec.ts`; `playwright_tests/tests/field-form.negative.spec.ts` | Covered: editable/read-only coexistence and required-value clearing/recovery. Consumer-owned: persisted case submission. |
| 3. Date | `playwright_tests/tests/date-input.positive.spec.ts`; `playwright_tests/tests/date-input.negative.spec.ts` | Covered: ISO binding, partial/cleared input and correction. Partial: complete calendar and locale boundary matrix. |
| 4. Date-time | `playwright_tests/tests/date-time-input.positive.spec.ts`; `playwright_tests/tests/date-time-input.negative.spec.ts` | Covered: configured entry format, binding and mandatory correction. Partial: daylight-saving and cross-timezone permutations. |
| 5. Money | `playwright_tests/tests/money-field.positive.spec.ts`; `playwright_tests/tests/money-field.negative.spec.ts` | Covered: pounds/pence binding, malformed input and required-value recovery. Partial: exhaustive numeric boundaries. |
| 6. Dynamic lists, postcode and rich text | `playwright_tests/tests/advanced-fields.positive.spec.ts`; `playwright_tests/tests/advanced-fields.negative.spec.ts` | Covered: dynamic list/radio/multiselect changes, clearing, required list correction and rich-text entry. Added contracts: persisted multiselect formatted-value initialization and explicit-value precedence, preserving exact payloads through edits. Partial: rich-text sanitization/formatting matrix and all list read modes. |
| 7. Complex fields | `playwright_tests/tests/structured-fields.positive.spec.ts`; `playwright_tests/tests/structured-fields.negative.spec.ts` | Covered: nested binding and mandatory validation. Partial: deeply nested/collection table permutations. |
| 8. Collections | `playwright_tests/tests/collection-field.positive.spec.ts`; `playwright_tests/tests/collection-field.negative.spec.ts` | Covered: insertion, retained identity, cancelled/confirmed removal and independent create/delete permissions. Consumer-owned: server authorization. |
| 9. Case links and labels | `playwright_tests/tests/identity-controls.positive.spec.ts` | Covered: formatted read-only case link, destination, label, editable sibling and optional clearing. Partial: editable case-link behavior. |
| 10. Reference identities | `playwright_tests/tests/reference-identity.positive.spec.ts`; `playwright_tests/tests/reference-identity.negative.spec.ts` | Covered: organisation, staff and judiciary reads; staff-to-judiciary fallback. Partial: write/autocomplete, unavailable organisation lookup, unresolved staff and judiciary. Consumer-owned: live reference data and identity authorization. |
| 11. Addresses | `playwright_tests/tests/address-document-lifecycle.positive.spec.ts`; `playwright_tests/tests/address-document-lifecycle.negative.spec.ts`; `playwright_tests/tests/address-lookup.negative.spec.ts` | Covered: UK/global dispatch, invalid/empty/unavailable postcode results and recovery. Consumer-owned: real address service. |
| 12. Document fields | `playwright_tests/tests/address-document-lifecycle.positive.spec.ts`; `playwright_tests/tests/address-document-lifecycle.negative.spec.ts` | Covered: existing/replaced document, upload failures and secure hash/URL/filename payload. Consumer-owned: DM Store persistence, authorization and scanning. |
| 13. Conditional case editing | `playwright_tests/tests/case-edit-form.positive.spec.ts`; `playwright_tests/tests/case-edit-form.negative.spec.ts` | Covered: required correction, optional preservation, conditional show/validate/hide and payload omission. Consumer-owned: complete routed event submission. |
| 14. Alerts and case state | `playwright_tests/tests/callback-error.negative.spec.ts`; `playwright_tests/tests/case-notifier.positive.spec.ts`; `playwright_tests/tests/case-notifier.negative.spec.ts` | Covered: callback alert seam, state replacement, failed refresh retaining selection and successful recovery. Consumer-owned: real callback transport and application routing. |
| 15. Palette and launchers | `playwright_tests/tests/public-field-routing.spec.ts`; `playwright_tests/tests/palette-dispatch.positive.spec.ts`; `playwright_tests/tests/palette-dispatch.negative.spec.ts`; `playwright_tests/tests/launcher-mini-apps.spec.ts` | Covered: representative public read/write wrappers, launcher arguments, unsupported fallback and history interaction. Partial: exhaustive palette modes and history permutations. |
| 16. Case file browsing | `playwright_tests/tests/case-file-states.spec.ts`; `playwright_tests/tests/case-file-search.positive.spec.ts`; `playwright_tests/tests/launcher-mini-apps.spec.ts` | Covered: loaded/empty/error tree, search/clear, ascending/descending results and update permission/failure. Consumer-owned: real case/category services. |
| 17. Case file actions and media | `playwright_tests/tests/case-file-viewer.positive.spec.ts`; `playwright_tests/tests/case-file-media.positive.spec.ts`; `playwright_tests/tests/launcher-mini-apps.spec.ts` | Covered: PDF download content, printable content, media mounting/actions, HTML opening and successful category refresh. Excluded: native print dialogue/OS behavior. Consumer-owned: live documents and full media-viewer feature matrix. |
| 18. Linked cases | `playwright_tests/tests/linked-cases-workflow.spec.ts`; `playwright_tests/tests/linked-case-writer.positive.spec.ts`; `playwright_tests/tests/linked-case-writer.negative.spec.ts` | Covered: incoming/outgoing display, proposed payload/removal, persisted selection, invalid/missing reason, lookup failure, self/duplicate rejection. Consumer-owned: full event navigation and persisted relationships. |
| 19. Flags and queries | `playwright_tests/tests/case-flags-workflow.spec.ts`; `playwright_tests/tests/flag-writer.positive.spec.ts`; `playwright_tests/tests/flag-writer.negative.spec.ts`; `playwright_tests/tests/query-management-workflow.spec.ts`; `playwright_tests/tests/query-writer.positive.spec.ts`; `playwright_tests/tests/query-writer.negative.spec.ts` | Covered: internal/external views, flag selection/update/rejection/reference failure; query raise/respond/close/follow-up payloads, required fields and role-sensitive actions. Consumer-owned: complete multi-page journeys, persistence and server authorization. |
| 20. Payments | `playwright_tests/tests/viewer-payment.positive.spec.ts`; `playwright_tests/tests/payment-contract.positive.spec.ts`; `playwright_tests/tests/payment-contract.negative.spec.ts`; `playwright_tests/tests/launcher-mini-apps.spec.ts` | Covered: order summary, populated/empty history, unpaid/empty WaysToPay service requests and consumer inputs/role gating. **Partial: HTTP failure presentation and malformed response handling are not passing contracts.** Current dependency investigation found silent HTTP errors and unhandled malformed data; retain reproductions in closure evidence and route remediation to the payment dependency owner. Consumer-owned: real authentication, settlement, refunds and service availability. |

## Remaining assurance boundaries

- These rows organize practical source-host contracts; the 20 groups are not a denominator for a completeness percentage.
- Payment error handling remains an explicit unresolved dependency gap. Empty-state tests do not prove service-failure handling.
- Karma/Jasmine remains the unit-test lane. Nothing here authorizes retiring its tests.
- `yarn test:packaged-consumer` is the separate built-tarball integration gate. Source-host browser results cannot substitute for it.
- Only a tracked TypeScript configuration remains under `e2e/` in the inspected checkout; no executable legacy scenarios were identified there. Do not infer historic scenario parity or a migration percentage from that absence.

## Known payment dependency failure boundary

The installed `@hmcts/ccpay-web-component` 6.5.22 owns `CaseTransactionsComponent`, used by the toolkit payment wrappers. For `/?host=miniapps`, intercept the GET `/cases/1111222233334444/paymentgroups` before navigation:

| Response | Observed behaviour | Required follow-up |
| --- | --- | --- |
| HTTP 200 with `{}` | `calculateAmounts` reads missing `payment_groups` and throws on `forEach` | Dependency must validate malformed responses and render an error. |
| HTTP 400 or 500 | Empty service-request guidance appears; stored `errorMessage` is not rendered | Dependency must distinguish a failed request from a successful empty result. |

The normal browser diagnostics catch these failures. Do not suppress them or assert the empty view as successful error handling. Payment dependency maintainers own the fix; once available, update the dependency through normal review and add the error/recovery contracts here. These failures prevent a claim of complete payment assurance, but do not require replacing the Playwright framework.

## Reproduce and inspect

Use Node >=24.18.0, repository Yarn 4.5.0 and installed Playwright 1.63.0. From the repository root:

```sh
yarn install --immutable
yarn playwright install chromium --only-shell
yarn lint:playwright
yarn test:playwright:typecheck
yarn test:playwright --list
yarn test:playwright payment-contract
yarn test:playwright advanced-fields
yarn test:playwright
```

The runner starts the synthetic source host on port 4300; leave that port free. Browser runs use Chromium, isolated contexts, seven workers and zero retries. For agent runs on macOS, launch Chromium outside the restricted sandbox. Match each result to its command and SHA. Focused runs overwrite shared reports, so retain their evidence separately and use the final full run for aggregate claims. See `playwright_tests/README.md` for Odhín/JUnit/trace paths and separate packaged-consumer/Karma ownership.
