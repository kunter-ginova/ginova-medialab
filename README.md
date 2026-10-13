# GiNOVA MediaLab

Static source for https://medialab.ginova.net/.

## Local build

Run `python3 scripts/build.py` from the repository root. No Python packages are required.

Selected original media files, including large audio/video and selected images, are stored in `media-parts/` as byte-exact pieces. `scripts/media-parts-manifest.json` maps each sequence to its original runtime path and records hashes. The build reconstructs the original files under `dist/` and verifies all 93 source files against `scripts/source-manifest.json` using SHA256 and Git blob hashes.

The source README is verified from `scripts/original-root-readme.md` and is intentionally excluded from the public runtime. `dist/` therefore contains 92 original static files. Build scripts, parts, workflow files and this README are not deployed.

## GitHub Pages

The Pages workflow reconstructs and verifies the static runtime, uploads only `dist/`, and deploys that artifact. Select GitHub Actions as the repository's Pages build source. The original asset paths, media bytes, styles, controls and ten-language content are preserved.

Font copyright and license notices are included under `assets/fonts/`.
