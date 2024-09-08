# cafeore-2024 POSシステム

## コマンド

| コマンド   | 説明                                  |
| ---------- | ------------------------------------- |
| `bun sync` | 依存パッケージのインストール          |
| `bun dev`  | 開発環境の立ち上げ                    |
| `bun tsc`  | TypeScriptの型チェックを実行          |
| `bun lint` | ESLintの実行。`--fix`をつけて自動修正 |
| `bun fmt`  | Prettierの実行                        |

## Architecture

```mermaid
flowchart TB

  subgraph CONV[Converter]
    direction LR
    DocumentData <-- convert --> Entity
  end

  subgraph REPO[Repository]
    direction TB
    CONV <--> IO[Inputs/Outputs]
  end

  Firestore --> CONV

  Action --> REPO --> Loader

  subgraph API[Virtual API]
    Loader
    Action
  end

  subgraph "Endpoint (Remix SPA mode)"
    API
    Loader --> Route --> Action
  end

```
