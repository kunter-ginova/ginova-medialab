#!/usr/bin/env python3
"""Reconstruct the exact GiNOVA MediaLab static runtime with Python's stdlib."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import shutil
import tempfile


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_PUBLIC_FILES = {"README.md"}


def safe_path(base, relative):
    path = PurePosixPath(relative)
    if path.is_absolute() or ".." in path.parts or not path.parts:
        raise ValueError(f"Unsafe source path: {relative}")
    resolved = base.joinpath(*path.parts)
    if not resolved.resolve().is_relative_to(base.resolve()):
        raise ValueError(f"Source path escapes its root: {relative}")
    return resolved


def digest_file(path):
    size = path.stat().st_size
    sha256 = hashlib.sha256()
    git_blob = hashlib.sha1(b"blob " + str(size).encode("ascii") + b"\0")
    with path.open("rb") as stream:
        while data := stream.read(1024 * 1024):
            sha256.update(data)
            git_blob.update(data)
    return size, sha256.hexdigest(), git_blob.hexdigest()


def require_hashes(path, expected):
    actual = digest_file(path)
    planned = (expected["bytes"], expected["sha256"], expected["git_blob_sha"])
    if actual != planned:
        raise ValueError(f"Source integrity mismatch for {expected['path']}: {actual} != {planned}")


def main():
    manifest = json.loads((ROOT / "scripts/source-manifest.json").read_text())
    parts_doc = json.loads((ROOT / "scripts/media-parts-manifest.json").read_text())
    expected = {entry["path"]: entry for entry in manifest}
    if len(expected) != len(manifest):
        raise ValueError("Duplicate paths in the source manifest")
    split_assets = {entry["path"]: entry for entry in parts_doc["assets"]}
    if len(split_assets) != len(parts_doc["assets"]):
        raise ValueError("Duplicate paths in the media parts manifest")
    if not set(split_assets).issubset(expected):
        raise ValueError("Media parts map contains an unplanned runtime file")
    verified = 0
    with tempfile.TemporaryDirectory(prefix=".dist-stage-", dir=ROOT) as stage_name:
        stage = Path(stage_name)
        for relative, entry in sorted(expected.items()):
            output = safe_path(stage, relative)
            if relative in EXCLUDED_PUBLIC_FILES:
                source = ROOT / "scripts/original-root-readme.md"
                require_hashes(source, entry)
                verified += 1
                continue
            output.parent.mkdir(parents=True, exist_ok=True)
            if relative in split_assets:
                split = split_assets[relative]
                if any(split[key] != entry[key] for key in ("bytes", "sha256", "git_blob_sha")):
                    raise ValueError(f"Media and source manifest disagree for {relative}")
                with output.open("wb") as destination:
                    for part in split["parts"]:
                        source = safe_path(ROOT, part["path"])
                        size, digest, _ = digest_file(source)
                        if size != part["bytes"] or digest != part["sha256"]:
                            raise ValueError(f"Media part integrity mismatch: {part['path']}")
                        with source.open("rb") as stream:
                            shutil.copyfileobj(stream, destination)
            else:
                source = safe_path(ROOT, relative)
                shutil.copyfile(source, output)
            require_hashes(output, entry)
            verified += 1
        actual_paths = {path.relative_to(stage).as_posix() for path in stage.rglob("*") if path.is_file()}
        required_paths = set(expected) - EXCLUDED_PUBLIC_FILES
        if actual_paths != required_paths:
            raise ValueError("Reconstructed runtime file set does not match the manifest")
        if any(path.startswith(("media-parts/", "scripts/", ".github/")) or path == "README.md"
               for path in actual_paths):
            raise ValueError("Build-only source content reached the public runtime")
        destination = ROOT / "dist"
        if destination.exists():
            shutil.rmtree(destination)
        shutil.copytree(stage, destination)
    result = {"verified_source_files": verified,
              "public_runtime_files": len(required_paths),
              "public_runtime_bytes": sum(expected[path]["bytes"] for path in required_paths),
              "excluded_public_files": sorted(EXCLUDED_PUBLIC_FILES),
              "reconstructed_split_assets": len(split_assets),
              "output_directory": str(ROOT / "dist")}
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
