(function(){
  "use strict";

  const AppState = {
    activeTab: "events",
    searchQuery: "",
    onlyFavorites: false,
    filters: {
      events: { category: "all", dateFrom: "", dateTo: "", priceMax: "" },
      locations: { type: "all", ratingMin: "" },
      transport: { mode: "all", dateFrom: "", dateTo: "", priceMax: "" }
    },
    favorites: { events: new Set(), locations: new Set(), transport: new Set() },
    lastFocusedElement: null,
    modalContext: null
  };

  const FAVORITES_STORAGE_KEY = "travel-explorer.favorites.v1";

  function loadFavoritesFromStorage(){
    try{
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if(!raw) return;
      const parsed = JSON.parse(raw);
      if(parsed.events) AppState.favorites.events = new Set(parsed.events);
      if(parsed.locations) AppState.favorites.locations = new Set(parsed.locations);
      if(parsed.transport) AppState.favorites.transport = new Set(parsed.transport);
    }catch(err){ /* ignore */ }
  }

  function saveFavoritesToStorage(){
    const toStore = {
      events: Array.from(AppState.favorites.events),
      locations: Array.from(AppState.favorites.locations),
      transport: Array.from(AppState.favorites.transport)
    };
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(toStore));
  }

  function formatCurrency(amount){
    try{ return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount); }
    catch{ return `$${amount.toFixed(2)}`; }
  }

  function formatDate(isoDate){
    if(!isoDate) return "";
    const d = new Date(isoDate);
    if(Number.isNaN(d.getTime())) return isoDate;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function formatDateTime(iso){
    if(!iso) return "";
    const d = new Date(iso);
    if(Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function computeDurationMinutes(startIso, endIso){
    const s = new Date(startIso); const e = new Date(endIso);
    if(Number.isNaN(s) || Number.isNaN(e)) return "";
    const mins = Math.max(0, Math.round((e - s) / 60000));
    const h = Math.floor(mins / 60); const m = mins % 60;
    if(h === 0) return `${m}m`;
    if(m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  // Seed data
  const Seed = (function(){
    const events = [
      { id: 'ev1', name: 'City Jazz Festival', category: 'Music', date: '2025-11-10', venue: 'Central Park', price: 55, tags: ['jazz','festival','outdoor'], description: 'Annual open-air jazz celebration with local and international artists.' },
      { id: 'ev2', name: 'Tech Innovators Summit', category: 'Conference', date: '2025-11-15', venue: 'Convention Center', price: 299, tags: ['tech','startups','ai'], description: 'Talks and workshops about AI, startups, and innovation.' },
      { id: 'ev3', name: 'Farmers Market', category: 'Market', date: '2025-10-20', venue: 'Old Town Square', price: 0, tags: ['food','local','organic'], description: 'Fresh produce, artisanal goods, and local delicacies.' },
      { id: 'ev4', name: 'Modern Art Expo', category: 'Exhibition', date: '2025-12-02', venue: 'Art Hall A', price: 25, tags: ['art','modern','gallery'], description: 'A curated selection of modern art installations.' },
      { id: 'ev5', name: 'City Marathon', category: 'Sports', date: '2025-10-30', venue: 'Riverfront', price: 70, tags: ['run','outdoor','fitness'], description: '26.2-mile route through the heart of the city.' },
      { id: 'ev6', name: 'Food Truck Fiesta', category: 'Food', date: '2025-10-22', venue: 'Harbor Plaza', price: 5, tags: ['food','street','vendors'], description: 'Street food from 30+ vendors and live music.' },
      { id: 'ev7', name: 'Classical Night', category: 'Music', date: '2025-11-05', venue: 'Opera House', price: 80, tags: ['classical','orchestra'], description: 'Symphonic masterpieces performed by the city orchestra.' },
      { id: 'ev8', name: 'Indie Film Premiere', category: 'Film', date: '2025-11-18', venue: 'Cinema 7', price: 18, tags: ['film','indie','premiere'], description: 'Premiere of an award-winning independent film, with Q&A.' }
    ];

    const locations = [
      { id: 'lo1', name: 'Grand Art Museum', type: 'Museum', rating: 4.7, address: '12 Museum Ave', tags: ['art','history'], description: 'World-class collections from ancient to contemporary art.', openingHours: '10:00–18:00' },
      { id: 'lo2', name: 'Botanical Gardens', type: 'Park', rating: 4.8, address: '99 Green Rd', tags: ['nature','walks'], description: 'Sprawling gardens with themed conservatories.', openingHours: '09:00–19:00' },
      { id: 'lo3', name: 'Old Fort Ruins', type: 'Historic', rating: 4.4, address: 'Fort Hill', tags: ['history','views'], description: 'Ruins offering panoramic city views and guided tours.', openingHours: '08:00–17:00' },
      { id: 'lo4', name: 'Skyline Lookout', type: 'Viewpoint', rating: 4.6, address: 'North Ridge', tags: ['views','sunset'], description: 'Best spot for sunset photography over the skyline.', openingHours: 'Open 24 hours' },
      { id: 'lo5', name: 'Central Food Hall', type: 'Market', rating: 4.5, address: '50 Market St', tags: ['food','local'], description: 'Indoor market with local vendors and eateries.', openingHours: '10:00–22:00' },
      { id: 'lo6', name: 'City Aquarium', type: 'Aquarium', rating: 4.6, address: '1 Ocean Way', tags: ['family','marine'], description: 'Interactive exhibits and daily feeding shows.', openingHours: '09:00–18:00' },
      { id: 'lo7', name: 'Riverside Promenade', type: 'Walk', rating: 4.3, address: 'Riverfront', tags: ['walk','views'], description: 'Scenic walkway along the river with cafes.', openingHours: 'Open 24 hours' },
      { id: 'lo8', name: 'Tech District', type: 'Neighborhood', rating: 4.2, address: 'Innovation Blvd', tags: ['startup','cafes'], description: 'Coworking spaces, coffee shops, and street art.', openingHours: 'Open 24 hours' }
    ];

    const transport = [
      { id: 'tr1', mode: 'Train', name: 'InterCity 301', from: 'Central', to: 'North Bay', depart: '2025-11-10T09:10:00', arrive: '2025-11-10T11:45:00', price: 42, operator: 'National Rail' },
      { id: 'tr2', mode: 'Bus', name: 'Express B12', from: 'Central', to: 'Airport', depart: '2025-11-10T08:00:00', arrive: '2025-11-10T08:40:00', price: 9, operator: 'City Transit' },
      { id: 'tr3', mode: 'Flight', name: 'Air 77', from: 'City (CIT)', to: 'Capital (CAP)', depart: '2025-11-15T14:20:00', arrive: '2025-11-15T15:35:00', price: 129, operator: 'SkyWays' },
      { id: 'tr4', mode: 'Ferry', name: 'HarborLine F3', from: 'Harbor', to: 'Island', depart: '2025-10-22T10:15:00', arrive: '2025-10-22T11:10:00', price: 16, operator: 'Blue Ferries' },
      { id: 'tr5', mode: 'Train', name: 'Regional 92', from: 'Central', to: 'Riverside', depart: '2025-10-30T17:05:00', arrive: '2025-10-30T18:20:00', price: 18, operator: 'National Rail' },
      { id: 'tr6', mode: 'Rideshare', name: 'Shared Ride', from: 'Old Town', to: 'Convention Center', depart: '2025-11-15T08:30:00', arrive: '2025-11-15T08:55:00', price: 12, operator: 'RideCo' },
      { id: 'tr7', mode: 'Bus', name: 'Route 7', from: 'West End', to: 'Grand Art Museum', depart: '2025-10-20T10:00:00', arrive: '2025-10-20T10:32:00', price: 3, operator: 'City Transit' },
      { id: 'tr8', mode: 'Flight', name: 'Air 99', from: 'City (CIT)', to: 'Harbor (HBR)', depart: '2025-12-02T07:45:00', arrive: '2025-12-02T08:35:00', price: 149, operator: 'SkyWays' }
    ];

    return { events, locations, transport };
  })();

  // DOM nodes
  const dom = {
    tabs: {
      events: document.getElementById('tab-events'),
      locations: document.getElementById('tab-locations'),
      transport: document.getElementById('tab-transport')
    },
    searchInput: document.getElementById('search-input'),
    onlyFavorites: document.getElementById('only-favorites'),
    filters: document.getElementById('filters'),
    list: document.getElementById('list'),
    empty: document.getElementById('empty-state'),
    content: document.getElementById('content'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    modalClose: document.getElementById('modal-close'),
    modalFav: document.getElementById('modal-fav')
  };

  function setActiveTabFromHash(){
    const hash = (location.hash || '#events').replace('#','');
    if(['events','locations','transport'].includes(hash)){
      AppState.activeTab = hash;
    } else {
      AppState.activeTab = 'events';
      history.replaceState(null, '', '#events');
    }
    updateTabsUi();
    render();
  }

  function updateTabsUi(){
    for(const tab of ['events','locations','transport']){
      const el = dom.tabs[tab];
      el.setAttribute('aria-selected', String(AppState.activeTab === tab));
    }
  }

  function applySearchAndFilters(items, type){
    const q = AppState.searchQuery.trim().toLowerCase();
    const onlyFav = AppState.onlyFavorites;

    const favoritesSet = AppState.favorites[type];
    let result = items.filter(item => {
      if(onlyFav && !favoritesSet.has(item.id)) return false;
      if(q.length > 0){
        const hay = JSON.stringify(item).toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });

    if(type === 'events'){
      const f = AppState.filters.events;
      if(f.category !== 'all') result = result.filter(e => e.category === f.category);
      if(f.dateFrom) result = result.filter(e => new Date(e.date) >= new Date(f.dateFrom));
      if(f.dateTo) result = result.filter(e => new Date(e.date) <= new Date(f.dateTo));
      if(f.priceMax) result = result.filter(e => e.price <= Number(f.priceMax));
    }
    if(type === 'locations'){
      const f = AppState.filters.locations;
      if(f.type !== 'all') result = result.filter(l => l.type === f.type);
      if(f.ratingMin) result = result.filter(l => l.rating >= Number(f.ratingMin));
    }
    if(type === 'transport'){
      const f = AppState.filters.transport;
      if(f.mode !== 'all') result = result.filter(t => t.mode === f.mode);
      if(f.dateFrom) result = result.filter(t => new Date(t.depart) >= new Date(f.dateFrom));
      if(f.dateTo) result = result.filter(t => new Date(t.depart) <= new Date(f.dateTo));
      if(f.priceMax) result = result.filter(t => t.price <= Number(f.priceMax));
    }

    return result;
  }

  function clearChildren(node){
    while(node.firstChild) node.removeChild(node.firstChild);
  }

  function renderFilters(){
    clearChildren(dom.filters);

    if(AppState.activeTab === 'events'){
      const categories = ['all', ...new Set(Seed.events.map(e => e.category))];
      dom.filters.append(
        createSelectControl('Category', categories, AppState.filters.events.category, (value)=>{
          AppState.filters.events.category = value; render();
        }),
        createDateControl('From', AppState.filters.events.dateFrom, (value)=>{ AppState.filters.events.dateFrom = value; render(); }),
        createDateControl('To', AppState.filters.events.dateTo, (value)=>{ AppState.filters.events.dateTo = value; render(); }),
        createNumberControl('Max price', AppState.filters.events.priceMax, (value)=>{ AppState.filters.events.priceMax = value; render(); })
      );
    }

    if(AppState.activeTab === 'locations'){
      const types = ['all', ...new Set(Seed.locations.map(l => l.type))];
      dom.filters.append(
        createSelectControl('Type', types, AppState.filters.locations.type, (value)=>{ AppState.filters.locations.type = value; render(); }),
        createNumberControl('Min rating', AppState.filters.locations.ratingMin, (value)=>{ AppState.filters.locations.ratingMin = value; render(); }, { min: 0, max: 5, step: 0.1 })
      );
    }

    if(AppState.activeTab === 'transport'){
      const modes = ['all', ...new Set(Seed.transport.map(t => t.mode))];
      dom.filters.append(
        createSelectControl('Mode', modes, AppState.filters.transport.mode, (value)=>{ AppState.filters.transport.mode = value; render(); }),
        createDateControl('From', AppState.filters.transport.dateFrom, (value)=>{ AppState.filters.transport.dateFrom = value; render(); }),
        createDateControl('To', AppState.filters.transport.dateTo, (value)=>{ AppState.filters.transport.dateTo = value; render(); }),
        createNumberControl('Max price', AppState.filters.transport.priceMax, (value)=>{ AppState.filters.transport.priceMax = value; render(); })
      );
    }
  }

  function createSelectControl(labelText, options, selected, onChange){
    const wrapper = document.createElement('label');
    wrapper.className = 'control';
    wrapper.textContent = labelText + ':';

    const select = document.createElement('select');
    for(const opt of options){
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      if(opt === selected) o.selected = true;
      select.appendChild(o);
    }
    select.addEventListener('change', (e)=> onChange(e.target.value));
    wrapper.appendChild(select);
    return wrapper;
  }

  function createDateControl(labelText, value, onChange){
    const wrapper = document.createElement('label');
    wrapper.className = 'control';
    wrapper.textContent = labelText + ':';

    const input = document.createElement('input');
    input.type = 'date'; input.value = value || '';
    input.addEventListener('change', (e)=> onChange(e.target.value));
    wrapper.appendChild(input);
    return wrapper;
  }

  function createNumberControl(labelText, value, onChange, attrs){
    const wrapper = document.createElement('label');
    wrapper.className = 'control';
    wrapper.textContent = labelText + ':';

    const input = document.createElement('input');
    input.type = 'number'; input.value = value || '';
    if(attrs){
      if(attrs.min !== undefined) input.min = String(attrs.min);
      if(attrs.max !== undefined) input.max = String(attrs.max);
      if(attrs.step !== undefined) input.step = String(attrs.step);
    }
    input.addEventListener('change', (e)=> onChange(e.target.value));
    wrapper.appendChild(input);
    return wrapper;
  }

  function render(){
    dom.searchInput.value = AppState.searchQuery;
    dom.onlyFavorites.checked = AppState.onlyFavorites;

    renderFilters();

    let items = [];
    if(AppState.activeTab === 'events') items = applySearchAndFilters(Seed.events, 'events');
    if(AppState.activeTab === 'locations') items = applySearchAndFilters(Seed.locations, 'locations');
    if(AppState.activeTab === 'transport') items = applySearchAndFilters(Seed.transport, 'transport');

    clearChildren(dom.list);

    if(items.length === 0){
      dom.empty.hidden = false;
    } else {
      dom.empty.hidden = true;
      for(const item of items){
        const card = createCard(item, AppState.activeTab);
        dom.list.appendChild(card);
      }
    }

    // Move focus to main content after tab change for a11y
    dom.content.focus({ preventScroll: true });
  }

  function createCard(item, type){
    const card = document.createElement('article');
    card.className = 'card';

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = item.name;
    card.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'meta';
    if(type === 'events') meta.textContent = `${item.category} • ${formatDate(item.date)} • ${item.venue}`;
    if(type === 'locations') meta.textContent = `${item.type} • ⭐ ${item.rating.toFixed(1)} • ${item.address}`;
    if(type === 'transport') meta.textContent = `${item.mode} • ${item.from} → ${item.to} • ${formatDateTime(item.depart)}`;
    card.appendChild(meta);

    if(item.tags && item.tags.length){
      const tags = document.createElement('div');
      tags.className = 'tags';
      for(const t of item.tags){
        const span = document.createElement('span');
        span.className = 'tag'; span.textContent = t;
        tags.appendChild(span);
      }
      card.appendChild(tags);
    }

    const row = document.createElement('div');
    row.className = 'row';

    const priceOrAction = document.createElement('div');
    if(type === 'events') priceOrAction.textContent = item.price ? formatCurrency(item.price) : 'Free';
    if(type === 'locations') priceOrAction.textContent = `⭐ ${item.rating.toFixed(1)}`;
    if(type === 'transport') priceOrAction.textContent = `${formatCurrency(item.price)} • ${computeDurationMinutes(item.depart, item.arrive)}`;
    row.appendChild(priceOrAction);

    const actions = document.createElement('div');
    actions.style.display = 'flex'; actions.style.gap = '8px';

    const fav = document.createElement('button');
    fav.className = 'icon-btn'; fav.setAttribute('aria-label', 'Toggle favorite');
    fav.textContent = AppState.favorites[type].has(item.id) ? '★' : '☆';
    if(AppState.favorites[type].has(item.id)) fav.classList.add('fav');
    fav.addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleFavorite(type, item.id);
      fav.textContent = AppState.favorites[type].has(item.id) ? '★' : '☆';
      fav.classList.toggle('fav', AppState.favorites[type].has(item.id));
      if(AppState.onlyFavorites) render();
    });

    const details = document.createElement('button');
    details.className = 'btn'; details.textContent = 'Details';
    details.addEventListener('click', (e)=>{
      e.stopPropagation();
      openDetailsModal(type, item);
    });

    actions.append(fav, details);
    row.appendChild(actions);
    card.appendChild(row);

    card.addEventListener('click', ()=> openDetailsModal(type, item));
    return card;
  }

  function toggleFavorite(type, id){
    const set = AppState.favorites[type];
    if(set.has(id)) set.delete(id); else set.add(id);
    saveFavoritesToStorage();
  }

  function openDetailsModal(type, item){
    AppState.lastFocusedElement = document.activeElement;
    AppState.modalContext = { type, id: item.id };

    dom.modalTitle.textContent = item.name;

    dom.modalBody.innerHTML = '';
    const container = document.createElement('div');
    const p = document.createElement('p'); p.textContent = item.description || '';
    container.appendChild(p);

    if(type === 'events'){
      const info = document.createElement('p');
      info.textContent = `${item.category} • ${formatDate(item.date)} • ${item.venue} • ${item.price ? formatCurrency(item.price) : 'Free'}`;
      container.appendChild(info);
    }
    if(type === 'locations'){
      const info = document.createElement('p');
      info.textContent = `${item.type} • ⭐ ${item.rating.toFixed(1)} • ${item.address} • Hours: ${item.openingHours}`;
      container.appendChild(info);
    }
    if(type === 'transport'){
      const info = document.createElement('p');
      info.textContent = `${item.mode} ${item.name} • ${item.from} → ${item.to} • ${formatDateTime(item.depart)} → ${formatDateTime(item.arrive)} • ${formatCurrency(item.price)} (${computeDurationMinutes(item.depart, item.arrive)}) • ${item.operator}`;
      container.appendChild(info);
    }

    dom.modalBody.appendChild(container);

    const isFav = AppState.favorites[type].has(item.id);
    dom.modalFav.textContent = isFav ? 'Remove Favorite' : 'Add Favorite';
    dom.modalFav.onclick = function(){
      toggleFavorite(type, item.id);
      dom.modalFav.textContent = AppState.favorites[type].has(item.id) ? 'Remove Favorite' : 'Add Favorite';
      render();
    };

    dom.modal.hidden = false;
    document.body.style.overflow = 'hidden';
    dom.modalClose.focus();
  }

  function closeModal(){
    dom.modal.hidden = true;
    document.body.style.overflow = '';
    if(AppState.lastFocusedElement) AppState.lastFocusedElement.focus();
    AppState.modalContext = null;
  }

  function wireUpEvents(){
    window.addEventListener('hashchange', setActiveTabFromHash);

    dom.searchInput.addEventListener('input', (e)=>{
      AppState.searchQuery = e.target.value;
      render();
    });

    dom.onlyFavorites.addEventListener('change', (e)=>{
      AppState.onlyFavorites = e.target.checked;
      render();
    });

    dom.modalClose.addEventListener('click', closeModal);
    dom.modal.addEventListener('click', (e)=>{
      if(e.target && e.target.getAttribute('data-close') === 'true') closeModal();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && !dom.modal.hidden) closeModal();
    });
  }

  function init(){
    loadFavoritesFromStorage();
    wireUpEvents();
    setActiveTabFromHash();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
