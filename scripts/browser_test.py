"""Browser acceptance tests. Dev-only dependency: pip install playwright.
Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to use a system Chromium installation.
Otherwise run: python -m playwright install chromium
"""
import json
import os
from pathlib import Path
import subprocess
import tempfile
import threading
import functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent
RESULTS = []


def record(name):
    RESULTS.append({"name": name, "passed": True})
    print("PASS", name, flush=True)


def run():
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(ROOT / "dist"))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = os.environ.get("LIVE_URL") or f"http://127.0.0.1:{server.server_port}/index.html"
    with sync_playwright() as pw, tempfile.TemporaryDirectory(prefix="failfold-browser-") as tmp:
        opts = {"headless": True}
        exe = os.environ.get("PLAYWRIGHT_CHROMIUM_EXECUTABLE")
        if exe:
            opts["executable_path"] = exe
        browser = pw.chromium.launch(**opts)
        context = browser.new_context(viewport={"width": 1440, "height": 1080}, accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(5000)
        external = []
        errors = []
        page.on("request", lambda r: external.append(r.url) if r.url.startswith(("https:", "http:")) and not (r.is_navigation_request() and r.url.rstrip("/") == url.rstrip("/")) else None)
        page.on("pageerror", lambda e: errors.append(str(e)))
        if os.environ.get("FAILFOLD_IN_MEMORY_TEST") == "1":
            context.set_offline(True)
            page.set_content((ROOT / "dist/index.html").read_text(encoding="utf-8"))
        else:
            page.goto(url)
            context.set_offline(True)
        expect(page.locator("#results")).to_be_hidden()
        record("standalone HTML runs with network disabled (see harness metadata)")
        page.locator("#demo").click()
        expect(page.locator("#metric-records")).to_have_text("240")
        expect(page.locator("#metric-groups")).to_have_text("3")
        expect(page.locator("#metric-folded")).to_have_text("98.8%")
        expect(page.locator("#metric-new")).to_have_text("1")
        expect(page.locator("#groups > .group")).to_have_count(3)
        expect(page.locator("#warning-box")).to_be_hidden()
        record("synthetic demo produces 240 -> 3 with one new signature")
        page.screenshot(path=str(ROOT / "docs/screenshot-desktop.png"), full_page=True)
        page.locator("#groups > .group > summary").first.click()
        expect(page.locator("#groups .group-body")).to_have_count(1)
        expect(page.locator("#groups .occurrence")).to_have_count(30)
        page.locator("#groups .occurrence summary").first.click()
        expect(page.locator("#groups .occurrence pre")).to_have_count(1)
        record("group and original occurrence details expand with paginated evidence")
        page.locator("#search").fill("ModuleNotFound")
        expect(page.locator("#groups > .group")).to_have_count(1)
        page.locator("#search").fill("")
        page.locator("#filter").select_option("new")
        expect(page.locator("#groups > .group")).to_have_count(1)
        record("search and relative-baseline filters work")
        page.locator("#filter").select_option("all")
        page.locator("#baseline-only > summary").click()
        expect(page.locator("#absent-groups > .group")).to_have_count(1)
        assert "not marked fixed" in page.locator("#baseline-only-title").inner_text()
        record("baseline-only signature is not mislabeled as fixed")
        with page.expect_download() as d:
            page.locator("#download-json").click()
        json_path = Path(tmp) / "report.json"
        d.value.save_as(json_path)
        expected = json.loads(subprocess.check_output(["node", "-e", "const c=require('./src/core'),d=require('./src/demo').create();process.stdout.write(JSON.stringify(c.analyze(d.current,d.baseline)))"], cwd=ROOT))
        assert json.loads(json_path.read_text(encoding="utf-8")) == expected
        with page.expect_download() as d:
            page.locator("#download-md").click()
        md_path = Path(tmp) / "report.md"
        d.value.save_as(md_path)
        expected_md = subprocess.check_output(["node", "-e", "const c=require('./src/core'),d=require('./src/demo').create();process.stdout.write(c.markdown(c.analyze(d.current,d.baseline)))"], cwd=ROOT).decode()
        assert md_path.read_text(encoding="utf-8") == expected_md
        record("browser JSON and Markdown are identical to Node core exports")
        page.locator("#clear-baseline").click()
        expect(page.locator("#metric-new")).to_have_text("—")
        expect(page.locator("#baseline-only")).to_be_hidden()
        record("clearing baseline removes unsupported new/fixed classifications")

        def upload(xml, name="input.xml"):
            page.locator("#current").set_input_files({"name": name, "mimeType": "application/xml", "buffer": xml.encode("utf-8")})

        upload('<testsuite><testcase name="x"><failure message="a">trace </failure></testcase><testcase name="y"><failure message="a">trace</failure></testcase></testsuite>')
        expect(page.locator("#metric-groups")).to_have_text("2")
        page.locator("#mode").select_option("formatting")
        expect(page.locator("#metric-groups")).to_have_text("1")
        assert "2 raw variants" in page.locator("#groups").inner_text()
        record("local upload and opt-in formatting preserve both original variants")
        upload('<testsuite><testcase><failure><![CDATA[<script>window.PWNED=1</script><img src="https://invalid.example/x" onerror="window.PWNED=2">]]></failure></testcase></testsuite>')
        expect(page.locator("#metric-groups")).to_have_text("1")
        page.locator("#groups > .group > summary").click()
        expect(page.locator("#groups .group-body")).to_have_count(1)
        assert page.evaluate("window.PWNED") is None
        assert page.locator("#groups img, #groups script").count() == 0
        assert not external
        record("hostile failure text is displayed as text without script or network execution")
        upload('<testsuite><testcase></testsuite>', "broken.xml")
        expect(page.locator("#status")).to_contain_text("malformed XML")
        expect(page.locator("#results")).to_be_hidden()
        record("invalid replacement input clears stale results and fails closed")
        upload('<!DOCTYPE testsuite SYSTEM "https://invalid.example/dtd"><testsuite/>', "dtd.xml")
        expect(page.locator("#status")).to_contain_text("DTD")
        expect(page.locator("#results")).to_be_hidden()
        record("DTD input is rejected before analysis")
        upload('<testsuite><testcase name="a"><failure/></testcase><testcase name="b"><failure/></testcase></testsuite>')
        expect(page.locator("#metric-groups")).to_have_text("2")
        expect(page.locator("#groups .badge.unknown")).to_have_count(2)
        record("blank failures are not merged and carry unknown evidence status")
        page.locator("#current").set_input_files({"name": "oversize.xml", "mimeType": "application/xml", "buffer": b"x" * (5*1024*1024+1)})
        expect(page.locator("#status")).to_contain_text("size limit")
        expect(page.locator("#results")).to_be_hidden()
        record("file size guard rejects oversized reports before parsing")
        page.evaluate("document.getElementById('demo').click();document.getElementById('cancel').click()")
        expect(page.locator("#status")).to_contain_text("cancelled")
        expect(page.locator("#results")).to_be_hidden()
        record("worker cancellation leaves no partial report")
        page.locator("#demo").click()
        expect(page.locator("#metric-groups")).to_have_text("3")
        page.set_viewport_size({"width": 390, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        page.screenshot(path=str(ROOT / "docs/screenshot-mobile.png"), full_page=True)
        record("390px mobile viewport has no horizontal page overflow")
        page.locator("#reset").click()
        expect(page.locator("#results")).to_be_hidden()
        assert page.locator("#current").input_value() == ""
        record("clear all releases selected report state")
        assert not external, external
        assert not errors, errors
        record("entire acceptance run has zero external requests and zero page errors")
        browser.close()
    server.shutdown()
    server.server_close()
    (ROOT / "docs/browser-test-results.json").write_text(json.dumps({"passed": len(RESULTS), "harness": "in-memory HTML; managed browser blocks file/localhost navigation" if os.environ.get("FAILFOLD_IN_MEMORY_TEST") == "1" else ("file URL navigation then offline" if url.startswith("file:") else "HTTP navigation then offline"), "results": RESULTS}, indent=2)+"\n")
    print(f"{len(RESULTS)}/{len(RESULTS)} browser acceptance checks passed.")

if __name__ == "__main__":
    run()
