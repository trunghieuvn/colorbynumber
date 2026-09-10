(() => {
  const state = { products: [], selected: 'all', search: '', category: 'all' };
  const productsEl = document.querySelector('#products');
  const categoryEl = document.querySelector('#category');
  const searchEl = document.querySelector('#search');
  const galleryEl = document.querySelector('#gallery');
  const emptyEl = document.querySelector('#empty');
  const totalEl = document.querySelector('#total-count');
  const resultEl = document.querySelector('#result-count');

  const escape = value => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const allItems = () => state.products.flatMap(product =>
    product.items.map(item => Object.assign({}, item, {product})));

  function productButtons() {
    const options = [{id:'all',label:'All products'}].concat(state.products);
    productsEl.innerHTML = options.map(product =>
      '<button class="product-btn" data-product="' + escape(product.id) +
      '" role="tab" aria-selected="' + (state.selected === product.id) +
      '" aria-label="' + escape(product.label) + '">' + escape(product.label) +
      (product.count ? ' <span>· ' + product.count + '</span>' : '') + '</button>'
    ).join('');
    productsEl.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      state.selected = button.dataset.product;
      productButtons();
      updateCategories();
      render();
    }));
  }

  function updateCategories() {
    const items = state.selected === 'all'
      ? allItems()
      : allItems().filter(item => item.product.id === state.selected);
    const categories = Array.from(new Set(items.map(item => item.category))).sort();
    if (!categories.includes(state.category)) state.category = 'all';
    categoryEl.innerHTML = '<option value="all">All categories</option>' +
      categories.map(category => '<option value="' + escape(category) + '">' +
        escape(category) + '</option>').join('');
    categoryEl.value = state.category;
  }

  function filteredItems() {
    const query = state.search.trim().toLowerCase();
    return allItems().filter(item => {
      const productOk = state.selected === 'all' || item.product.id === state.selected;
      const categoryOk = state.category === 'all' || item.category === state.category;
      const text = item.title + ' ' + item.id + ' ' + item.category + ' ' + item.product.label;
      const queryOk = !query || text.toLowerCase().includes(query);
      return productOk && categoryOk && queryOk;
    });
  }

  function card(item) {
    const productClass = item.product.id === 'pixelo' ? 'pixel'
      : item.product.id === 'colorio' ? 'colorio' : '';
    const stat = item.product.mode === 'pixel'
      ? item.grid + ' grid · ' + item.regions + ' cells · ' + item.colors + ' colors'
      : item.regions + ' regions · ' + item.colors + ' colors';
    return '<article class="art-card">' +
      '<div class="card-head"><div><h2 class="card-title">' + escape(item.title) +
      '</h2><div class="card-meta"><span>' + escape(item.category) + '</span><span>·</span><span>' +
      escape(item.difficulty) + '</span><span>·</span><span>' + escape(stat) +
      '</span></div></div><span class="pill ' + productClass + '">' +
      escape(item.product.id) + '</span></div>' +
      '<div class="comparison"><figure><img src="' + escape(item.raw) + '" alt="' +
      escape(item.title) + ' raw numbered preview" loading="lazy" decoding="async">' +
      '<figcaption>Raw · numbered</figcaption></figure><figure><img src="' +
      escape(item.colored) + '" alt="' + escape(item.title) +
      ' finished coloured art" loading="lazy" decoding="async"><figcaption>Finished · coloured</figcaption></figure></div>' +
      '</article>';
  }

  function render() {
    const items = filteredItems();
    galleryEl.innerHTML = items.map(card).join('');
    emptyEl.hidden = items.length !== 0;
    resultEl.textContent = items.length + ' artwork' + (items.length === 1 ? '' : 's') + ' shown';
  }

  fetch('assets/gallery/manifest.json')
    .then(response => { if (!response.ok) throw new Error('manifest unavailable'); return response.json(); })
    .then(manifest => {
      state.products = manifest.products || [];
      totalEl.textContent = state.products.reduce((sum, product) => sum + product.count, 0);
      productButtons();
      updateCategories();
      render();
    })
    .catch(() => {
      totalEl.textContent = '—';
      resultEl.textContent = 'The art manifest could not be loaded.';
    });

  searchEl.addEventListener('input', event => { state.search = event.target.value; render(); });
  categoryEl.addEventListener('change', event => { state.category = event.target.value; render(); });
})();

