"""Download once at authoring time; the finished app makes no image API calls."""
import concurrent.futures
import json
import pathlib
import requests

root = pathlib.Path(__file__).resolve().parents[1]
output = root / 'public' / 'photos'
output.mkdir(parents=True, exist_ok=True)
photos = json.loads((root / 'scripts' / 'asset-manifest.json').read_text(encoding='utf-8-sig'))

def download(photo):
    if photo['image'] in ['local', 'generated']:
        return None
    destination = output / f"{photo['id']}.jpg"
    if destination.exists() and destination.stat().st_size > 1000:
        return (photo['id'], 'cached')
    url = f"https://images.unsplash.com/photo-{photo['image']}?auto=format&fit=crop&w=800&q=82"
    try:
        response = requests.get(url, timeout=35)
        response.raise_for_status()
        if not response.headers.get('content-type', '').startswith('image/'):
            raise ValueError('Not an image response')
        destination.write_bytes(response.content)
        return (photo['id'], f'{len(response.content)} bytes')
    except Exception as error:
        return (photo['id'], f'FAILED: {error}')

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
    for result in pool.map(download, photos):
        if result:
            print(*result, flush=True)

for i, photo in enumerate(p for p in photos if p['cluster'] == 'document'):
    card = 'id card' in photo['scene']
    bg = ['#d1c8b8', '#c0c7bb', '#b9c3cb'][i % 3]
    paper = '#f6f1e7'
    if card:
        contents = f'''<rect x="75" y="120" width="450" height="270" rx="20" fill="{paper}"/>
        <path d="M75 142q0-22 22-22h406q22 0 22 22v40H75" fill="#6a8d7c"/>
        <text x="105" y="159" font-size="17" fill="white" letter-spacing="2">SAMPLE IDENTITY CARD</text>
        <rect x="107" y="210" width="95" height="116" rx="8" fill="#c9d6cc"/>
        <circle cx="155" cy="249" r="22" fill="#9cab9f"/><path d="M123 311q0-44 32-44t32 44" fill="#9cab9f"/>
        <text x="227" y="239" font-size="18" fill="#434e46">DEMO PERSON</text>
        <text x="227" y="270" font-size="14" fill="#758278">XXXX • XXXX • 0000</text>
        <path d="M227 300h200m-200 22h145" stroke="#c5cbc0" stroke-width="8"/>
        <text x="105" y="365" font-size="12" fill="#758278">FICTIONAL SAMPLE · NOT A VALID DOCUMENT</text>'''
    else:
        headings = ['Travel notes', 'Saved for later', 'Weekend itinerary', 'Sketchbook notes']
        heading = headings[(i - 1) % 4]
        contents = f'''<rect x="112" y="45" width="376" height="430" rx="5" fill="{paper}"/>
        <text x="149" y="112" font-size="26" fill="#33453a">{heading}</text>
        <text x="149" y="146" font-size="13" letter-spacing="2" fill="#829087">DEMO DOCUMENT</text>
        <path d="M149 186h270m-270 29h230m-230 29h260m-260 29h180m-180 56h270m-270 29h225m-225 29h250" stroke="#c9cdc2" stroke-width="9"/>
        <text x="149" y="440" font-size="11" fill="#829087">Illustrative content only</text>'''
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 520">
    <defs><filter id="shadow"><feDropShadow dx="2" dy="8" stdDeviation="10" flood-opacity=".17"/></filter></defs>
    <rect width="600" height="520" fill="{bg}"/><g transform="rotate({-4 + i * 1.5} 300 260)" filter="url(#shadow)" font-family="Arial,sans-serif">{contents}</g></svg>'''
    (output / f"{photo['id']}.svg").write_text(svg, encoding='utf-8')

(output / 'fallback.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#25332b"/><circle cx="440" cy="145" r="56" fill="#687d6c"/><path d="M0 470L190 210l145 185 90-118L600 500v100H0z" fill="#415b4c"/><path d="M0 545l190-220 145 185 90-118L600 575v25H0z" fill="#33493c"/></svg>''', encoding='utf-8')
