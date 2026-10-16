function populateFilterDropdowns() {
    const shipSet = new Set(), tagSet = new Set(), fandomSet = new Set(), cwSet = new Set();
    fics.forEach(f => { 
        (f.fandom || []).forEach(fan => fandomSet.add(fan.trim()));
        (f.ships || []).forEach(s => shipSet.add(s.trim())); 
        (f.tags || []).forEach(t => tagSet.add(t.trim())); 
        (f.cws || []).forEach(c => cwSet.add(c.trim()));
    });
    
    const fill = (id, items, label) => {
        const select = document.getElementById(id);
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = `<option value="all">${label}</option>`;
        items.sort((a,b) => a.localeCompare(b)).forEach(i => { 
            if(i) { 
                const opt = document.createElement('option'); 
                opt.value = i; 
                opt.innerText = i; 
                select.appendChild(opt); 
            }
        });
        if(items.includes(currentVal)) select.value = currentVal;
    };
    
    fill('filterFandom', Array.from(fandomSet), 'Fandom: All');
    fill('filterShips', Array.from(shipSet), 'Ship: All'); 
    fill('filterTags', Array.from(tagSet), 'Tag: All');
    
    const excludeSelect = document.getElementById('filterExcludeCW');
    if (excludeSelect) {
        const currentExclude = excludeSelect.value;
        excludeSelect.innerHTML = `<option value="none">Exclude CW: None</option>`;
        Array.from(cwSet).sort((a,b) => a.localeCompare(b)).forEach(i => { 
            if(i) { 
                const opt = document.createElement('option'); 
                opt.value = i; 
                opt.innerText = i; 
                excludeSelect.appendChild(opt); 
            }
        });
        if(Array.from(cwSet).includes(currentExclude)) excludeSelect.value = currentExclude;
    }
}

function populateHelperDropdowns() {
    const shipSet = new Set();
    const tagSet = new Set();
    const cwSet = new Set();
    const fandomSet = new Set();
    
    fics.forEach(f => { 
        (f.ships || []).forEach(s => shipSet.add(s.trim())); 
        (f.tags || []).forEach(t => tagSet.add(t.trim())); 
        (f.cws || []).forEach(c => cwSet.add(c.trim()));
        (f.fandom || []).forEach(fan => fandomSet.add(fan.trim()));
    });
    
    const fillSelect = (id, items) => {
        const select = document.getElementById(id);
        if (!select) return;
        
        select.innerHTML = '<option value="">Select used</option>';
        items.sort((a,b) => a.localeCompare(b)).forEach(item => { 
            if(item) { 
                const opt = document.createElement('option'); 
                opt.value = item; 
                opt.innerText = item; 
                select.appendChild(opt); 
            }
        });
    };
    
    fillSelect('selShipsHelper', Array.from(shipSet));
    fillSelect('selTagsHelper', Array.from(tagSet));
    fillSelect('selCWHelper', Array.from(cwSet));
    fillSelect('selFandomHelper', Array.from(fandomSet));
}

function pickSuggestion(targetInputId, selectDropdownId) {
    const select = document.getElementById(selectDropdownId);
    const target = document.getElementById(targetInputId);
    const selectedValue = select.value;
    
    if (selectedValue) {
        let currentText = target.value.trim();
        if (currentText && !currentText.endsWith(',')) {
            currentText += ', ';
        }
        target.value = currentText + selectedValue;
    }
    select.value = ''; 
}

function handleSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        renderLibrary();
    }, 200);
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterCompletion').value = 'all';
    document.getElementById('filterCover').value = 'all';
    document.getElementById('filterFandom').value = 'all';
    document.getElementById('filterShips').value = 'all';
    document.getElementById('filterTags').value = 'all';
    document.getElementById('filterExcludeCW').value = 'none';
    document.getElementById('filterChapters').value = 'all';
    
    const availabilityFilter = document.getElementById('filterAvailability');
    if (availabilityFilter) availabilityFilter.value = 'all';

    renderLibrary();
}

