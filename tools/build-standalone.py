"""
Gera a versão de arquivo único do site (dist/HidrauMeister.html).

Lê site/index.html e embute nele os arquivos CSS, o JavaScript e as
imagens da pasta site/assets. O resultado abre direto no navegador,
de qualquer lugar, sem precisar da pasta assets ao lado.

Uso (a partir da pasta C:\\hm):
    python tools/build-standalone.py

Sempre edite os arquivos em site/ e rode este script de novo;
não edite o arquivo gerado em dist/.
"""
import base64
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT
OUT = ROOT / "dist" / "HidrauMeister.html"


def read(rel):
    return (SITE / rel).read_text(encoding="utf-8")


def inline_css(match):
    return "<style>\n" + read(match.group(1)) + "</style>"


def inline_js(html):
    # Script embutido ignora "defer", então ele vai para o fim do <body>,
    # onde o HTML da página já existe quando o código roda.
    scripts = re.findall(r'<script src="(assets/js/[^"]+)"[^>]*></script>\n?', html)
    html = re.sub(r'[ \t]*<script src="assets/js/[^"]+"[^>]*></script>\n?', "", html)
    code = "".join("<script>\n" + read(rel) + "</script>\n" for rel in scripts)
    return html.replace("</body>", code + "</body>")


def inline_image(match):
    attr, rel = match.group(1), match.group(2)
    mime = mimetypes.guess_type(rel)[0] or "application/octet-stream"
    data = base64.b64encode((SITE / rel).read_bytes()).decode("ascii")
    return '%s="data:%s;base64,%s"' % (attr, mime, data)


def main():
    html = read("index.html")
    html = re.sub(r'<link rel="stylesheet" href="(assets/css/[^"]+)">', inline_css, html)
    html = inline_js(html)
    html = re.sub(r'\b(src|href)="(assets/img/[^"]+)"', inline_image, html)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print("Gerado: %s (%.1f MB)" % (OUT, OUT.stat().st_size / 1e6))


if __name__ == "__main__":
    main()
