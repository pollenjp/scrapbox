#!/usr/bin/env bash
set -euxC -o pipefail

target_dir="${1:-./build}"

shell_content=$(
  cat <<'__EOF__'
npx terser --config-file terser.options.json --output "$1" --compress -- "$1"
__EOF__
)
find "${target_dir}" -type f -name "*.js" -print0 | xargs -0 -t -n1 -P4 bash -c "${shell_content}" argv0
