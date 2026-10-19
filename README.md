# YUGENQ 公式サイト（骨組み）

HTML / CSS を中心に、ビルド不要で動く静的サイトです。共通部品（ヘッダー・フッター・SNS）は依存ライブラリのない Web Components で分割しています。

## 確認方法

ローカルサーバーで開いてください（`file://` で直接開いても表示されますが、SNS の `provider="json"` など fetch を使う機能はサーバー経由でのみ動作します）。

```bash
npx serve .
```

## 公開（GitHub → Netlify 自動デプロイ）

GitHub リポジトリ [jkd8qfk9fq-maker/Yugenq-](https://github.com/jkd8qfk9fq-maker/Yugenq-) の `main` ブランチに push すると、Netlify が自動で公開サイトを更新します。ビルドは不要で、このフォルダがそのまま公開されます（設定は `netlify.toml`）。

```
ファイルを編集 → git commit → git push（main）→ Netlify が自動で公開
```

### Netlify の初回設定（1回だけ）

1. https://app.netlify.com/ に GitHub アカウントでログインする
2. 「Add new project（Add new site）」→「Import an existing project」→「GitHub」を選び、Netlify からのアクセスを許可する
3. リポジトリ一覧から `Yugenq-` を選ぶ
4. 設定画面は次のとおりにする（`netlify.toml` があるので、通常は自動で入力される）
   - Branch to deploy：`main`
   - Base directory：空欄
   - Build command：空欄
   - Publish directory：`.`
5. 「Deploy」を押す。1分ほどで `https://（ランダムな名前）.netlify.app` で公開される
6. 「Site configuration」→「Change site name」で、URLの名前を変更できる（例: `yugenq.netlify.app`）

### 公開後の運用

- `main` に push するたびに自動で再公開される。履歴は Netlify の「Deploys」で確認できる
- 公開後に問題が見つかった場合は、「Deploys」で前回の公開を選び「Publish deploy」を押すと元に戻せる
- 独自ドメインを使う場合は「Domain management」で設定する。ドメインが決まったら、SEO の「公開ドメインが決まったら追加するもの」も対応する
- 存在しないURLにアクセスされたときは `404.html` が表示される
- `README.md`・`CLAUDE.md`・`netlify.toml` は公開サイトからは見えない（404 を返す）
- 削除したインサイトのページ（`/insights.html`・`/insights/…`）へのアクセスはトップページへ転送する

## ディレクトリ構成

```
yugenq-site/
├─ index.html              HOME（理念・事業概要・日本企業百科事典・ブランドメッセージ）
├─ services.html           事業紹介（日本企業百科事典・デジタルサービス）
├─ encyclopedia.html       日本企業百科事典
├─ social.html             SOCIAL（公式アカウント＋投稿フィード）
├─ about.html              ABOUT（ビジョン・運営方針・会社概要）
├─ contact.html            CONTACT（問い合わせフォーム）
├─ privacy.html            プライバシーポリシー（文面は未記入）
├─ 404.html                ページが見つからないときの表示（Netlify が自動で使う）
├─ netlify.toml            Netlify の公開設定
├─ CLAUDE.md               Claude Code 向けの作業ルール
├─ css/
│  ├─ tokens.css           色・書体・余白などのデザイントークン
│  ├─ base.css             リセットと要素の既定スタイル
│  ├─ layout.css           コンテナ、索引レール付き二段組、ページヒーロー
│  ├─ components.css       部品（ボタン、行リスト、事典項目、フォーム ほか）
│  ├─ pages.css            ページ固有（HOMEヒーローなど）
│  └─ motion.css           演出（斜めライン、画像のスライド、出現アニメーション）
├─ js/
│  ├─ core.js              共通ユーティリティ（エスケープ、パス解決）
│  ├─ site.config.js       ナビ・SNSアカウント・フッターの設定 ← 編集はここ
│  ├─ components/
│  │  ├─ site-header.js    <yq-header>
│  │  ├─ site-footer.js    <yq-footer>
│  │  └─ social.js         <yq-social-accounts> / <yq-social-feed>
│  ├─ data/social-posts.js SNS投稿のサンプルデータ
│  ├─ main.js              Google フォームの埋め込み
│  └─ motion.js            スクロール演出（出現判定・スクロール連動）
└─ assets/
   ├─ favicon.svg
   └─ images/              旧・仮の抽象画（現在は未使用。オフライン確認用）
```

## デザインの考え方

- **配色**：ブルーブラック `#0e1724`、チャコール `#2f3237`、白、アイボリー `#f4f1e8` の4色。セクションに `theme-ink` / `theme-charcoal` / `theme-white` / `theme-ivory` を付けると、背景・文字色・罫線色がまとめて切り替わります。
- **書体**：見出しは明朝（Shippori Mincho B1）、本文はゴシック（Zen Kaku Gothic New）。
- **レイアウト**：各セクションは「左の索引レール（英字の章名＋見出し）」と「右の本文」の二段組です。事典の柱のような構成で、全ページの統一感をつくっています。スマートフォンでは1段に積みます。
- **角丸**：階層ごとに使い分けています。画像 28px、カード 18px、入力欄 10px、ボタン・タグは丸型です（`tokens.css` の `--radius-*`）。
- **動き**：演出は `css/motion.css` と `js/motion.js` にまとめています。端末で「視差効果を減らす」が有効な場合は、すべての動きを止めて内容をそのまま表示します。
- **ブレークポイント**：720px（2〜3列化）、960px（二段組）、1080px（PCナビ表示）、1200px（HOME百科事典の左右分割）。

## 演出の一覧と調整

| 演出 | 使い方 | 調整箇所 |
| --- | --- | --- |
| ファーストビューの特大コピー | 1行ずつ下からせり上がる | `pages.css` の `.hero__title` |
| 鋭い斜めライン | `<div class="slashes">` に `<span>` を5本。画面に入ると上から走る | 角度は `--slash-angle`、位置・濃さは `.slashes span:nth-child()` |
| セクション境界の斜めカット | `edge-top edge-from-white` / `edge-bottom edge-to-ivory` のように隣の背景色を指定 | 高さは `--edge-h` |
| 見出しの罫線と切れ込み | `.section-head` に自動で付く | `layout.css` / `motion.css` |
| 画像の出現とスライド | `<div class="media" data-parallax="-60"><img></div>`。斜めのワイプで現れ、スクロールに合わせて上下にスライド | 数値（px）が移動量。正負で向きが変わる |
| 横に流れる画像帯 | `.slide-strip__row` に `data-scroll-x` | 移動量は `--shift` |
| ホバーで浮き上がる | カード（事業・記事・SNS）とボタン。任意の要素は `class="lift"` | 高さは `--lift`、影は `--shadow-lift` |
| ボタンの光 | `.button` に自動で付く | `motion.css` の `.button::after` |

演出を弱めたい場合は、各ページの `motion.css` と `motion.js` の読み込みを外すと、静止したデザインに戻ります（角丸とホバーの浮き上がりは残ります）。

## コンテンツの追加方法

| 追加したいもの | 作業 |
| --- | --- |
| ナビ項目・ページ | 新しいHTMLを既存ページから複製し、`js/site.config.js` の `nav` に1行追加 |
| サービス | `services.html` の一覧に `row-list__item` を、詳細に `<article class="detail" id="…">` を追加 |
| SNSアカウント | `js/site.config.js` の `social` に追加（ヘッダー・フッター・SOCIALページに自動反映） |
| 百科事典の業種索引 | `encyclopedia.html` の `index-grid` の項目をリンクに差し替え |

下層ディレクトリにページを置く場合は `<yq-header base="../">` `<yq-footer base="../">` のように相対パスを指定します。

## SNS投稿の表示（将来の連携）

`<yq-social-feed>` は「プロバイダ」から投稿を受け取って描画します。現在はサンプルデータ（`provider="local"`）です。

SNS各社のAPIはアクセストークンが必要なため、ブラウザから直接呼ばず、自社サーバーやCMSで投稿を集約したJSONを返す構成を想定しています。

```html
<yq-social-feed provider="json" endpoint="/api/social-posts.json" limit="9" filterable></yq-social-feed>
```

JSONの形：`[{ "id", "platform", "date", "text", "url", "image"?, "imageAlt"? }]`（`platform` は `site.config.js` の `social[].key` と一致させる）

独自の取得方法は `YQ.social.registerProvider("name", async (opts) => posts)` で追加できます。

## お問い合わせ（Google フォーム）

お問い合わせは **Google フォーム** で受け付け、お問い合わせページ（`contact.html`）に埋め込んで表示します。回答は Google フォームに保存され、新しい回答があると yugenqjp@gmail.com にメールで通知されます。

フォームのURLは `js/site.config.js` の `contact.googleForm` で設定します。URLが空の間は、お問い合わせページに「メールでお問い合わせください（yugenqjp@gmail.com）」という案内が表示されます。

### フォームの作り方（約10分）

1. **yugenqjp@gmail.com** でログインした状態で https://forms.google.com/ を開き、「空白のフォーム」を作る
2. タイトルを「YUGENQ お問い合わせ」とし、次の設問を追加する

   | 設問 | 形式 | 必須 |
   | --- | --- | --- |
   | お問い合わせの種類（サービスについて／ご利用について／ご意見・ご要望／その他） | ラジオボタン | 必須 |
   | お名前 | 記述式 | 必須 |
   | メールアドレス | 記述式（回答の検証：テキスト → メールアドレス） | 必須 |
   | 電話番号 | 記述式 | 任意 |
   | 会社名・団体名 | 記述式 | 任意 |
   | お問い合わせ内容 | 段落 | 必須 |
   | 個人情報の取り扱いへの同意（プライバシーポリシーへのリンクを説明文に記載） | チェックボックス | 必須 |

3. 「回答」タブ → 右上の「︙」→「新しい回答についてのメール通知を受け取る」をオンにする（yugenqjp@gmail.com に通知が届く）
4. 必要に応じて「設定」→「回答」で、回答者へのコピー送信や、1人1回の制限（ログインが必要になるため通常はオフ）を設定する
5. 右上の「送信」→「<>（埋め込み）」を選び、表示されたコードの `src="…"` の部分（`https://docs.google.com/forms/d/e/…/viewform?embedded=true`）と `height` の数値を控える
6. `js/site.config.js` を開き、`contact.googleForm` に 5 のURLを、`contact.googleFormHeight` に `height` の数値を入れる
7. お問い合わせページでフォームが表示されることを確認し、テスト回答を送って yugenqjp@gmail.com に通知が届くか確かめる

- 共有リンク（`…/viewform`）を入れても埋め込み表示になります。`forms.gle/…` の短縮URLは埋め込めないため、「お問い合わせフォームを開く」ボタンの表示になります。
- フォームの見た目は Google フォームの「テーマをカスタマイズ」で、ヘッダー画像や色（ブルーブラック `#0e1724` など）をサイトに合わせられます。
- 表示が途中で切れる、または下に余白が出る場合は、`googleFormHeight` の数値を調整してください（スマートフォンでは自動で 1.15 倍の高さになります）。

## 差し替えが必要な箇所

- 会社概要（`about.html`）の社名・所在地などは仮の記載です
- SNSアカウント：X（@YUGENQjp）と Instagram（@yugenqjp）を設定済み。YouTube は `url` が空のため非表示。アカウントを作ったら `js/site.config.js` の `social` に `url` と `handle` を入れると表示される
- コピー全般とSNS投稿はサンプルです（事典の掲載例は日本企業百科事典の実在項目「トヨタ自動車」）
- 写真は Unsplash のものを仮に使用しています。自社撮影の写真などに差し替える場合は、`<img>` の `src`・`srcset`・`alt` を更新してください（装飾目的なら `alt=""` のまま）
- プライバシーポリシーの本文
- お問い合わせ用 Google フォームのURL（上記「フォームの作り方」を参照）

## 今後の発展

ページが増えて共通部品のHTMLを各ページに書くのが負担になったら、Astro や Eleventy などの静的サイトジェネレーターへの移行が向いています。CSSと各コンポーネントはそのまま部品として移せる構成にしています。

## SEO

各ページに次を設定しています。

- `<title>` と `meta description`：ページごとに固有の内容。タイトルは「ページ名｜主要キーワード｜YUGENQ」、説明文は80〜100文字前後
- OGP / Twitter カード：SNSでシェアされたときのタイトル・説明・画像（1200×630）
- 見出し：各ページ `h1` は1つ。見出しの階層は飛ばさない。英字の補足（Corporate data など）は見出しの外に置き、見出しの文言を日本語だけにしている
- 画像の `alt`：内容を伝える写真には説明を付け、記事カードの写真のように隣の見出しと同じ内容になるものは `alt=""`（読み上げの重複を避けるため）
- `noindex`：本文が未記入のプライバシーポリシー。本番の内容に差し替えたら外す
- `robots.txt`：すべてのページのクロールを許可

ページを追加するときは、既存ページの `<head>` を複製し、`title`・`description`・`og:title`・`og:description`・`og:image` をそのページの内容に書き換えてください。

### 公開URLにもとづく設定（https://yugenqjp.netlify.app）

- `<link rel="canonical">` と `og:url`：各ページの正式なURL。Netlify では `/services` と `/services.html` のどちらでも表示されるため、`.html` 付きのURLに統一している
- `sitemap.xml`：検索結果に載せたい6ページ（noindex のプライバシーポリシーは除外）。`robots.txt` にも場所を記載
- 構造化データ（JSON-LD）：トップに組織情報（Organization。X・Instagram へのリンクを含む）とサイト情報（WebSite）、下層ページにパンくずリスト（BreadcrumbList）

ページを追加・更新したときは、そのページの canonical・og:url・パンくずの JSON-LD を入れ、`sitemap.xml` に URL を追加して `lastmod`（更新日）を書き換えてください。

**独自ドメインに切り替えるとき**は、全ファイルの `https://yugenqjp.netlify.app` を新しいドメインに一括置換してください（各ページの head、`sitemap.xml`、`robots.txt`）。

### 公開後にやること

1. [Google Search Console](https://search.google.com/search-console) で「URLプレフィックス」に `https://yugenqjp.netlify.app/` を登録する（所有権の確認は「HTMLタグ」方式が簡単。表示された `<meta name="google-site-verification" …>` を index.html の head に追加して公開する）
   - 所有権の確認には HTML ファイル方式を使っている（`googlef20d9ddbb5815a8d.html`）。**削除すると確認が外れるため、消さないこと**
2. 「サイトマップ」に `sitemap.xml` を送信する
3. [リッチリザルト テスト](https://search.google.com/test/rich-results) でトップページと下層ページを確認し、構造化データにエラーがないか見る

## 写真（Unsplash）

写真は [Unsplash](https://unsplash.com/) から [Unsplash License](https://unsplash.com/license)（商用利用可・クレジット表記は任意）のものを選び、`images.unsplash.com` から直接読み込んでいます。表示にはインターネット接続が必要です。`srcset` で画面幅に合った大きさの画像が配信されます。

公開前に、各写真に人物の肖像・商標・建築物など権利上の確認が必要なものが含まれていないか確認してください。長期運用する場合は、写真を自社サーバーに保存して配信する形への切り替えをおすすめします。

| 使用箇所 | 写真 | 撮影者 |
| --- | --- | --- |
| HOME ヒーロー | [夕日に照らされる富士山](https://unsplash.com/photos/KZSDCocsOEE) | Aditya Anjagi |
| HOME ブランドメッセージ | [湖と富士山](https://unsplash.com/photos/tlCzX-8iwx4) | Sora Sagano |
| HOME 画像帯 | [東京タワーの夜景](https://unsplash.com/photos/3-esk8zPwPY) | Marek Okon |
| HOME 画像帯 | [ローソク足チャート](https://unsplash.com/photos/3r8rcSy0Ffg) | Tötös Ádám |
| HOME 画像帯 | [図書館の書架](https://unsplash.com/photos/aon-6I6Y6uQ) | Declan Sun |
| HOME 画像帯 | [新倉山浅間公園の五重塔と富士山](https://unsplash.com/photos/n--CMLApjfI) | Manuel Cosentino |
| HOME 画像帯 | [障子のある和室](https://unsplash.com/photos/_bpLpkLWVxU) | Viviana Nysaether |
| HOME 画像帯 | [水面に映る高層ビル](https://unsplash.com/photos/bT5qmcO-biM) | Heng Chiu |
| HOME 画像帯 | [枯山水の庭](https://unsplash.com/photos/A7asc8TrnY4) | Hu Chen |
| HOME 画像帯 | [株価欄の新聞](https://unsplash.com/photos/XrIfY_4cK1w) | Markus Spiske |
| SERVICES | [東京の街並み](https://unsplash.com/photos/IocJwyqRv3M) | Louie Martinez |
| 日本企業百科事典 | [古い図書室](https://unsplash.com/photos/A32Uo8lf-JE) | Jonathan Gong |
| SOCIAL | [スマートフォンを持つ手](https://unsplash.com/photos/FPt10LXK0cg) | ROBIN WORRALL |
| ABOUT | [芦ノ湖の鳥居](https://unsplash.com/photos/SBK40fdKbAg) | Tianshu Liu |
