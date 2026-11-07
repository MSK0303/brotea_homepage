# AGENTS.md — CF嬉野BROTEA 公式サイト（web-page/）

このフォルダは、佐賀県嬉野市嬉野町のサッカー・フットサル ジュニアユースクラブ「CF嬉野BROTEA」の公式サイトです。
**仕様の正本は `../docs/design-spec.md`**。実装前に必ず全文を読むこと。本ファイルと仕様書が矛盾した場合は仕様書を優先し、矛盾点を完了報告に書くこと。

## 技術ルール（厳守）

- 素の HTML / CSS / Vanilla JS のみ。**フレームワーク・ビルドツール・npm依存・外部JSライブラリは禁止**（React、Vue、Tailwind、jQuery、GSAP、AOS 等すべて不可）。
- 外部リソースは Google Fonts のみ可。CDN、アナリティクス、埋め込みウィジェット（Instagram埋め込み、Googleマップiframe、Googleフォームiframe）は使わない。
- パスはすべて **相対パス**（`assets/css/base.css`、`club.html`）。先頭 `/` の絶対パスは禁止。例外は `404.html` の `<base href="/">` と、canonical / OGP / JSON-LD の絶対URLのみ。
- ファイル構成は仕様書 §1 のとおり。勝手にファイル・ページを増やさない。
- `assets/img/` の既存画像（エンブレム、favicon、OGP、ユニフォーム、pattern-tea.svg）は**加工・上書きしない**。必要ならサイズ違いを新規ファイル名で追加してよい。
- `file://` で `index.html` を直接開いても動くこと（`fetch()` でローカルJSONを読む実装は禁止。データは `assets/js/site-data.js` の `window.SITE_DATA`）。
- CSS: 色・書体・余白は `tokens.css` のCSS変数経由でのみ指定する。HEX値の直書きは `tokens.css` 以外で禁止。BEM風のクラス名（`block__elem--mod`）。
- JS: `main.js` 1ファイル、`defer` 読込、グローバル汚染はIIFEで防ぐ。データを `innerHTML` に入れない（`textContent` / `createElement`）。
- `<html class="no-js">` をJSで `js` に置換し、初期非表示のアニメーションは `.js` 配下でのみ適用する。

## コンテンツルール（厳守）

- **費用・金額は一切書かない**（例外: FAQ「体験会の参加費は無料です」のみ可）（入会金、年会費、月会費、遠征費、合宿費、送迎バス利用費、ウェア代、「○円」「￥」）。入会案内の文言は `docs/募集要項web.md` を正本とし、`docs/` の募集要項PDFは参照しない。PDFへのリンクも置かない。
- **電話番号は一切書かない。**
- メールアドレスはHTMLに平文で書かない（`site-data.js` の `email.user` / `email.domain` からJSで組み立てる）。
- 原本由来の文章（基本理念・目指す育成・名称由来）は、仕様書に指定されたとおり**一字一句変えない**。改行位置の調整のみ可。
- 仕様書で【要確認】【たたき台】とある箇所は、文言をそのまま実装し、直前に `<!-- TODO: 要確認 -->` を付ける。自分で事実（資格・経歴・日付・URL等）を創作しない。
- スペイン語ラベルには必ず日本語を並記し、スペイン語部分に `lang="es"` を付ける。アクセント記号（Í, Ó, Ú）を落とさない: FILOSOFÍA / METODOLOGÍA / INSCRIPCIÓN / EQUIPACIÓN / JUEGO DE POSICIÓN / FÚTBOL / FÚTSAL / NUESTRA VISIÓN / DÍAS / SÍGUENOS / MÁS ALLÁ。
- 写真素材（選手・子どもの写真、茶畑・温泉の写真、AI生成の人物画像）を追加しない。

## 共通部品（ヘッダー・フッター）

全7ページ＋404に同一マークアップを直書きし、次のマーカーで囲む:

```
<!-- SHARED:HEADER START -->
...
<!-- SHARED:HEADER END -->
<!-- SHARED:FOOTER START -->
...
<!-- SHARED:FOOTER END -->
```

- ページ間で異なってよいのは `aria-current="page"` の位置と、TOPのヘッダー初期状態クラス（`site-header--transparent`）のみ。
- ヘッダー/フッターを変更するときは、必ず全ページに同じ変更を適用する。
- 整合チェック（変更後に必ず実行し、結果を完了報告に貼る）:

```bash
cd web-page
for part in HEADER FOOTER; do
  for f in index.html filosofia.html metodologia.html club.html inscripcion.html contacto.html privacy.html; do
    sed -n "/SHARED:${part} START/,/SHARED:${part} END/p" "$f" \
      | sed -E 's/ aria-current="page"//; s/ site-header--transparent//' | md5sum | sed "s|-|$f|"
  done
done
# 各 part について7行のハッシュがすべて同じならOK
```

## 作業の進め方

1. `../docs/design-spec.md` を読む → 不明点があれば推測で埋めず、完了報告の「確認事項」に列挙する。
2. 順序: `tokens.css` → `base.css` → 共通ヘッダー/フッター → `index.html` → 下層ページ（共通のページヒーロー型を先に作る）→ `site-data.js` / `main.js` → 404 / sitemap / robots / manifest / CNAME / .nojekyll。
3. 実装後、仕様書 §9 の受入基準チェックリストを1項目ずつ確認し、結果（OK/NG/未確認と理由）を報告する。
4. 自動チェック例:

```bash
cd web-page
grep -rnE "円|￥|¥|入会金|年会費|月会費" --include=*.html --include=*.js . && echo "NG: 費用表記あり"
grep -rnE "0[0-9]{1,3}-[0-9]{2,4}-[0-9]{4}" --include=*.html --include=*.js . && echo "NG: 電話番号あり"
grep -rn "@gmail.com" --include=*.html . && echo "NG: メール平文あり"
grep -rnE '(href|src)="/' --include=*.html . | grep -v 404.html && echo "NG: 絶対パスあり"
grep -rnE "#[0-9A-Fa-f]{3,8}\b" assets/css --include=*.css | grep -v tokens.css && echo "NG: tokens外のHEX"
```

5. ローカル確認は `python -m http.server` でも `file://` 直開きでも行う。360 / 768 / 1280px で目視確認する。

## 完了報告に含めること

- 作成・変更したファイル一覧
- 受入基準チェックリストの結果（§9 全項目）
- 共通部品の整合チェック結果
- Lighthouse（モバイル）スコア（実行できない環境ならその旨）
- 仕様書との差異・判断した点・確認事項
