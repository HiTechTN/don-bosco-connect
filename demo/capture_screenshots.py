"""
Phase 3.3 — Playwright Demo Capture Script
Capture screenshots of all user journeys for inclusion in the demo video.

Usage (when app is deployed):
  python demo/capture_screenshots.py --base-url http://donbosco.local

Requires:
  pip install playwright
  playwright install chromium
"""

import argparse
import json
import os
from pathlib import Path
from time import sleep

ASSETS = Path(__file__).resolve().parent.parent / "assets"
ASSETS.mkdir(exist_ok=True)

CREDENTIALS = {
    "admin": {"email": "admin@donbosco.tn", "password": "admin123!"},
    "teacher": {"email": "karim.hamdi@donbosco.tn", "password": "teacher123!"},
    "student": {"email": "adam.slim@donbosco.tn", "password": "student123!"},
    "parent": {"email": "ahmed.slim@parent.tn", "password": "parent123!"},
}


async def capture_journey(page, base_url: str):
    shots = {}

    # ── 1. Login page ──
    await page.goto(f"{base_url}/login")
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_login.png"))
    shots["login"] = "demo_login.png"

    # ── 2. Teacher: login + upload course ──
    creds = CREDENTIALS["teacher"]
    await page.fill('input[name="email"]', creds["email"])
    await page.fill('input[name="password"]', creds["password"])
    await page.click('button[type="submit"]')
    await page.wait_for_url("**/teacher/**", timeout=10000)
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_teacher_dashboard.png"))
    shots["teacher_dashboard"] = "demo_teacher_dashboard.png"

    await page.goto(f"{base_url}/teacher/courses")
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_teacher_courses.png"))
    shots["teacher_courses"] = "demo_teacher_courses.png"

    # ── 3. Student: AI Chat + Quiz ──
    await page.goto(f"{base_url}/login")
    await page.wait_for_load_state("networkidle")
    creds = CREDENTIALS["student"]
    await page.fill('input[name="email"]', creds["email"])
    await page.fill('input[name="password"]', creds["password"])
    await page.click('button[type="submit"]')
    await page.wait_for_url("**/student/**", timeout=10000)
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_student_dashboard.png"))
    shots["student_dashboard"] = "demo_student_dashboard.png"

    await page.goto(f"{base_url}/student/quiz")
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_student_quiz.png"))
    shots["student_quiz"] = "demo_student_quiz.png"

    await page.goto(f"{base_url}/student/chat")
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_student_ai_chat.png"))
    shots["student_ai_chat"] = "demo_student_ai_chat.png"

    # ── 4. Parent: dashboard ──
    await page.goto(f"{base_url}/login")
    await page.wait_for_load_state("networkidle")
    creds = CREDENTIALS["parent"]
    await page.fill('input[name="email"]', creds["email"])
    await page.fill('input[name="password"]', creds["password"])
    await page.click('button[type="submit"]')
    await page.wait_for_url("**/parent/**", timeout=10000)
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_parent_dashboard.png"))
    shots["parent_dashboard"] = "demo_parent_dashboard.png"

    await page.goto(f"{base_url}/parent/grades")
    await page.wait_for_load_state("networkidle")
    await page.screenshot(path=str(ASSETS / "demo_parent_grades.png"))
    shots["parent_grades"] = "demo_parent_grades.png"

    # Save manifest
    manifest_path = ASSETS / "screenshot_manifest.json"
    manifest_path.write_text(json.dumps(shots, indent=2))
    print(f"[CAPTURE] {len(shots)} screenshots saved to {ASSETS}")
    print(f"[CAPTURE] Manifest: {manifest_path}")
    return shots


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:5173")
    args = parser.parse_args()

    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        try:
            await capture_journey(page, args.base_url)
        finally:
            await browser.close()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
