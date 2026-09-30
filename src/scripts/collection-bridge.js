// This script runs only in the hosted copy of the existing Collection Editor.
// Draft files and standalone editor behavior remain compatible.
if (window.parent !== window && location.origin !== 'null') {
  const origin = location.origin;
  const notify = data => window.parent.postMessage(data, origin);
  const css = document.createElement('style');
  css.textContent = 'body{background:#f2f0e9}body>header{display:none}main{padding:12px 0;max-width:none}#grid{gap:24px}';
  document.head.append(css);
  document.querySelector('#connection>p').textContent = 'Publishing updates the website through your GitHub account. The token stays only in this browser window and is cleared on sign-out. If you reload the Studio Editor, reconnect here before publishing. Drafts remain available without a publishing connection.';
  const originalRender = render;
  render = function () {
    originalRender();
    document.querySelectorAll('#grid article').forEach((card, index) => {
      const button = document.createElement('button');
      button.textContent = 'Edit prices';
      button.onclick = () => notify({ type: 'studio-edit-prices', work: active + '/' + orders[active][index] });
      card.querySelector('.actions').append(button);
    });
  };
  window.addEventListener('message', event => {
    if (event.origin !== origin || event.source !== window.parent) return;
    const data = event.data;
    if (data?.type === 'studio-connect' && typeof data.token === 'string') {
      token = data.token;
      $('token').value = '';
      $('account').textContent = 'Connected through the Studio Editor. Publishing requires Contents: Read and write.';
    }
    if (data?.type === 'studio-disconnect') {
      token = '';
      $('token').value = '';
      $('account').textContent = 'Disconnected. Drafts remain saved in this browser.';
    }
    if (data?.type === 'studio-select-collection' && slugs.includes(data.collection)) {
      document.querySelector('#tabs button[data-slug="' + data.collection + '"]').click();
    }
  });
  let queued = false;
  const resize = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      notify({ type: 'studio-collection-height', height: document.body.scrollHeight });
    });
  };
  new ResizeObserver(resize).observe(document.body);
  notify({ type: 'studio-collection-ready' });
  if (ready) render();
}
