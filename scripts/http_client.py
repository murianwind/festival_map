"""curl 기반 HTTP GET.

data.go.kr 서버는 TLS 재협상을 요구해 Python urllib/OpenSSL이 멈추는 문제가 있어
(ev_charger_map에서 확인) curl 서브프로세스로 호출한다.
"""
import subprocess
import time


class HttpError(RuntimeError):
    pass


def _mask(text, secrets):
    for secret in secrets:
        if secret:
            text = text.replace(secret, "***")
    return text


def get_text(url, headers=None, timeout=30, retries=3, secrets=()):
    """본문 문자열을 돌려준다. 실패 메시지에서는 secrets 값을 가린다."""
    command = ["curl", "-sS", "--fail-with-body", "--max-time", str(timeout), "-L"]
    for name, value in (headers or {}).items():
        command += ["-H", f"{name}: {value}"]
    command.append(url)

    last_error = ""
    for attempt in range(1, retries + 1):
        result = subprocess.run(command, capture_output=True, timeout=timeout + 10)
        if result.returncode == 0:
            return result.stdout.decode("utf-8")
        last_error = (result.stderr or result.stdout).decode("utf-8", "replace")[:300]
        if attempt < retries:
            time.sleep(2 * attempt)
    raise HttpError(_mask(f"GET {url} 실패: {last_error}", secrets))
