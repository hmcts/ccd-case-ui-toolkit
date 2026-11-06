
### Controlled pending document uploads

Consumers can opt in with `AbstractAppConfig.getDocumentPendingAccessEnabled()`.
The default is false. When enabled, new document uploads use the dedicated
CDAM `/cases/documents/pending` route through the configured v2 gateway. Secure
response parsing and attachment hashes follow that upload selection. Existing
16-digit case references are supplied as bindings; creation/draft identifiers
are not treated as persisted cases. The matching CDAM implementation is required
([EXUI-4461 backend repair](https://github.com/hmcts/ccd-case-document-am-api/pull/834));
an older backend rejects the new route before storing a file.

Hashes select the transient preview route and never authorize access. Historical
hashless document routing and case-type exclusions retain their existing policy.
This option does not add cancellation cleanup or change saved-draft/expiry
semantics. Enable it only in a coordinated environment with backend authorization
and native document lifecycle validation.