function renderLibrary() {
    populateFilterDropdowns();
    const list = document.getElementById('ficList');
    const emptyState = document.getElementById('emptyState');
    
    list.innerHTML = '';
    const search = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    const completionFilter = document.getElementById('filterCompletion').value;
    const coverFilter = document.getElementById('filterCover').value;
    const fandomFilter = document.getElementById('filterFandom').value;
    const shipFilter = document.getElementById('filterShips').value;
    const tagFilter = document.getElementById('filterTags').value;
    const excludeCwFilter = document.getElementById('filterExcludeCW').value;
    const chapterFilter = document.getElementById('filterChapters').value;
    
    const filterAvailabilityEl = document.getElementById('filterAvailability');
    const availabilityFilter = filterAvailabilityEl ? filterAvailabilityEl.value : 'all';
    
    const sortMode = document.getElementById('sortOption').value;

    try {
        let filtered = fics.filter(f => {
            if (availabilityFilter !== 'all' && (f.availability || 'public') !== availabilityFilter) return false;
            if (statusFilter !== 'all' && (f.rereadStatus || 'unread').toLowerCase() !== statusFilter) return false;
            if (completionFilter !== 'all' && (f.status || 'wip').toLowerCase() !== completionFilter) return false;
            if (coverFilter !== 'all') { const hasCover = (f.coverStatus === 'yes'); if (coverFilter === 'yes' && !hasCover) return false; if (coverFilter === 'not' && hasCover) return false; }
            if (fandomFilter !== 'all' && (!f.fandom || !f.fandom.includes(fandomFilter))) return false;
            
            if (excludeCwFilter !== 'none' && f.cws && f.cws.includes(excludeCwFilter)) return false;
            
            if (shipFilter !== 'all' && (!f.ships || !f.ships.includes(shipFilter))) return false;
            if (tagFilter !== 'all' && (!f.tags || !f.tags.includes(tagFilter))) return false;
            
            const chaps = f.chapters || 0;
            if (chapterFilter === 'short' && chaps >= 10) return false; if (chapterFilter === 'medium' && (chaps < 10 || chaps > 50)) return false; if (chapterFilter === 'long' && chaps <= 50) return false;
            if (search) { const txt = `${f.title} ${f.series || ''} ${(f.fandom||[]).join(' ')} ${f.author} ${(f.ships||[]).join(' ')} ${(f.tags||[]).join(' ')}`.toLowerCase(); return txt.includes(search); }
            return true;
        });

        const groups = {};
        const displayList = [];
        filtered.forEach(f => { 
            if(f.series && f.series.trim() !== "") { 
                const sName = f.series.trim(); 
                if(!groups[sName]) groups[sName] = []; 
                groups[sName].push(f); 
            } else { 
                displayList.push({ type: 'fic', data: f }); 
            } 
        });
        
        Object.keys(groups).forEach(seriesName => {
            const seriesFics = groups[seriesName];
            seriesFics.sort((a,b) => (a.seriesPart || 0) - (b.seriesPart || 0));
            const dates = seriesFics.map(f => {
                const lastDate = f.finishedDates && f.finishedDates.length ? f.finishedDates[f.finishedDates.length-1] : null; 
                const d = parseDateLocal(lastDate); return d ? d.getTime() : 0; 
            });
            displayList.push({ 
                type: 'series', title: seriesName, 
                fandom: seriesFics[0].fandom && seriesFics[0].fandom.length > 0 ? seriesFics[0].fandom[0] : 'Unknown', 
                author: seriesFics[0].author, totalWords: seriesFics.reduce((sum, f) => sum + (f.wordcount||0), 0), 
                items: seriesFics, latestTimestamp: Math.max(...dates) 
            });
        });

        displayList.sort((a, b) => {
            const getWords  = (item) => item.type === 'series' ? item.totalWords : (item.data.wordcount || 0);
            const getTitle  = (item) => item.type === 'series' ? item.title : item.data.title;
            const isReading = (item) => item.type === 'series'
                ? item.items.some(f => f.rereadStatus === 'reading')
                : item.data.rereadStatus === 'reading';

            // Reading always floats to the top, regardless of sort mode
            const ra = isReading(a) ? 0 : 1;
            const rb = isReading(b) ? 0 : 1;
            if (ra !== rb) return ra - rb;

            // Within each group, sort by the chosen mode
            if (sortMode === 'words') return getWords(b) - getWords(a);
            return getTitle(a).localeCompare(getTitle(b)); // default: A-Z
        });

        if(displayList.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            displayList.forEach(item => { 
                if (item.type === 'fic') renderFicCard(item.data, list); 
                else renderSeriesCard(item, list); 
            });
        }
    } catch(err) { 
        console.error(err); 
        list.innerHTML = `<div class="text-red-400 text-center py-5">Error rendering list. Check console.</div>`; 
    }
}    

