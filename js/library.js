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
            const getTs = (item) => { 
                if(item.type === 'series') return item.latestTimestamp || 0;
                const lastDate = item.data.finishedDates && item.data.finishedDates.length ? item.data.finishedDates[item.data.finishedDates.length-1] : null;
                const d = parseDateLocal(lastDate); return d ? d.getTime() : 0; 
            };
            const getWords = (item) => item.type === 'series' ? item.totalWords : (item.data.wordcount||0);
            const getTitle = (item) => item.type === 'series' ? item.title : item.data.title;
            if (sortMode === 'az') return getTitle(a).localeCompare(getTitle(b));
            if (sortMode === 'words') return getWords(b) - getWords(a);
            
            const getStatus = (item) => {
                const s = item.type === 'series'
                    ? (item.items.some(f => f.rereadStatus === 'reading') ? 'reading' : item.items[0].rereadStatus || 'unread')
                    : (item.data.rereadStatus || 'unread');
                return { reading: 1, unread: 2, onhold: 3, read: 4 }[s] ?? 2;
            };
            const sw = getStatus(a) - getStatus(b);
            if (sw !== 0) return sw;
            return getTs(b) - getTs(a);
        });

        if(displayList.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            let journalGroup = null;
            const flushGroup = () => {
                if (journalGroup) { list.appendChild(journalGroup); journalGroup = null; }
            };
            displayList.forEach(item => {
                if (item.type === 'fic') {
                    if (!journalGroup) {
                        journalGroup = document.createElement('div');
                        journalGroup.className = 'journal-list mb-4';
                    }
                    renderFicCard(item.data, journalGroup);
                } else {
                    flushGroup();
                    renderSeriesCard(item, list);
                }
            });
            flushGroup();
        }
    } catch(err) { 
        console.error(err); 
        list.innerHTML = `<div class="text-red-400 text-center py-5">Error rendering list. Check console.</div>`; 
    }
}    

