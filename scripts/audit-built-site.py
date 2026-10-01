"""Read-only checks of generated pages, links, language parity and footer order."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
root=Path('dist')
locales=['en','fr','es','it','de','ja','zh']
class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.links=[];self.assets=[];self.lang=None;self.footer=False;self.after=[];self.scripts=0;self.text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a.get('lang')
  if tag in ['a','link'] and 'href' in a:self.links.append(a['href'])
  if tag in ['img','script'] and 'src' in a:self.assets.append(a['src'])
  if tag=='script':self.scripts+=1
  if self.footer and tag in ['section','main','footer']:self.after.append(tag)
 def handle_endtag(self,tag):
  if tag=='footer':self.footer=True
  if tag=='script':self.scripts-=1
 def handle_data(self,text):
  if not self.scripts:self.text.append(text.strip())
errors=[];counts={};total=0
for locale in locales:
 pages=list((root/locale).rglob('*.html'));counts[locale]=len(pages)
 for path in pages:
  total+=1;p=Page();p.feed(path.read_text())
  if not (p.lang or '').startswith(locale):errors.append(f'{path}: wrong language {p.lang}')
  if not p.footer or p.after:errors.append(f'{path}: footer structure {p.after}')
  for value in p.links+p.assets:
   url=urlsplit(value)
   if url.scheme or url.netloc or not url.path.startswith('/') or url.path.startswith('/.netlify/'):continue
   dest=root/unquote(url.path).lstrip('/')
   if not dest.exists() and not (dest/'index.html').exists():errors.append(f'{path}: missing {value}')
  if any('undefined'==t or 'NaN'==t for t in p.text):errors.append(f'{path}: invalid visible placeholder')
base={p.relative_to(root/'en') for p in (root/'en').rglob('*.html')}
for locale in locales:
 if {p.relative_to(root/locale) for p in (root/locale).rglob('*.html')}!=base:errors.append(f'{locale}: page set differs')
print(json.dumps({'localizedPages':total,'pagesPerLanguage':counts,'errors':errors},indent=2))
raise SystemExit(bool(errors))
