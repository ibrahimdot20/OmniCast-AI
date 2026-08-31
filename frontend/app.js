// =========================================================================
// OMNICAST AI — FRONTEND APPLICATION CONTROLLER (v9.0)
// 9-Node Swarm: Deep Research, Strategic Plan, Platform Fitting, 6 Platforms
// =========================================================================

const VISIBLE_PLATFORMS = [
  'research',
  'plan',
  'platform_fitting',
  'linkedin',
  'twitter',
  'whatsapp',
  'newsletter',
  'facebook',
  'instagram'
];

const PLATFORMS_CONFIG = {
  research: {
    title: 'Deep Research Dossier',
    icon: 'fa-solid fa-magnifying-glass',
    badgeClass: 'badge-research',
    accentColor: '#3b82f6',
    subtitle: 'Intelligence & Live Crawl'
  },
  plan: {
    title: 'Strategic Campaign Plan',
    icon: 'fa-solid fa-brain',
    badgeClass: 'badge-plan',
    accentColor: '#8b5cf6',
    subtitle: 'Narrative Strategy & Persona'
  },
  platform_fitting: {
    title: 'Platform Adaptation Matrix',
    icon: 'fa-solid fa-arrows-split-up-and-left',
    badgeClass: 'badge-fitting',
    accentColor: '#10b981',
    subtitle: 'Cross-Platform Calibrations'
  },
  linkedin: {
    title: 'LinkedIn Post',
    icon: 'fa-brands fa-linkedin-in',
    badgeClass: 'badge-linkedin',
    accentColor: '#0a66c2',
    subtitle: 'Executive Thought Leadership'
  },
  twitter: {
    title: 'X / Twitter Thread',
    icon: 'fa-brands fa-x-twitter',
    badgeClass: 'badge-twitter',
    accentColor: '#0f1419',
    subtitle: '7-Tweet Viral Thread'
  },
  whatsapp: {
    title: 'WhatsApp Broadcast',
    icon: 'fa-brands fa-whatsapp',
    badgeClass: 'badge-whatsapp',
    accentColor: '#25d366',
    subtitle: 'Community Direct Broadcast'
  },
  newsletter: {
    title: 'Email Newsletter',
    icon: 'fa-regular fa-envelope',
    badgeClass: 'badge-newsletter',
    accentColor: '#a855f7',
    subtitle: 'Substack / Morning Brew Editorial'
  },
  facebook: {
    title: 'Facebook Post',
    icon: 'fa-brands fa-facebook-f',
    badgeClass: 'badge-facebook',
    accentColor: '#1877f2',
    subtitle: 'Community Story & Discussion'
  },
  instagram: {
    title: 'Instagram Caption',
    icon: 'fa-brands fa-instagram',
    badgeClass: 'badge-instagram',
    accentColor: '#e1306c',
    subtitle: 'Caption & Hashtag Strategy'
  }
};

let currentCampaign = {
  id: null,
  timestamp: null,
  prompt: '',
  tone: '',
  cards: {},
  research: null,
  plan: null,
  virality: null
};

let activeModalPlatform = null;
let isEditMode = false;

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNodesState();
  loadHistory();
  window.addEventListener('resize', redrawWires);
  setTimeout(redrawWires, 200);
});