function renderFicCard(f, container, insideSeries = false) {
    const isRead    = f.rereadStatus === 'read';
    const isReading = f.rereadStatus === 'reading';
    const isOnHold  = f.rereadStatus === 'onhold';
    const isComplete = (f.status || 'wip').toLowerCase() === 'complete';

    // Status drives stripe color and fandom label color
    let statusKey = 'unread';
    if (isReading) statusKey = 'reading';
    else if (isRead) statusKey = 'read';
    else if (isOnHold) statusKey = 'onhold';

    const stripeColor = {
        reading: 'var(--status-reading)',
        read:    'var(--status-read)',
        onhold:  'var(--status-onhold)',
        unread:  'var(--status-unread)'
    }[statusKey];

    const fandomColor = {
        reading: 'var(--status-reading)',
        read:    'var(--status-read)',
        onhold:  'var(--status-onhold)',
        unread:  'rgba(var(--color-slate-400) / 1)'
    }[statusKey];

    // Availability badge — only for mystery/deleted
    let availBadge = '';
    if (f.availability === 'mystery')
        availBadge = `<span class="dense-avail-mystery"><i class="fa-solid fa-lock" style="font-size:7px"></i> Mystery</span><span class="dense-sep">·</span>`;
    if (f.availability === 'deleted')
        availBadge = `<span class="dense-avail-deleted"><i class="fa-solid fa-triangle-exclamation" style="font-size:7px"></i> Deleted</span><span class="dense-sep">·</span>`;

    // Fandom + ships top line
    const fandomsHtml = (f.fandom && f.fandom.length)
        ? f.fandom.map(x => `<span class="dense-fandom" style="color:${fandomColor}">${escapeHTML(x)}</span>`).join(`<span class="dense-sep">·</span>`)
        : `<span class="dense-fandom" style="color:${fandomColor}">No Fandom</span>`;
    const shipsHtml = (f.ships && f.ships.length)
        ? `<span class="dense-sep">·</span>` + f.ships.map(x => `<span class="dense-ship">${escapeHTML(x)}</span>`).join(`<span class="dense-sep">·</span>`)
        : '';

    // CW chips — small
    const cwHtml = (f.cws || []).length
        ? `<div class="dense-cw-row">${(f.cws||[]).map(c=>`<span class="dense-cw"><i class="fa-solid fa-triangle-exclamation" style="font-size:7px;margin-right:3px"></i>${escapeHTML(c)}</span>`).join('')}</div>`
        : '';

    // Meta line — word count bolded
    const words    = f.wordcount ? `<b>${(f.wordcount >= 1000 ? Math.round(f.wordcount/1000)+'k' : f.wordcount)} words</b>` : null;
    const chapters = f.chapters  ? `${f.chapters} ch` : null;
    const comp     = isComplete  ? 'Complete' : 'WIP';
    const time     = f.wordcount ? calculateTime(f.wordcount) : null;
    const coverBadge = f.coverStatus === 'yes'
        ? `<span class="dense-cover-badge" title="Has cover art"><i class="fa-solid fa-image"></i></span>`
        : '';
    const metaParts = [words, chapters, comp, time].filter(Boolean).join(' · ');

    // Status pill
    const pillClass = `dense-pill dense-pill-${statusKey}`;
    const pillLabel = { reading: 'Reading', read: 'Read', onhold: 'On Hold', unread: 'Unread' }[statusKey];

    // Reread badge
    const rereadBadge = (f.finishedDates && f.finishedDates.length > 1)
        ? `<span class="dense-reread"><i class="fa-solid fa-repeat" style="font-size:7px"></i> ${f.finishedDates.length}×</span>`
        : '';

    // Buttons
    const safeLink = f.originalLink && /^https?:\/\//i.test(f.originalLink) ? f.originalLink : null;
    const queueBtn = queueIds.includes(f.id)
        ? `<button type="button" onclick="event.stopPropagation(); removeFromQueue('${f.id}')" class="dense-btn dense-btn-on" title="In Queue"><i class="fa-solid fa-bookmark" style="font-size:10px"></i></button>`
        : `<button type="button" onclick="event.stopPropagation(); addToQueue('${f.id}')" class="dense-btn" title="Add to Queue"><i class="fa-regular fa-bookmark" style="font-size:10px"></i></button>`;
    const linkBtn = safeLink
        ? `<button type="button" onclick="event.stopPropagation(); window.open('${escapeHTML(safeLink)}', '_blank', 'noopener,noreferrer')" class="dense-btn" title="Open on AO3"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px"></i></button>`
        : '';

    // Expand toggle
    const hasTags    = (f.tags || []).length > 0;
    const hasSummary = f.summary && f.summary.trim();
    const hasNotes   = f.notes   && f.notes.trim();
    const showToggle = hasTags || hasSummary || hasNotes;
    const toggleId   = `toggle-${f.id}`;

    const toggleBtn = showToggle
        ? `<button type="button" onclick="event.stopPropagation(); document.getElementById('${toggleId}').classList.toggle('hidden'); this.querySelector('i').classList.toggle('fa-chevron-down'); this.querySelector('i').classList.toggle('fa-chevron-up');" class="dense-btn" title="Expand"><i class="fa-solid fa-chevron-down" style="font-size:10px"></i></button>`
        : '';

    const tagsHtml    = hasTags    ? `<div class="dense-tags">${(f.tags||[]).map(t=>`<span class="dense-tag">${escapeHTML(t)}</span>`).join('')}</div>` : '';
    const summaryHtml = hasSummary ? `<div class="dense-summary">"${escapeHTML(f.summary)}"</div>` : '';
    const notesHtml   = hasNotes   ? `<div class="dense-notes"><div class="dense-notes-label">My Notes</div><div class="dense-notes-text">${escapeHTML(f.notes)}</div></div>` : '';

    // Series part indicator (when inside a series)
    const partHtml = (insideSeries && f.seriesPart)
        ? `<div class="dense-part">Part ${f.seriesPart}</div>`
        : '';

    const item = document.createElement('div');
    item.className = `dense-item${insideSeries ? ' dense-item-series' : ''}`;
    item.onclick = (e) => { if (!e.target.closest('button')) openEditModal(f.id); };

    item.innerHTML = `
        <div class="dense-stripe" style="background:${stripeColor}"></div>
        <div class="dense-main">
            ${partHtml}
            <div class="dense-top-line">
                ${availBadge}${fandomsHtml}${shipsHtml}
            </div>
            <div class="dense-title">${escapeHTML(f.title)}</div>
            <div class="dense-author">${escapeHTML(f.author || 'Unknown')}</div>
            ${cwHtml}
            <div class="dense-meta-row">
                <div class="dense-meta">${metaParts}</div>
                ${coverBadge}
            </div>
        </div>
        <div class="dense-right">
            <div class="dense-pill-wrap">${rereadBadge}<span class="${pillClass}">${pillLabel}</span></div>
            <div class="dense-btns">
                ${queueBtn}
                ${linkBtn}
                ${toggleBtn}
            </div>
        </div>
        ${showToggle ? `<div id="${toggleId}" class="hidden dense-expand animate-fade-in">${tagsHtml}${summaryHtml}${notesHtml}</div>` : ''}
    `;
    container.appendChild(item);
}

