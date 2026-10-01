// Keep gallery navigation in place; ordinary links remain the no-JS fallback.
const seriesPath = location.pathname.replace(/\d+\/$/, '');
let pending;
history.scrollRestoration = 'manual';

async function showArtwork(url, push = true) {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Artwork unavailable');
    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const replacement = page.querySelector('.image-page');
    const photo = replacement?.querySelector('img');
    if (!replacement || !photo) throw new Error('Missing artwork');
    // Decode the selected responsive source before removing the current photograph.
    const ready = new Image();
    ready.sizes = photo.sizes;
    ready.srcset = photo.srcset;
    ready.src = photo.src;
    await ready.decode();
    if (controller.signal.aborted) return;
    const top = document.querySelector('#artwork').getBoundingClientRect().top;
    const focused = document.activeElement;
    const direction = focused?.closest('.image-navigation')
      ? (focused === focused.parentElement.firstElementChild ? 'first' : 'last') : null;
    document.querySelector('.image-page').replaceWith(replacement);
    document.title = page.title;
    for (const selector of ['link[rel="canonical"]', 'link[rel="alternate"]', 'meta[name="description"]', 'meta[property^="og:"]']) {
      document.head.querySelectorAll(selector).forEach(node => node.remove());
      page.head.querySelectorAll(selector).forEach(node => document.head.append(node.cloneNode(true)));
    }
    const languages = page.querySelectorAll('[data-language-link]');
    document.querySelectorAll('[data-language-link]').forEach((link, index) => {
      if (languages[index]) link.href = languages[index].getAttribute('href') + '#artwork';
    });
    if (push) history.pushState(null, '', url);
    // Instant correction in the same frame, before paint; never animate scrolling.
    window.scrollBy({ top: document.querySelector('#artwork').getBoundingClientRect().top - top, behavior: 'instant' });
    if (direction) replacement.querySelector(`.image-navigation a:${direction}-child`)?.focus({ preventScroll: true });
  } catch (error) {
    if (!controller.signal.aborted) location.assign(url);
  }
}

document.addEventListener('click', event => {
  const link = event.target.closest?.('.image-navigation a');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || url.hash !== '#artwork') return;
  event.preventDefault();
  showArtwork(url.href);
});

window.addEventListener('popstate', () => {
  if (location.pathname.replace(/\d+\/$/, '') === seriesPath) showArtwork(location.href, false);
  else location.reload();
});

// Direct links still frame the artwork, without the global smooth-scroll animation.
if (location.hash === '#artwork') {
  const photo = document.querySelector('#artwork img');
  const frame = () => {
    const artwork = document.querySelector('#artwork');
    const navigation = document.querySelector('.image-navigation');
    const height = navigation.getBoundingClientRect().bottom - artwork.getBoundingClientRect().top;
    const room = Math.max((window.innerHeight - height) / 2, 16);
    window.scrollTo({ top: Math.max(artwork.getBoundingClientRect().top + scrollY - room, 0), behavior: 'instant' });
  };
  if (photo.complete) frame();
  else photo.addEventListener('load', frame, { once: true });
}
