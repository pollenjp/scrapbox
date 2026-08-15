{
  description = "scrapbox bookmarklet build toolchain";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { nixpkgs, ... }:
    let
      inherit (nixpkgs) lib;

      # dotfiles/nix/flake.nix と同じ範囲。x86_64-darwin (Intel Mac) は
      # nixpkgs 26.11 でサポートが打ち切られているので含めない。
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAllSystems = lib.genAttrs systems;
    in
    {
      # scripts/build.sh と scripts/lint.sh が使う道具。
      #
      # 以前は nvm + package.json + node_modules で揃えていたが、この devShell に
      # 全部移した。npm install は要らないし、node_modules も生えない。
      #
      # 各スクリプトは道具が PATH に無ければこの devShell へ自動で入り直す。
      # そのため普段は `nix develop` を意識しなくてよい。
      #
      #   ./scripts/build.sh         そのまま動く (必要なら勝手に devShell へ入る)
      #   ./scripts/lint.sh
      #   nix develop                手で入る場合
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShellNoCC {
            packages = [
              # src/*.ts -> build/*.js
              pkgs.typescript

              # build/*.js の minify。bookmarklet は URL 長に上限のある
              # ブックマークへ貼るので、minify は任意ではなく必須。
              pkgs.terser

              # eslint + prettier + prettier-eslint(-cli) の置き換え。
              # eslint 系は @typescript-eslint プラグインが npm 経由でしか
              # 入らず、node_modules を消せなくなるので単体バイナリに寄せた。
              pkgs.biome

              # 以下はこのリポジトリ自身の *.sh / *.nix を検査するためのもの
              pkgs.shfmt # mvdan/sh
              pkgs.shellcheck
              pkgs.nixfmt
            ];
          };
        }
      );

      formatter = forAllSystems (system: nixpkgs.legacyPackages.${system}.nixfmt);
    };
}