function renderSeriesCard(series, container) {
    const fandomLabel = Array.isArray(series.fandom)
        ? series.fandom.join(' · ')
        : (series.fandom || '');

    const wrap = document.createElement('div');
    wrap.className = 'dense-series-wrap';

    wrap.innerHTML = `
        <div class="dense-series-tab">
            <i class="fa-solid fa-layer-group" style="font-size:9px"></i>
            Series · ${series.items.length} works
        </div>
        <div class="dense-series-header" onclick="
            const body = this.nextElementSibling;
            const icon = this.querySelector('.s-chevron');
            body.classList.toggle('hidden');
            icon.style.transform = body.classList.contains('hidden') ? '' : 'rotate(180deg)';
        ">
            <div class="dense-series-header-main">
                <div class="dense-series-fandom">${escapeHTML(fandomLabel)}</div>
                <div class="dense-series-title">${escapeHTML(series.title)}</div>
                <div class="dense-series-meta"><b>${series.totalWords.toLocaleString()} words</b></div>
            </div>
            <i class="fa-solid fa-chevron-down s-chevron" style="font-size:13px;color:rgb(var(--color-slate-500));transition:transform .3s;flex-shrink:0"></i>
        </div>
        <div class="dense-series-body hidden"></div>
    `;

    const body = wrap.querySelector('.dense-series-body');
    series.items.forEach(f => renderFicCard(f, body, true));
    container.appendChild(wrap);
}
