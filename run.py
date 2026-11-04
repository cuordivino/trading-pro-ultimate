import sys
import os
import webbrowser
import threading
import time

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, 'backend')
sys.path.insert(0, backend_dir)

from app import app

def open_browser(port):
    time.sleep(1.2)
    url = f"http://localhost:{port}"
    print(f"[*] Opening browser at {url}...")
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print("=" * 65)
    print("  TRADING PRO ULTIMATE x INVESTOR SKILLS AI TERMINAL")
    print("=" * 65)
    print(f"[*] Starting local server on http://localhost:{port}")
    print("[*] 63 Investor Skills Mental Models loaded.")
    print("[*] Press Ctrl+C to terminate.")
    print("=" * 65)

    threading.Thread(target=open_browser, args=(port,), daemon=True).start()
    app.run(host='0.0.0.0', port=port, debug=False)
