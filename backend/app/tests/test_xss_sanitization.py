"""XSS sanitization tests for announcement content (ÉTAPE 3.3)."""
import pytest

from app.services.announcement_service import sanitize_html


XSS_PAYLOADS = [
    ("<script>alert(1)</script>", "script tag removed"),
    ('<img src=x onerror=alert(1)>', "onerror event removed"),
    ('<a href="javascript:alert(1)">click</a>', "javascript: URI removed"),
    ('<p onmouseover="alert(1)">text</p>', "onmouseover event removed"),
    ("<iframe src=\"https://evil.com\">", "iframe removed"),
    ("<svg onload=alert(1)>", "svg removed"),
    ('<!--<script>alert(1)</script>-->', "HTML comment with script removed"),
    ('<form action="https://evil.com"><input></form>', "form removed"),
    ('<meta http-equiv="refresh" content="0;url=evil">', "meta refresh removed"),
    ('<div style="background:url(javascript:alert(1))">', "style with JS removed"),
]


@pytest.mark.parametrize("payload,description", XSS_PAYLOADS, ids=[d for _, d in XSS_PAYLOADS])
def test_xss_payload_sanitized(payload: str, description: str) -> None:
    """Each XSS payload must be neutralized by sanitize_html."""
    result = sanitize_html(payload)
    assert "script" not in result.lower(), f"script tag still present: {result}"
    assert "javascript:" not in result.lower(), f"javascript: URI still present: {result}"
    assert "onerror" not in result.lower(), f"onerror handler still present: {result}"
    assert "onload" not in result.lower(), f"onload handler still present: {result}"
    assert "onmouseover" not in result.lower(), f"onmouseover handler still present: {result}"
    assert "<iframe" not in result.lower(), f"iframe still present: {result}"
    assert "<form" not in result.lower(), f"form tag still present: {result}"


class TestSanitizeHtmlPreserves:
    """Verify safe HTML tags are preserved after sanitization."""

    def test_paragraph_preserved(self) -> None:
        result = sanitize_html("<p>Hello world</p>")
        assert "<p>" in result.lower()
        assert "Hello world" in result

    def test_bold_preserved(self) -> None:
        result = sanitize_html("<strong>bold</strong>")
        assert "<strong>" in result.lower()

    def test_link_preserved(self) -> None:
        result = sanitize_html('<a href="https://example.com">link</a>')
        assert "<a" in result.lower()
        assert "https://example.com" in result

    def test_img_preserved(self) -> None:
        result = sanitize_html('<img src="https://example.com/img.png" alt="test">')
        assert "<img" in result.lower()

    def test_empty_string(self) -> None:
        assert sanitize_html("") == ""

    def test_plain_text(self) -> None:
        result = sanitize_html("Just plain text")
        assert result == "Just plain text"
