#!/usr/bin/env bash
# shellcheck shell=bash
#
# 整形と検査。`make fmt` と `npm run lint` の置き換え。
#
#   ./scripts/lint.sh          検査だけ (差分があれば失敗する)
#   ./scripts/lint.sh --fix    直せるものは直す
#
# ## 見ているもの
#
#   src/**/*.ts   biome (整形 + lint)。規則は biome.jsonc
#   src/**/*.ts   tsc --noEmit。biome は型を見ないので別に要る
#   *.sh          shfmt (mvdan/sh) の整形確認 と shellcheck
#   *.nix         nixfmt の整形確認
#
# biome の警告は失敗にしない。未使用の DOM ヘルパのように、道具の入れ替えとは
# 別に片付けるべきものを残してあるため (biome.jsonc の linter 節に理由がある)。
#
# ## 道具の入手
#
# biome / tsc / shfmt / shellcheck / nixfmt は flake.nix の devShell が持っている。
# PATH に無ければ **自動で `nix develop` に入り直す**ので、普段は `nix develop` を
# 意識せず ./scripts/lint.sh と打てばよい。

set -eu -o pipefail

project_root=$(
  cd -- "$(dirname "$0")/.." &>/dev/null
  pwd -P
)
cd "${project_root}"

fix=0
args=("$@") # devShell へ入り直すときにそのまま渡す
while [[ $# -gt 0 ]]; do
  case "$1" in
    --fix | --write)
      fix=1
      ;;
    *)
      echo "unknown option: $1" >&2
      echo "usage: $0 [--fix]" >&2
      exit 2
      ;;
  esac
  shift
done

have() {
  command -v "$1" &>/dev/null
}

# 道具が揃っていなければ devShell へ入り直す。
# 印を付けて 1 回だけにする (devShell に入っても揃わない場合の無限ループ防止)。
if ! have biome || ! have tsc || ! have shfmt || ! have shellcheck || ! have nixfmt; then
  if [[ -z ${BOOKMARKLET_LINT_REEXEC:-} ]] && have nix; then
    echo "==> 道具が PATH に無いので nix develop に入り直します"
    export BOOKMARKLET_LINT_REEXEC=1
    # git flake なので flake.nix / flake.lock は追跡されている必要がある
    # (`${args[@]+...}` は空配列と set -u の組み合わせを避けるため)
    exec nix develop "${project_root}" --command "$0" ${args[@]+"${args[@]}"}
  fi
  echo "biome / tsc / shfmt / shellcheck / nixfmt が見つかりません。" >&2
  echo "  nix があれば devShell へ自動で入り直します。無い環境では次のいずれかを:" >&2
  echo "    - nix を入れる (curl -fsSL https://install.determinate.systems/nix | sh -s -- install)" >&2
  echo "    - biome / typescript / shfmt / shellcheck / nixfmt を手で入れる" >&2
  exit 1
fi

errors=0

err() {
  printf 'ERROR %s\n' "$*" >&2
  errors=$((errors + 1))
}

#################
# src/**/*.ts   #
#################

echo "==> biome"
if [[ ${fix} -eq 1 ]]; then
  biome check --write . || err "biome: 自動修正では直らない指摘があります"
else
  biome check . || err "biome: 指摘があります (--fix で直せるものもあります)"
fi

# biome は型を見ない。emit は build.sh の仕事なので、ここでは検査だけする。
echo "==> tsc --noEmit"
tsc --noEmit || err "tsc: 型エラーがあります"

##########
# *.sh   #
##########

# 整形規則は .editorconfig にある (shfmt は引数を渡さなければそれを読む)。
# dotfiles / claude-skills 側の *.sh と同じ設定に揃えてある。
echo "==> shfmt / shellcheck"
sh_files=()
while IFS= read -r f; do
  [[ -n ${f} ]] || continue
  sh_files+=("${f}")
done < <(find . -type f -name '*.sh' ! -path './.git/*' ! -path './build/*' | sort)

if [[ ${#sh_files[@]} -eq 0 ]]; then
  echo "  (*.sh なし)"
elif [[ ${fix} -eq 1 ]]; then
  shfmt -w "${sh_files[@]}"
  shellcheck "${sh_files[@]}" || err "shellcheck: 指摘があります"
else
  shfmt -d "${sh_files[@]}" || err "shfmt: 整形されていません (--fix で直す)"
  shellcheck "${sh_files[@]}" || err "shellcheck: 指摘があります"
fi

##########
# *.nix  #
##########

echo "==> nixfmt"
nix_files=()
while IFS= read -r f; do
  [[ -n ${f} ]] || continue
  nix_files+=("${f}")
done < <(find . -type f -name '*.nix' ! -path './.git/*' ! -path './build/*' | sort)

if [[ ${#nix_files[@]} -eq 0 ]]; then
  echo "  (*.nix なし)"
elif [[ ${fix} -eq 1 ]]; then
  nixfmt "${nix_files[@]}"
else
  nixfmt --check "${nix_files[@]}" || err "nixfmt: 整形されていません (--fix で直す)"
fi

##########
# 結果   #
##########

echo
if [[ ${errors} -gt 0 ]]; then
  printf 'エラー %d\n' "${errors}"
  exit 1
fi
echo "通過しました。"
