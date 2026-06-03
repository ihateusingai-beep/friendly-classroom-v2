#!/usr/bin/env python3
import urllib.request, base64, json, sys

token = "ghp_Ly...xQZ4"
repo = "ihateusingai-beep/friendly-classroom-v2"
path = "dist/assets/index-C4rsrQZy.js"

log = []

try:
    url = f"https://api.github.com/repos/{repo}/contents/{path}?ref=main"
    req = urllib.request.Request(url, headers={"Authorization": f"token {token}"})

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read())
        sha = data['sha']
        content = base64.b64decode(data['content']).decode()

    log.append(f"Downloaded: {len(content)} chars")
    log.append(f"祝卓鋒: {content.count('祝卓鋒')} 處")
    log.append(f"張鈞保: {content.count('張鈞保')} 處")

    new_content = content.replace('祝卓鋒', '小希').replace('張鈞保', '小明')

    encoded = base64.b64encode(new_content.encode()).decode()
    body = json.dumps({
        "message": "fix: replace student names (祝卓鋒→小希, 張鈞保→小明)",
        "sha": sha,
        "content": encoded
    })

    req2 = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/contents/{path}",
        data=body.encode(),
        headers={"Authorization": f"token {token}", "Content-Type": "application/json"},
        method="PUT"
    )
    with urllib.request.urlopen(req2) as resp:
        result = json.loads(resp.read())
        log.append(f"SUCCESS: {result['commit']['html_url']}")
except Exception as e:
    log.append(f"ERROR: {e}")

with open('/tmp/names-fix-log.txt', 'w') as f:
    f.write('\n'.join(log))