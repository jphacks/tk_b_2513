# 画像生成AI初心者向け類似画像・プロンプト検索サービス

## サービス概要
画像生成AIの初心者が、画像を生成する前に類似する画像とプロンプトを検索できるサービス。既存の生成画像とプロンプトを参考にすることで、より効果的な画像生成を支援する。

## 必要な機能


### コア機能
- **画像検索機能（優先度高め）**
  - 〇[フロントエンド]プロンプト入力インターフェース
  - 〇[バックエンド]テキストベース検索（プロンプトをベクトル化して、保存しているデータベース内の画像のプロンプトをベクトル化したモノの中で類似度が高いものを抽出）
    - 4件ほど、抽出する。
  - 〇[フロントエンド]検索して表示された画像に対して、ダウンロードボタン、プロンプトを表示
  - 〇[フロントエンド]ダウンロードが押されると、保存されているURLより画像をダウンロードできるようにする。

- **画像生成機能**
  - 〇画像生成
  - 〇生成画像のプレビュー
  - [フロントエンド]ダウンロードが押されると、保存されているURLより画像をダウンロードできるようにする。
  ‐ ダウンロードした画像を、データベースに保存
    - [バックエンド]画像をベクトル化する
    - [バックエンド]画像をベクトル化したデータ、プロンプト、保存先URL、著作権の有無を実装

### サブ機能
- **プロンプト参照機能**
  - [フロントエンド]類似画像のプロンプト表示
  - [フロントエンド]プロンプトのコピー機能


--------------ここまで作成する。以下の機能は優先度低め------------

- **ユーザー機能**
  - ユーザー登録・認証
  - お気に入り保存
  - 生成履歴管理
  - プロフィール管理

- **管理機能**
  - 画像・プロンプトの管理
  - ユーザー管理
  - 統計・分析

## 技術スタック

### フロントエンド
- **フレームワーク**:
- **UI/UX**:
- **状態管理**:
- **その他**:

### バックエンド
- **フレームワーク**:
- **言語**:
- **API**:
- **認証**:
- **その他**:

### データベース
- **メインDB**:
- **ベクトルDB（画像検索用）**:
- **キャッシュ**:

### インフラ・DevOps
- **ホスティング**:
- **ストレージ**:
- **CI/CD**:
- **モニタリング**:

### 外部サービス・API
- **画像生成AI**:
- **画像埋め込み（Embedding）**:
- **その他**:

## データベース設計

### テーブル構成

#### users（ユーザー）(テーブル作成は行う)
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | | PRIMARY KEY | ユーザーID |
| username | | UNIQUE, NOT NULL | ユーザー名 |
| email | | UNIQUE, NOT NULL | メールアドレス |
| password_hash | | NOT NULL | パスワードハッシュ |
| created_at | | NOT NULL | 作成日時 |
| updated_at | | NOT NULL | 更新日時 |

#### images（生成画像）
| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| id | | PRIMARY KEY | 画像ID |
| user_id | | FOREIGN KEY | ユーザーID |　←(一応作成。認証機能ができるまで、固定値で対応)
| prompt | | NOT NULL | プロンプト |
| image_url | | NOT NULL | 画像URL |
| embedding_vector | | | 画像埋め込みベクトル |
| created_at | | NOT NULL | 作成日時 |



## API設計

### 画像生成API

#### POST /api/v1/images/generate
画像を生成する

**リクエスト**
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional)",
  "model": "string (optional)",
  "parameters": {
    "width": "number (optional)",
    "height": "number (optional)",
    "quality": "string (optional)",
    "style": "string (optional)"
  }
}
```

**レスポンス**
```json
{
  "id": "string",
  "image_url": "string",
  "thumbnail_url": "string",
  "prompt": "string",
  "negative_prompt": "string",
  "model": "string",
  "parameters": {},
  "created_at": "string (ISO 8601)"
}
```

### 画像検索API

#### GET /api/v1/images/search
テキストベースで画像を検索する

**クエリパラメータ**
- `q`: 検索クエリ（プロンプト）
- `model`: モデル名でフィルタ
- `tags`: タグでフィルタ（カンマ区切り）
- `limit`: 取得件数（デフォルト: 20）
- `offset`: オフセット（デフォルト: 0）

**レスポンス**
```json
{
  "images": [
    {
      "id": "string",
      "image_url": "string",
      "thumbnail_url": "string",
      "prompt": "string",
      "model": "string",
      "similarity_score": "number",
      "created_at": "string"
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

#### POST /api/v1/images/search/similar
画像ベースで類似画像を検索する

**リクエスト**
```json
{
  "image_id": "string (optional)",
  "image_url": "string (optional)",
  "limit": "number (optional)"
}
```

**レスポンス**
```json
{
  "images": [
    {
      "id": "string",
      "image_url": "string",
      "thumbnail_url": "string",
      "prompt": "string",
      "model": "string",
      "similarity_score": "number",
      "created_at": "string"
    }
  ],
  "total": "number"
}
```

#### GET /api/v1/images/:id
特定の画像詳細を取得する

**レスポンス**
```json
{
  "id": "string",
  "user_id": "string",
  "image_url": "string",
  "thumbnail_url": "string",
  "prompt": "string",
  "negative_prompt": "string",
  "model": "string",
  "parameters": {},
  "tags": ["string"],
  "created_at": "string"
}
```

### その他のAPI（今後実装予定）

#### ユーザー認証API
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

#### お気に入りAPI
- GET /api/v1/favorites
- POST /api/v1/favorites
- DELETE /api/v1/favorites/:id

#### タグAPI
- GET /api/v1/tags
- GET /api/v1/tags/:id/images

## 実装フェーズ

### フェーズ1（MVP）
- [ ] 基本的なデータベース設計・構築
- [ ] 画像生成API実装
- [ ] テキストベース検索API実装
- [ ] シンプルなフロントエンドUI

### フェーズ2
- [ ] 画像ベース類似検索実装
- [ ] ユーザー認証機能
- [ ] お気に入り機能
- [ ] タグ機能

### フェーズ3
- [ ] UI/UX改善
- [ ] パフォーマンス最適化
- [ ] 管理画面
- [ ] 分析・統計機能
