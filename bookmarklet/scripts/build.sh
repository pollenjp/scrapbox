#!/usr/bin/env bash
# shellcheck shell=bash
#
# src/*.ts から bookmarklet (js/*.js) を作る。Makefile + minify.sh + npm scripts の置き換え。
#
# ## 流れ
#
#   src/scrap_web_page.ts
#     --(tsc)-->    build/scrap_web_page.js
#     --(terser)--> build/scrap_web_page.js  (同じ場所へ上書きして minify)
#     --(wrap)-->   js/scrap_web_page.js     javascript: (function () { ... })();
#
# minify は任意ではない。bookmarklet はブラウザのブックマークの URL 欄へ丸ごと
# 貼り付けるもので、長さに実質的な上限があるため。
#
# js/ の中身はコミットする。ブラウザへ貼るのはここのファイルで、
# 生成物であっても手元に無いと使えないから。
#
# ## 道具の入手
#
# tsc / terser は flake.nix の devShell が持っている。PATH に無ければ
# **自動で `nix develop` に入り直す**ので、普段は `nix develop` を意識せず
# ./scripts/build.sh と打てばよい。

set -eu -o pipefail

project_root=$(
  cd -- "$(dirname "$0")/.." &>/dev/null
  pwd -P
)
cd "${project_root}"

have() {
  command -v "$1" &>/dev/null
}

# 道具が揃っていなければ devShell へ入り直す。
# 印を付けて 1 回だけにする (devShell に入っても揃わない場合の無限ループ防止)。
if ! have tsc || ! have terser; then
  if [[ -z ${BOOKMARKLET_BUILD_REEXEC:-} ]] && have nix; then
    echo "==> tsc / terser が PATH に無いので nix develop に入り直します"
    export BOOKMARKLET_BUILD_REEXEC=1
    # git flake なので flake.nix / flake.lock は追跡されている必要がある
    # (このスクリプトは引数を取らないので、渡し直すものは無い)
    exec nix develop "${project_root}" --command "$0"
  fi
  echo "tsc / terser が見つかりません。" >&2
  echo "  nix があれば devShell へ自動で入り直します。無い環境では次のいずれかを:" >&2
  echo "    - nix を入れる (curl -fsSL https://install.determinate.systems/nix | sh -s -- install)" >&2
  echo "    - typescript / terser を手で入れる" >&2
  exit 1
fi

src_dir=src
build_dir=build # tsconfig.json の outDir と揃えること
out_dir=js

#################################
# TypeScript -> JavaScript      #
#################################

echo "==> tsc"
rm -rf "${build_dir}"
tsc

#################################
# minify                        #
#################################

# terser の既定 (minify API 側の既定) は compress / mangle とも有効。
# terser.options.json は keep_fnames と残すコメントだけを上書きしている。
echo "==> terser"
built=()
while IFS= read -r f; do
  [[ -n ${f} ]] || continue
  built+=("${f}")
done < <(find "${build_dir}" -type f -name '*.js' | sort)

if [[ ${#built[@]} -eq 0 ]]; then
  echo "${build_dir}/ に *.js がありません。${src_dir}/ に *.ts はありますか?" >&2
  exit 1
fi

for f in "${built[@]}"; do
  terser --config-file terser.options.json --output "${f}" --compress -- "${f}"
done

#################################
# bookmarklet として包む        #
#################################

# `javascript:` スキームの中身は式ではなく文の並びなので、即時実行関数で
# 包んでスコープを閉じる。包まないとページ側のグローバルを汚す。
#
# minify 済みファイルは末尾に改行を持たない。下の `echo` はその続きに
# 書かれるので、出力は 2 行になる (1 行目が前置き、2 行目が本体 + 後置き)。
echo "==> wrap"
mkdir -p "${out_dir}"
for f in "${built[@]}"; do
  name=$(basename "${f}")
  {
    echo 'javascript: (function () {'
    cat "${f}"
    echo '})();'
  } >"${out_dir}/${name}"
  echo "    ${out_dir}/${name}"
done
