# Changelog <Badge type="info" text="Updates" />

All notable changes to ChatAI Plugin will be documented on this page.

::: tip Version Format
Version format follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`
:::

---

## September 2026 (unreleased)

Key changes completed and verified, not yet shipped in a formal release:

- 🐛 Fixed tool_call ID normalization: numeric tool-call IDs (array indices forwarded by old data / upstream relays) caused 400/500 errors on OpenAI-compatible endpoints. Added `normalizeAnyToolCallId` / `generateDeterministicToolCallId` in `src/core/adapters/tooling.js` and applied them across the Gemini/OpenAI converters, `OpenAIClient`, `AbstractClient` and `ToolApprovalService`.
- 🐛 Fixed Gemini `functionResponse.name` empty-name 400 errors: `resolveToolResultName` provides multi-level fallback; result parts without a name are no longer silently dropped.
- 🐛 Fixed at-mention triggering across protocols (icqq/TRSS: `e.atBot` + `qq`/`data.qq`; QQBot: `data.user_id`; plus `e.atme` and `data.all`).
- 🐛 Disabled channels (`enabled: false`) are now excluded from available model lists (backend aggregation and all frontend aggregation points).
- 🐛 Fixed `hard` query param never resolving to true in `DELETE /user/:userId` and `DELETE /:id` memory routes.
- 🐛 Fixed frontend lint rules blocking `bun run build` (eslint-config-next 16.0.8 with react-hooks 7.x rules); 44 files refactored without changing eslint config.
- ⚡ Added `LlmDelegate` bypass-call delegation with streaming compliance, channel error reporting, channel switching and exponential backoff.
- ⚡ Structured memory summaries: `[category] content` lines with a category whitelist (`profile`/`preference`/`event`/`relation`/`topic`/`custom`); thinking-process text no longer pollutes memories.
- ⚡ Tool round limits reworked (soft limit via repeated-loop detection, hard limit `maxRoundsHard=60`); intermediate "calling tool" text for text-less tool rounds.
- ✨ Added 12 knowledge-graph tools (`kg_*`, category `knowledgeGraph`, enabled by default).

For the latest changelog, please refer to the [Chinese changelog](/changelog) or [GitHub Releases](https://github.com/XxxXTeam/chatai-plugin/releases).

::: info Note
The English changelog is synchronized from the Chinese version. For the most up-to-date information, please check the Chinese documentation or GitHub releases.
:::