function initTheme() {
  const isDark = localStorage.getItem('omnicast_theme') === 'dark' || 
    (!('omnicast_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.getElementById('themeIcon').className = 'fa-solid fa-sun';
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('themeIcon').className = 'fa-solid fa-moon';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('omnicast_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  setTimeout(redrawWires, 100);
}

// ----------------------------------------------------
// SVG CONNECTOR WIRING ENGINE (11 Nodes)
// ----------------------------------------------------
function getPortCenter(elemId, portClass) {
  const elem = document.getElementById(elemId);
  if (!elem) return null;
  const container = document.getElementById('workflowContainer');
  const cRect = container.getBoundingClientRect();
  const port = elem.querySelector(`.${portClass}`);
  if (port) {
    const pRect = port.getBoundingClientRect();
    return {
      x: pRect.left - cRect.left + pRect.width / 2,
      y: pRect.top - cRect.top + pRect.height / 2
    };
  }
  const eRect = elem.getBoundingClientRect();
  if (portClass === 'port-bottom') {
    return { x: eRect.left - cRect.left + eRect.width / 2, y: eRect.bottom - cRect.top };
  }
  return { x: eRect.left - cRect.left + eRect.width / 2, y: eRect.top - cRect.top };
}

function redrawWires() {
  const svg = document.getElementById('workflowSvgLayer');
  const container = document.getElementById('workflowContainer');
  if (!svg || !container) return;
  svg.innerHTML = '';
  const cRect = container.getBoundingClientRect();

  const researchBottom = getPortCenter('node_research', 'port-bottom');
  const planTop = getPortCenter('node_plan', 'port-top');
  const planBottom = getPortCenter('node_plan', 'port-bottom');
  const fittingTop = getPortCenter('node_platform_fitting', 'port-top');
  const fittingBottom = getPortCenter('node_platform_fitting', 'port-bottom');

  // Wire 1: Research -> Plan
  if (researchBottom && planTop) {
    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line1.id = 'wire_research_plan';
    line1.setAttribute('x1', researchBottom.x);
    line1.setAttribute('y1', researchBottom.y);
    line1.setAttribute('x2', planTop.x);
    line1.setAttribute('y2', planTop.y);
    line1.setAttribute('class', currentCampaign.cards['plan'] ? 'wire-path completed' : 'wire-path');
    svg.appendChild(line1);
  }

  // Wire 2: Plan -> Platform Fitting
  if (planBottom && fittingTop) {
    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.id = 'wire_plan_fitting';
    line2.setAttribute('x1', planBottom.x);
    line2.setAttribute('y1', planBottom.y);
    line2.setAttribute('x2', fittingTop.x);
    line2.setAttribute('y2', fittingTop.y);
    line2.setAttribute('class', currentCampaign.cards['platform_fitting'] ? 'wire-path completed' : 'wire-path');
    svg.appendChild(line2);
  }

  if (!fittingBottom) return;

  // Wire 3: Platform Fitting -> 6 Platform Nodes UPPER Bus Bar
  const distributionPlatforms = ['linkedin', 'twitter', 'whatsapp', 'newsletter', 'facebook', 'instagram'];
  const platformTopPorts = distributionPlatforms
    .map(p => ({ platform: p, pos: getPortCenter(`node_${p}`, 'port-top') }))
    .filter(item => item.pos !== null);

  if (platformTopPorts.length > 0) {
    const minX = Math.min(...platformTopPorts.map(p => p.pos.x));
    const maxX = Math.max(...platformTopPorts.map(p => p.pos.x));
    const upperMinY = Math.min(...platformTopPorts.map(p => p.pos.y));
    const upperBusY = fittingBottom.y + Math.max(16, (upperMinY - fittingBottom.y) / 2);

    // Stem from fitting node down to upper bus bar
    const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    stem.id = 'wire_fitting_bus';
    stem.setAttribute('x1', fittingBottom.x);
    stem.setAttribute('y1', fittingBottom.y);
    stem.setAttribute('x2', fittingBottom.x);
    stem.setAttribute('y2', upperBusY);
    stem.setAttribute('class', currentCampaign.cards['platform_fitting'] ? 'wire-path completed' : 'wire-path');
    svg.appendChild(stem);

    // Full-Width Upper Bus Line (Across all 6 platform nodes)
    const upperBus = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    upperBus.id = 'wire_upper_bus_bar';
    upperBus.setAttribute('x1', minX);
    upperBus.setAttribute('y1', upperBusY);
    upperBus.setAttribute('x2', maxX);
    upperBus.setAttribute('y2', upperBusY);
    upperBus.setAttribute('class', currentCampaign.cards['platform_fitting'] ? 'wire-path completed' : 'wire-path');
    svg.appendChild(upperBus);

    // Feeders from upper bus line down to each platform top port
    platformTopPorts.forEach((item) => {
      const feeder = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      feeder.id = `wire_upper_feeder_${item.platform}`;
      feeder.setAttribute('x1', item.pos.x);
      feeder.setAttribute('y1', upperBusY);
      feeder.setAttribute('x2', item.pos.x);
      feeder.setAttribute('y2', item.pos.y);
      feeder.setAttribute('class', currentCampaign.cards[item.platform] ? 'wire-path completed' : 'wire-path');
      svg.appendChild(feeder);
    });
  }
}

// ----------------------------------------------------
// NODE GRAPH STATE MANAGEMENT
// ----------------------------------------------------
function initNodesState() {
  VISIBLE_PLATFORMS.forEach(p => {
    const node = document.getElementById(`node_${p}`);
    const pill = document.getElementById(`status_pill_${p}`);
    const snip = document.getElementById(`snippet_${p}`);
    if (node) {
      node.className = node.className.replace(/state-\w+/g, '') + ' state-idle';
    }
    if (pill) {
      pill.className = 'px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-gray-800 text-slate-500';
      pill.innerText = '⚪ Idle';
    }
  });
  redrawWires();
}

function setNodeState(platform, state) {
  const node = document.getElementById(`node_${platform}`);
  const pill = document.getElementById(`status_pill_${platform}`);
  if (!node) return;

  node.className = node.className.replace(/state-\w+/g, '').trim() + ` state-${state}`;

  if (pill) {
    if (state === 'running') {
      pill.className = 'px-1.5 py-0.5 text-[9px] font-bold rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 animate-pulse';
      pill.innerHTML = '⚡ Active';
    } else if (state === 'completed') {
      pill.className = 'px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300';
      pill.innerHTML = '✓ Ready';
    } else {
      pill.className = 'px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-gray-800 text-slate-500';
      pill.innerText = '⚪ Idle';
    }
  }

  redrawWires();
}

// ----------------------------------------------------
// CAMPAIGN EXECUTION ("GO" BUTTON)
// ----------------------------------------------------
function handleFormSubmit(e) {
  if (e) e.preventDefault();
  startCampaign();
}

async function startCampaign() {
  const inputElem = document.getElementById('promptInput');
  const promptText = inputElem.value.trim();
  
  if (!promptText) {
    showToast('Please type a topic or instructions in the box!', 'error');
    inputElem.focus();
    inputElem.classList.add('ring-2', 'ring-rose-500');
    setTimeout(() => inputElem.classList.remove('ring-2', 'ring-rose-500'), 1500);
    return;
  }

  const toneElem = document.getElementById('toneSelect');
  const tone = toneElem ? toneElem.value : 'Auto-Detect from Prompt';

  currentCampaign = {
    id: `cmp_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    prompt: promptText,
    tone: tone,
    cards: {},
    research: null,
    plan: null,
    virality: null
  };

  initNodesState();
  document.getElementById('downloadBundleBtn').classList.add('hidden');
  document.getElementById('createNewBtn').classList.add('hidden');

  const activityBar = document.getElementById('liveActivityBar');
  const activityMsg = document.getElementById('liveActivityMessage');
  const agentBadge = document.getElementById('activeAgentBadge');
  if (activityBar) activityBar.classList.remove('hidden');
  if (activityMsg) activityMsg.innerText = '🚀 Launching autonomous multi-agent swarm...';
  if (agentBadge) {
    agentBadge.innerText = 'SWARM ACTIVE';
    agentBadge.className = 'flex-shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-mono';
  }

  setNodeState('research', 'running');

  const goBtn = document.getElementById('goBtn');
  goBtn.disabled = true;
  goBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Running</span>`;

  try {
    const response = await fetch('/api/forge-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        tone: tone,
        include_media: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to start campaign`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentEvent = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep uncompleted line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = null;
          continue;
        }
        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const rawData = trimmed.slice(5).trim();
          try {
            const data = JSON.parse(rawData);
            handlePipelineEvent(currentEvent, data);
          } catch (err) {
            console.debug('SSE parse note:', err);
          }
        }
      }
    }

  } catch (error) {
    console.error('Pipeline error:', error);
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    goBtn.disabled = false;
    goBtn.innerHTML = `<i class="fa-solid fa-play text-xs"></i><span>Go</span>`;
  }
}

// ----------------------------------------------------
// SSE PIPELINE EVENT HANDLER
// ----------------------------------------------------
function handlePipelineEvent(event, data) {
  if (!data) return;
  const activityMsg = document.getElementById('liveActivityMessage');
  const agentBadge = document.getElementById('activeAgentBadge');

  // 1. Card Event: Deep Research, Strategic Plan, Platform Fitting, or 6 Platform Cards
  if (event === 'card' || (data.platform && data.content)) {
    const platform = data.platform;
    currentCampaign.cards[platform] = data;

    setNodeState(platform, 'completed');

    const snippetElem = document.getElementById(`snippet_${platform}`);
    if (snippetElem && data.content) {
      const cleanSnippet = data.content
        .replace(/[#*`_\[\]<>!]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
      snippetElem.innerText = cleanSnippet.slice(0, 110) + '...';
    }

    redrawWires();
    return;
  }

  // 2. Status / Progress Event
  if (event === 'status' || data.stage) {
    if (activityMsg && data.message) activityMsg.innerText = data.message;
    if (agentBadge && data.agent) agentBadge.innerText = data.agent;

    if (data.stage === 'researching') {
      setNodeState('research', 'running');
    } else if (data.stage === 'planning') {
      setNodeState('research', 'completed');
      setNodeState('plan', 'running');
    } else if (data.stage === 'platform_fitting') {
      setNodeState('plan', 'completed');
      setNodeState('platform_fitting', 'running');
    } else if (data.stage && data.stage.startsWith('generating_')) {
      setNodeState('platform_fitting', 'completed');
      const targetPlat = data.stage.replace('generating_', '');
      if (VISIBLE_PLATFORMS.includes(targetPlat)) {
        setNodeState(targetPlat, 'running');
      }
    }
    return;
  }

  // 3. Virality Scorecard
  if (event === 'virality' || data.overall_score !== undefined) {
    currentCampaign.virality = data;
    return;
  }

  // 4. Complete Event
  if (event === 'complete' || data.stage === 'complete') {
    VISIBLE_PLATFORMS.forEach(p => {
      if (currentCampaign.cards[p]) setNodeState(p, 'completed');
    });

    if (activityMsg) activityMsg.innerText = '✨ Swarm completed all 9 workflow nodes!';
    if (agentBadge) {
      agentBadge.innerText = 'COMPLETE';
      agentBadge.className = 'flex-shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 font-mono';
    }

    document.getElementById('downloadBundleBtn').classList.remove('hidden');
    document.getElementById('createNewBtn').classList.remove('hidden');

    saveCurrentCampaignToHistory();
    showToast('✨ Campaign generated & auto-saved to history!', 'success');
  }
}

// ----------------------------------------------------
// FRESH START / CREATE NEW
// ----------------------------------------------------
function resetForNewCampaign() {
  document.getElementById('promptInput').value = '';
  document.getElementById('liveActivityBar').classList.add('hidden');
  document.getElementById('downloadBundleBtn').classList.add('hidden');
  document.getElementById('createNewBtn').classList.add('hidden');

  currentCampaign = {
    id: null,
    timestamp: null,
    prompt: '',
    tone: '',
    cards: {},
    research: null,
    plan: null,
    virality: null
  };

  initNodesState();
  closeDetailModal();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('✨ Clean slate ready for your new campaign!', 'success');
}

// ----------------------------------------------------
// HISTORY PERSISTENCE & DRAWER
// ----------------------------------------------------
function saveCurrentCampaignToHistory() {
  if (!currentCampaign.id || Object.keys(currentCampaign.cards).length === 0) return;
  
  let history = getHistory();
  // Avoid duplicate ID
  history = history.filter(h => h.id !== currentCampaign.id);
  
  history.unshift({
    id: currentCampaign.id,
    timestamp: currentCampaign.timestamp || new Date().toLocaleString(),
    prompt: currentCampaign.prompt,
    tone: currentCampaign.tone,
    cards: currentCampaign.cards,
    virality: currentCampaign.virality,
    nodeCount: Object.keys(currentCampaign.cards).length
  });

  // Keep last 30 campaigns
  if (history.length > 30) history = history.slice(0, 30);

  localStorage.setItem('omnicast_campaign_history', JSON.stringify(history));
  updateHistoryBadge();
}

function getHistory() {
  try {
    const raw = localStorage.getItem('omnicast_campaign_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function updateHistoryBadge() {
  const history = getHistory();
  const badge = document.getElementById('historyCountBadge');
  const totalLabel = document.getElementById('historyTotalCount');
  if (badge) badge.innerText = history.length;
  if (totalLabel) totalLabel.innerText = `${history.length} campaign${history.length === 1 ? '' : 's'} stored`;
}

function loadHistory() {
  updateHistoryBadge();
}

function toggleHistoryDrawer() {
  const drawer = document.getElementById('historyDrawer');
  if (drawer.classList.contains('hidden')) {
    renderHistoryDrawer();
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  } else {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function renderHistoryDrawer() {
  const container = document.getElementById('historyListContainer');
  const history = getHistory();
  updateHistoryBadge();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 text-slate-400">
        <i class="fa-solid fa-folder-open text-3xl mb-3 text-slate-300 dark:text-slate-600"></i>
        <p class="text-xs">No saved campaigns yet.</p>
        <p class="text-[11px] text-slate-400 mt-1">Run any prompt to auto-save!</p>
      </div>`;
    return;
  }

  container.innerHTML = history.map(item => `
    <div class="bg-slate-50 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 rounded-xl p-3.5 hover:border-indigo-500 transition-all group">
      <div class="flex items-start justify-between gap-2 mb-1.5">
        <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">${escapeHtml(item.prompt)}</h4>
        <button onclick="deleteCampaignItem('${item.id}', event)" class="text-slate-400 hover:text-rose-500 p-1 transition-colors" title="Delete campaign">
          <i class="fa-regular fa-trash-can text-xs"></i>
        </button>
      </div>
      <div class="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
        <span><i class="fa-regular fa-clock mr-1"></i>${item.timestamp}</span>
        <span class="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-semibold">${item.nodeCount || Object.keys(item.cards || {}).length} Nodes</span>
      </div>
      <div class="mt-2.5 pt-2 border-t border-slate-200 dark:border-gray-700/60 flex justify-end">
        <button onclick="restoreCampaignItem('${item.id}')" class="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center space-x-1">
          <span>Restore & View</span>
          <i class="fa-solid fa-arrow-right text-[9px]"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function restoreCampaignItem(id) {
  const history = getHistory();
  const target = history.find(h => h.id === id);
  if (!target) return;

  currentCampaign = {
    id: target.id,
    timestamp: target.timestamp,
    prompt: target.prompt,
    tone: target.tone || 'Auto-Detect',
    cards: target.cards || {},
    research: target.cards?.research || null,
    plan: target.cards?.plan || null,
    virality: target.virality || null
  };

  document.getElementById('promptInput').value = target.prompt;
  initNodesState();

  Object.keys(currentCampaign.cards).forEach(plat => {
    setNodeState(plat, 'completed');
    const card = currentCampaign.cards[plat];
    const snippetElem = document.getElementById(`snippet_${plat}`);
    if (snippetElem && card.content) {
      const cleanSnippet = card.content.replace(/[#*`_\[\]<>!]/g, '').replace(/\n+/g, ' ').trim();
      snippetElem.innerText = cleanSnippet.slice(0, 110) + '...';
    }
  });

  document.getElementById('downloadBundleBtn').classList.remove('hidden');
  document.getElementById('createNewBtn').classList.remove('hidden');

  toggleHistoryDrawer();
  redrawWires();
  showToast(`Restored campaign: "${target.prompt.slice(0, 35)}..."`, 'success');
}

function deleteCampaignItem(id, e) {
  if (e) e.stopPropagation();
  let history = getHistory();
  history = history.filter(h => h.id !== id);
  localStorage.setItem('omnicast_campaign_history', JSON.stringify(history));
  renderHistoryDrawer();
  showToast('Campaign deleted.', 'info');
}

function clearAllHistory() {
  if (confirm('Are you sure you want to delete all saved campaign history?')) {
    localStorage.removeItem('omnicast_campaign_history');
    renderHistoryDrawer();
    showToast('All campaign history cleared.', 'info');
  }
}

// ----------------------------------------------------
// ----------------------------------------------------
// DETAIL INSPECTION MODAL
// ----------------------------------------------------
function openDetailModal(platform) {
  activeModalPlatform = platform;
  const config = PLATFORMS_CONFIG[platform] || { title: platform, icon: 'fa-cube', badgeClass: 'bg-indigo-600', subtitle: 'Platform Asset' };
  const card = currentCampaign.cards[platform];

  document.getElementById('modalTitle').innerText = config.title;
  document.getElementById('modalPlatformSubtitle').innerText = config.subtitle;
  document.getElementById('modalBadgeIcon').className = `w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm ${config.badgeClass}`;
  document.getElementById('modalBadgeIcon').innerHTML = `<i class="${config.icon}"></i>`;

  const contentView = document.getElementById('modalContentView');
  const editView = document.getElementById('modalEditView');
  const editTextarea = document.getElementById('modalEditTextarea');

  isEditMode = false;
  contentView.classList.remove('hidden');
  editView.classList.add('hidden');

  if (!card || !card.content) {
    contentView.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <i class="fa-solid fa-hourglass-start text-3xl mb-2 animate-bounce"></i>
        <p class="text-xs">This node hasn't run yet. Click <strong>"Go"</strong> to execute the full studio swarm!</p>
      </div>`;
    editTextarea.value = '';
  } else {
    contentView.innerHTML = formatMarkdown(card.content);
    editTextarea.value = card.content;
  }

  // Ensure scroll position always starts from the absolute top
  if (contentView) contentView.scrollTop = 0;
  if (editView) editView.scrollTop = 0;
  const modalContainer = document.getElementById('nodeDetailModal');
  if (modalContainer) modalContainer.scrollTop = 0;

  document.getElementById('modalTweakInput').value = '';
  document.getElementById('nodeDetailModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  document.getElementById('nodeDetailModal').classList.add('hidden');
  activeModalPlatform = null;
  document.body.style.overflow = '';
}

function toggleModalEditMode() {
  isEditMode = !isEditMode;
  const contentView = document.getElementById('modalContentView');
  const editView = document.getElementById('modalEditView');

  if (isEditMode) {
    contentView.classList.add('hidden');
    editView.classList.remove('hidden');
  } else {
    contentView.classList.remove('hidden');
    editView.classList.add('hidden');
  }
}

function saveModalEdit() {
  const newContent = document.getElementById('modalEditTextarea').value;
  if (activeModalPlatform && currentCampaign.cards[activeModalPlatform]) {
    currentCampaign.cards[activeModalPlatform].content = newContent;
    document.getElementById('modalContentView').innerHTML = formatMarkdown(newContent);
    toggleModalEditMode();
    saveCurrentCampaignToHistory();
    showToast('Changes saved & synced to history!', 'success');
  }
}

function copyCurrentModalContent() {
  if (!activeModalPlatform || !currentCampaign.cards[activeModalPlatform]) {
    showToast('No content to copy!', 'error');
    return;
  }
  const content = currentCampaign.cards[activeModalPlatform].content;
  navigator.clipboard.writeText(content).then(() => {
    showToast('Copied to clipboard!', 'success');
  });
}

function downloadCurrentModalContent() {
  if (!activeModalPlatform || !currentCampaign.cards[activeModalPlatform]) return;
  const card = currentCampaign.cards[activeModalPlatform];
  const blob = new Blob([card.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activeModalPlatform}_${card.title.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------
// 1-CLICK INSTANT REGENERATE / TWEAK
// ----------------------------------------------------
async function execute1ClickRegen() {
  if (!activeModalPlatform || !currentCampaign.cards[activeModalPlatform]) return;
  const tweak = document.getElementById('modalTweakInput').value.trim();
  const currentCard = currentCampaign.cards[activeModalPlatform];

  const regenBtn = document.getElementById('modalRegenBtn');
  const regenIcon = document.getElementById('modalRegenIcon');
  if (regenBtn) regenBtn.disabled = true;
  if (regenIcon) regenIcon.className = 'fa-solid fa-spinner fa-spin text-sm';

  showToast(`Regenerating ${PLATFORMS_CONFIG[activeModalPlatform]?.title || activeModalPlatform}...`, 'info');

  try {
    const res = await fetch('/api/regenerate-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: currentCampaign.id || 'cmp_regen',
        platform: activeModalPlatform,
        current_content: currentCard.content,
        research_summary: currentCampaign.cards['research']?.content || currentCampaign.prompt,
        tweak_instruction: tweak || 'Elevate with maximum precision and freshness'
      })
    });

    if (res.ok) {
      const updatedCard = await res.json();
      currentCampaign.cards[activeModalPlatform] = updatedCard;
      openDetailModal(activeModalPlatform);
      saveCurrentCampaignToHistory();
      showToast('Node regenerated successfully!', 'success');
    }
  } catch (err) {
    showToast(`Regen note: ${err.message}`, 'error');
  } finally {
    if (regenBtn) regenBtn.disabled = false;
    if (regenIcon) regenIcon.className = 'fa-solid fa-rotate text-sm';
  }
}

// ----------------------------------------------------
// DOWNLOAD ZIP BUNDLE
// ----------------------------------------------------
function downloadCampaignBundle() {
  if (Object.keys(currentCampaign.cards).length === 0) {
    showToast('Run a campaign first!', 'error');
    return;
  }
  showToast('Generating full package...', 'info');
  
  // Package into client-side file bundle
  const zipManifest = {
    campaign_id: currentCampaign.id,
    prompt: currentCampaign.prompt,
    created_at: currentCampaign.timestamp,
    cards: currentCampaign.cards
  };
  
  const blob = new Blob([JSON.stringify(zipManifest, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnicast_${currentCampaign.id || 'campaign'}_manifest.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Campaign manifest downloaded!', 'success');
}

// ----------------------------------------------------
// UTILITIES
// ----------------------------------------------------
function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1.5">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^• (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 text-xs">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 text-xs">$1</li>')
    .replace(/\n\n/gim, '<p class="my-2"></p>')
    .replace(/\n/gim, '<br/>');
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const colors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
  };

  toast.className = `px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center space-x-2 transition-all transform duration-200 pointer-events-auto ${colors[type] || colors.info}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// ----------------------------------------------------
// FRESH START / RESET FOR NEW CAMPAIGN
// ----------------------------------------------------
const INITIAL_SNIPPETS = {
  research: 'Comprehensive live internet research dossier.',
  plan: 'Narrative thesis and cross-channel strategy.',
  platform_fitting: 'Native pacing, rules and hook architecture.',
  linkedin: 'Thought leadership post.',
  twitter: '7-Tweet viral thread.',
  whatsapp: 'Direct broadcast message.',
  newsletter: '600-word editorial deep dive.',
  facebook: 'Community narrative post.',
  instagram: 'Engaging Instagram caption & hashtags.'
};

function resetForNewCampaign() {
  const inputElem = document.getElementById('promptInput');
  if (inputElem) inputElem.value = '';

  currentCampaign = {
    id: null,
    timestamp: null,
    prompt: '',
    tone: '',
    cards: {},
    research: null,
    plan: null,
    virality: null
  };

  VISIBLE_PLATFORMS.forEach(p => {
    const node = document.getElementById(`node_${p}`);
    const pill = document.getElementById(`status_pill_${p}`);
    const snip = document.getElementById(`snippet_${p}`);
    if (node) {
      node.className = node.className.replace(/state-\w+/g, '').trim() + ' state-idle';
    }
    if (pill) {
      pill.className = 'px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-gray-800 text-slate-500';
      pill.innerText = '⚪ Idle';
    }
    if (snip && INITIAL_SNIPPETS[p]) {
      snip.innerText = INITIAL_SNIPPETS[p];
    }
  });

  const liveBar = document.getElementById('liveActivityBar');
  if (liveBar) liveBar.classList.add('hidden');

  const createBtn = document.getElementById('createNewBtn');
  if (createBtn) createBtn.classList.add('hidden');

  const zipBtn = document.getElementById('downloadBundleBtn');
  if (zipBtn) zipBtn.classList.add('hidden');

  closeDetailModal();
  redrawWires();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Ready for a new task! Canvas completely cleared.', 'info');
}
