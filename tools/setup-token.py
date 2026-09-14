# Runs `claude setup-token` inside a ConPTY (no visible window) so it believes it has a terminal.
# Output mirrors to .setup-token.out; anything written to .setup-token.in is typed into the session.
import os, sys, time, shutil
import winpty
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '.setup-token.out'); IN = os.path.join(ROOT, '.setup-token.in')
exe = shutil.which('claude') or 'claude'
p = winpty.PtyProcess.spawn([exe, 'setup-token'], dimensions=(40, 140), cwd=ROOT)
buf = ''
last_in = ''
while p.isalive():
    try:
        d = p.read(4096)
        if d:
            buf += d
            with open(OUT, 'w', encoding='utf-8') as f: f.write(buf)
    except EOFError:
        break
    except Exception:
        time.sleep(0.2)
    if os.path.exists(IN):
        try:
            s = open(IN, encoding='utf-8').read()
            os.remove(IN)
            if s:
                p.write(s if s.endswith('\r') or s.endswith('\n') else s + '\r')
        except Exception:
            pass
    time.sleep(0.15)
try:
    buf += p.read(65536)
except Exception:
    pass
with open(OUT, 'w', encoding='utf-8') as f: f.write(buf + '\n[exited %s]\n' % p.exitstatus)
