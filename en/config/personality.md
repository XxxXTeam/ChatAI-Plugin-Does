# Personality Isolation Config

Personality isolation applies independent personas (system prompt), presets, and model configurations per **scope** (global, user, group, user-in-group). Configuration lives in the `personality` section of `config/config.yaml`.

## Configuration Example

```yaml
personality:
  # Scope priority in group chat scenarios (highest to lowest)
  priority:
    - group
    - group_user
    - user
    - default
  # Whether to use an independent persona
  useIndependent: true
  # Context isolation
  isolateContext:
    enabled: true
    clearOnSwitch: true
```

## Scope Priority `priority`

`priority` determines the order in which the effective persona config is looked up in **group chat** scenarios. It is consumed by `ScopeManager.getEffectiveSettings()` (source `src/services/scope/ScopeManager.js`). The system searches from highest to lowest in array order and stops at the first scope that has a config.

| Scope | Meaning | Storage Table |
|-------|---------|---------------|
| `group_user` | Independent config for a specific user in a specific group | `group_user_scopes` |
| `group` | Shared config for the whole group | `group_scopes` |
| `user` | The user's global config across groups | `user_scopes` |
| `private` | Private chat config | `private_scopes` |
| `default` | System default persona | Global config |

### Scenario Differences

- **Group chat**: reads `personality.priority`; falls back to the built-in default order `['group_user', 'group', 'user', 'default']` when not configured.
- **Private chat**: **always** uses `['private', 'user', 'default']` and is not affected by `personality.priority`.

::: warning The example order differs from the default
The built-in fallback order is `group_user > group > user > default` (more specific scopes first). The `config.yaml` example places `group` before `group_user`, meaning a **uniform group-wide persona** takes precedence over a **per-user persona within the group**. Adjust the order to your actual needs.
:::

### Independent Persona Mechanism

When a scope has a custom persona set, `getIndependentPrompt()` uses that persona directly and **no longer appends the default persona** (`isIndependent: true`); an empty string is also treated as an "explicitly set to empty" independent persona. Only when no scope has a persona set does the system fall back to the default prompt.

## Other Config Fields

::: warning About useIndependent and isolateContext
The three fields `useIndependent`, `isolateContext.enabled`, `isolateContext.clearOnSwitch` can be read and written through the backend endpoints `GET/PATCH /config/personality` and persisted to `config.yaml`. However, no business logic directly consuming these fields was found in the current `src/` backend and `frontend/src/` frontend source.

They are not the same configuration as the preset-level `isolateContext` / `clearOnSwitch` (preset properties in `PresetManager`, default `false`; see below). To confirm their actual behavior, observe runtime behavior.
:::

| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `useIndependent` | boolean | `true` | Independent persona switch (no direct consumer found in current source) |
| `isolateContext.enabled` | boolean | `true` | Context isolation switch (no direct consumer found in current source) |
| `isolateContext.clearOnSwitch` | boolean | `true` | Clear context on switch (no direct consumer found in current source) |

> Preset-level context isolation is controlled by the preset's own `isolateContext` (whether to use an independent context) and `clearOnSwitch` (whether to clear the context when switching presets), both defaulting to `false`. See [Presets & Personas](/guide/presets).

## Management Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/config/personality` | Get the current personality config |
| `PATCH` | `/config/personality` | Partially update the personality config |

## Next Steps

- [Context Config](./context) - Conversation memory and compression
- [Basic Config](./basic) - Global config such as llm / thinking