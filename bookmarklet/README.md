# bookmarklet

`src/*.ts` から、ブラウザのブックマークへ貼る `javascript:` 形式の bookmarklet を作る。

## requirements

[nix](https://determinate.systems/nix) だけ。node も npm も要らない。

```sh
curl -fsSL https://install.determinate.systems/nix | sh -s -- install
```

道具 (tsc / terser / biome / shfmt / shellcheck / nixfmt) は `flake.nix` の devShell が
持っている。各スクリプトは PATH に無ければ **自動で `nix develop` に入り直す**ので、
普段は `nix develop` を意識しなくてよい。

## build

```sh
./scripts/build.sh
```

`src/scrap_web_page.ts` → `js/scrap_web_page.js` を作る。

```
src/scrap_web_page.ts
  --(tsc)-->    build/scrap_web_page.js
  --(terser)--> build/scrap_web_page.js  (同じ場所へ上書きして minify)
  --(wrap)-->   js/scrap_web_page.js     javascript: (function () { ... })();
```

`js/` はコミットする。ブラウザへ貼るのはここのファイルなので、生成物であっても
手元に無いと使えないため。

## lint / format

```sh
./scripts/lint.sh          # 検査だけ
./scripts/lint.sh --fix    # 直せるものは直す
```

`src/**/*.ts` は biome (整形 + lint、規則は `biome.jsonc`) と `tsc --noEmit`、
`*.sh` は shfmt と shellcheck、`*.nix` は nixfmt で見る。

## 注意

`flake.nix` / `flake.lock` は **git に追跡させておくこと**。git flake は追跡済みの
ファイルしか見ないので、`git add` していないと `nix develop` が失敗する。

## TypeScript support

- `scrap_web_page.ts`

`js/` の残りは TypeScript 化していない手書きの bookmarklet で、ビルドの対象外。
