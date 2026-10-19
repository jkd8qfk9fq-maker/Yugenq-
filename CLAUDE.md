# YUGENQ 公式サイト：作業ルール

HTML / CSS / JavaScript だけで作った静的サイト（ビルド不要）。詳細な構成とデザインの考え方は README.md を参照。

## 公開の流れ

```
ファイルを編集 → 表示を確認 → git commit → git push（main）→ Netlify が自動で公開（1分前後）
```

- GitHub リポジトリ：https://github.com/jkd8qfk9fq-maker/Yugenq-
- 公開用ブランチ：`main`（push すると本番サイトが更新される）
- Netlify の設定：`netlify.toml`（公開フォルダはリポジトリのルート、ビルドコマンドなし）

## Claude Code での作業手順

1. 変更前に `git status` で未コミットの変更がないか確認する
2. ファイルを編集し、ブラウザで PC 幅とスマートフォン幅（375px）の表示を確認する
3. 変更内容が分かる日本語のコミットメッセージで commit する
4. **push はユーザーが「反映して」「公開して」などと指示したときに行う**（push すると本番サイトが即時に更新されるため）
5. push 後、Netlify の公開が終わったら本番URLで表示を確認する

## 注意

- 共通の設定（ナビ、SNS、お問い合わせフォームのURL）は `js/site.config.js` に集約している
- 新しいページは既存ページの `<head>` を複製し、title・description・OGP を書き換える
- 公開してはいけない情報（パスワード、APIキーなど）をリポジトリに入れない。リポジトリは公開設定
- README.md・CLAUDE.md・netlify.toml は `netlify.toml` の設定で公開サイトからは見えない