function renderFicCard(f, container) {
    const isRead    = f.rereadStatus === 'read';
    const isReading = f.rereadStatus === 'reading';
    const isOnHold  = f.rereadStatus === 'onhold';
    const isComplete = (f.status || 'wip').toLowerCase() === 'complete';

    let statusKey = 'unread';
    if (isReading) statusKey = 'reading';
    else if (isRead) statusKey = 'read';
    else if (isOnHold) statusKey = 'onhold';
    const statusLabel = { reading: 'Reading', read: 'Read', onhold: 'On Hold', unread: 'Unread' }[statusKey];

    let availBadge = '';
    if (f.availability === 'mystery')
        availBadge = '<span class="avail-badge avail-mystery"><i class="fa-solid fa-lock text-[8px]"></i> Mystery</span> <span class="eyebrow-sep">·</span> ';
    if (f.availability === 'deleted')
        availBadge = '<span class="avail-badge avail-deleted"><i class="fa-solid fa-triangle-exclamation text-[8px]"></i> Deleted</span> <span class="eyebrow-sep">·</span> ';

    const fandomsText = (f.fandom && f.fandom.length) ? f.fandom.map(x => escapeHTML(x)).join(' <span class="eyebrow-sep">·</span> ') : 'No Fandom';
    const shipsText   = (f.ships && f.ships.length)   ? ' <span class="eyebrow-sep">·</span> ' + f.ships.map(x => escapeHTML(x)).join(' <span class="eyebrow-sep">·</span> ') : '';

    const cwHtml = (f.cws || []).length
        ? `<div class="flex flex-wrap gap-1.5 mt-1.5 mb-1">${(f.cws||[]).map(c=>`<span class="cw-chip"><i class="fa-solid fa-triangle-exclamation text-[9px] mr-1"></i>${escapeHTML(c)}</span>`).join('')}</div>`
        : '';

    const wordsDisplay = f.wordcount ? f.wordcount.toLocaleString() + ' words' : null;
    const chDisplay    = f.chapters  ? f.chapters + ' ch' : null;
    const compLabel    = isComplete  ? 'Complete' : 'WIP';
    const readTime     = f.wordcount ? calculateTime(f.wordcount) : null;
    const metaParts    = [wordsDisplay, chDisplay, compLabel, readTime].filter(Boolean);
    const metaHtml     = metaParts.map((p, i) => i === 0
        ? `<span>${p}</span>`
        : `<span class="eyebrow-sep mx-0.5">·</span><span>${p}</span>`).join('');

    const rereadBadge = (f.finishedDates && f.finishedDates.length > 1)
        ? `<span class="reread-badge"><i class="fa-solid fa-repeat text-[8px]"></i> ${f.finishedDates.length}×</span>`
        : '';

    const seriesHtml = (f.series && f.series.trim())
        ? `<div class="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mb-1"><i class="fa-solid fa-layer-group mr-1"></i>Pt ${f.seriesPart || '?'}</div>`
        : '';

    const safeLink = f.originalLink && /^https?:\/\//i.test(f.originalLink) ? f.originalLink : null;
    const queueBtn = queueIds.includes(f.id)
        ? `<button type="button" onclick="event.stopPropagation(); removeFromQueue('${f.id}')" class="jbtn jbtn-on" title="In Queue"><i class="fa-solid fa-bookmark text-[10px]"></i></button>`
        : `<button type="button" onclick="event.stopPropagation(); addToQueue('${f.id}')" class="jbtn" title="Add to Queue"><i class="fa-regular fa-bookmark text-[10px]"></i></button>`;
    const linkBtn = safeLink
        ? `<button type="button" onclick="event.stopPropagation(); window.open('${escapeHTML(safeLink)}', '_blank', 'noopener,noreferrer')" class="jbtn"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></button>`
        : '';

    const hasTags    = (f.tags   || []).length > 0;
    const hasSummary = f.summary && f.summary.trim();
    const hasNotes   = f.notes   && f.notes.trim();
    const showToggle = hasTags || hasSummary || hasNotes;
    const toggleId   = `toggle-${f.id}`;

    const tagsHtml    = hasTags    ? `<div class="flex flex-wrap gap-1.5 mb-3">${(f.tags||[]).map(t=>`<span class="tag-chip">${escapeHTML(t)}</span>`).join('')}</div>` : '';
    const summaryHtml = hasSummary ? `<p class="text-xs text-slate-300 italic leading-relaxed mb-3">"${escapeHTML(f.summary)}"</p>` : '';
    const notesHtml   = hasNotes   ? `<div class="bg-indigo-900/10 border border-indigo-500/20 p-3 rounded-lg"><strong class="block text-indigo-400 mb-1 uppercase tracking-wide text-[9px]">My Notes</strong><p class="text-xs text-indigo-200">${escapeHTML(f.notes)}</p></div>` : '';
    const toggleBtn   = showToggle
        ? `<button type="button" onclick="event.stopPropagation(); document.getElementById('${toggleId}').classList.toggle('hidden'); this.querySelector('i').classList.toggle('fa-chevron-down'); this.querySelector('i').classList.toggle('fa-chevron-up');" class="jbtn"><i class="fa-solid fa-chevron-down text-[10px]"></i></button>`
        : '';

    const item = document.createElement('div');
    item.className = `fic-card status-${statusKey}`;
    item.onclick = (e) => { if (!e.target.closest('button')) openEditModal(f.id); };

    item.innerHTML = `
        <div class="flex gap-2 items-start">
            <div class="flex-1 min-w-0">
                ${seriesHtml}
                <div class="fic-eyebrow">${availBadge}${fandomsText}${shipsText}</div>
                <div class="fic-title">${escapeHTML(f.title)}</div>
                <div class="fic-author">${escapeHTML(f.author || 'Unknown')}</div>
                ${cwHtml}
                <div class="fic-meta-row mt-1.5">
                    <div class="fic-meta">${metaHtml}</div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        ${rereadBadge}
                        <span class="fic-status-pill status-${statusKey}">${statusLabel}</span>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-0.5 shrink-0 pt-0.5">
                ${queueBtn}
                ${linkBtn}
                ${toggleBtn}
            </div>
        </div>
        ${showToggle ? `<div id="${toggleId}" class="hidden fic-expand-section animate-fade-in">${tagsHtml}${summaryHtml}${notesHtml}</div>` : ''}
    `;
    container.appendChild(item);
}



function renderSeriesCard(series, container) {
    const fandomLabel = Array.isArray(series.fandom) ? series.fandom.join(' · ') : (series.fandom || 'Unknown');

    const div = document.createElement('div');
    div.className = 'series-folder mb-4';

    div.innerHTML = `
        <div class="series-folder-tab">
            <i class="fa-solid fa-layer-group mr-1 text-[9px]"></i>
            Series · ${series.items.length} works
        </div>
        <div class="series-folder-header" onclick="
            const c = this.nextElementSibling;
            const icon = this.querySelector('.chevron-icon');
            c.classList.toggle('hidden');
            icon.style.transform = c.classList.contains('hidden') ? '' : 'rotate(180deg)';
        ">
            <div class="flex-1 min-w-0">
                <div class="fic-eyebrow mb-1">${escapeHTML(fandomLabel)}</div>
                <div class="fic-title text-base">${escapeHTML(series.title)}</div>
                <div class="fic-meta mt-1"><span>${series.totalWords.toLocaleString()} words</span></div>
            </div>
            <i class="fa-solid fa-chevron-down chevron-icon text-slate-500 transition-transform duration-300 ml-4 shrink-0"></i>
        </div>
        <div class="series-folder-body hidden">
        </div>
    `;

    const body = div.querySelector('.series-folder-body');
    series.items.forEach(f => renderFicCard(f, body));
    container.appendChild(div);
}
