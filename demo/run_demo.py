"""
Don Bosco Connect — Demo Automation Pipeline
Orchestrates: TTS audio generation -> Slide video generation -> (optional) Playwright capture.

Usage:
  python demo/run_demo.py          # Full pipeline (TTS + video)
  python demo/run_demo.py --capture --base-url http://donbosco.local   # With Playwright
"""

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def run_step(label: str, script: str):
    print(f"\n{'='*60}")
    print(f"[STEP] {label}")
    print(f"{'='*60}")
    result = subprocess.run([sys.executable, script], cwd=ROOT)
    if result.returncode != 0:
        print(f"[FAIL] {label} exited with code {result.returncode}")
        sys.exit(result.returncode)
    print(f"[OK] {label}\n")


def main():
    parser = argparse.ArgumentParser(description="Don Bosco Connect Demo Pipeline")
    parser.add_argument("--capture", action="store_true", help="Also run Playwright screenshot capture")
    parser.add_argument("--base-url", default="http://localhost:5173", help="Base URL for capture")
    args = parser.parse_args()

    run_step("TTS Audio Generation", "demo/generate_audio.py")
    run_step("Demo Video Generation", "demo/generate_video.py")

    if args.capture:
        run_step("Playwright Screenshot Capture", "demo/capture_screenshots.py")

    print(f"\n{'='*60}")
    print("[DONE] Demo pipeline complete!")
    assets = ROOT / "assets"
    for f in sorted(assets.iterdir()):
        print(f"  {f.name} ({f.stat().st_size / 1024:.1f} KB)")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
