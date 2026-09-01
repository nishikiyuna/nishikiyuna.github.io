# 個人サイト（西木結菜）

素の HTML / CSS だけで作った静的サイトです。ビルド作業は不要で、
`index.html` をダブルクリックすればそのままブラウザで確認できます。
デザインは MkDocs Material 風（上部ナビバー＋ヘッダー帯）を手書きの CSS で再現しています。

```
index.html         Home（プロフィール / 研究内容 / 連絡先 / NEWS）
cv.html            CV（Research Interest / Education / Skills）
publication.html   Publication（論文）
presentation.html  Presentation（発表一覧）
slides.html        Slides（スライド・資料の PDF 置き場）★
link.html          Link（関連リンク集）
en.html            English（1ページに全部まとめた英語版）
style.css          共通スタイル（全ページが読み込む）
slides/            スライド・資料の PDF を入れるフォルダ
images/            header.jpg を置くとヘッダー帯の背景になります
```

## スライド・PDF の追加手順

1. PDF を `slides/` フォルダに入れる（ファイル名は**半角英数**推奨。例 `jps2026autumn-talk.pdf`）
2. `slides.html` を開き、`<div class="file"> ... </div>` のブロックを丸ごとコピーする
3. タイトル・発表会名・`href`・ファイルサイズを書き換える

セクションは「学会発表 / ゼミ・勉強会資料 / レポート・ノート」の3つに分けてあります。
TeX ソースなど2つ目のリンクを並べたいときは `class="dl ghost"` のボタンを使ってください。

## 編集の仕方

- **文章を直す** … 各 HTML の該当箇所を書き換えるだけです。
- **色を変える** … `style.css` 冒頭の `:root { --primary: #3f51b5; ... }` を変えると全ページに反映されます。
- **ページを増やす** … 既存のページをコピーして、全ページのナビ（`<nav class="tabs">`）にリンクを1行足します。
- `<!-- TODO: ... -->` のコメントが残っている箇所は、学年・在籍年・共著者のローマ字表記など**要確認**の項目です。

印刷（Ctrl+P）するとナビとヘッダー帯を外した白黒レイアウトになります。

## 公開する（GitHub Pages）

1. GitHub で `<ユーザー名>.github.io` という名前のリポジトリを作る
2. このフォルダで以下を実行する

```bash
git init
git add .
git commit -m "Add personal website"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<ユーザー名>.github.io.git
git push -u origin main
```

3. リポジトリの Settings → Pages で Source を `main` ブランチのルートに設定する

数分後に `https://<ユーザー名>.github.io/` で公開されます。
PDF もリポジトリに入るので、そのまま公開されます（**公開したくない資料は `slides/` に置かないでください**）。
