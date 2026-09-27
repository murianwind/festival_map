"""JSON 파일 읽기/쓰기와 저장 전 안전성 판단."""
import json
import os
import tempfile

MIN_KEEP_RATIO = 0.5


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def save_json(path, data):
    """임시 파일에 쓴 뒤 교체해 중간에 끊겨도 파일이 깨지지 않게 한다."""
    directory = os.path.dirname(path) or "."
    os.makedirs(directory, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(dir=directory, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, separators=(",", ":"))
    os.replace(temp_path, path)


def is_suspicious_drop(new_count, previous_count):
    """이전보다 너무 많이 줄었으면 수집 이상으로 본다."""
    if new_count == 0:
        return True
    return previous_count > 0 and new_count < previous_count * MIN_KEEP_RATIO
