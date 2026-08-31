/**
 * OmniCast AI — Dynamic Precision Flowchart Studio Controller
 * Centered clean modal popup with tight, uncluttered content presentation.
 */

// Global State
let currentCampaign = {
  id: null,
  prompt: '',
  cards: {},
  research: null,
  plan: null,
  virality: null
};

let activeModalPlatform = null;

const VISIBLE_PLATFORMS = [
  'research', 'plan', 'platform_fitting',
  'linkedin', 'twitter', 'whatsapp', 'newsletter', 'facebook', 'instagram'
];

const PLATFORM_NODES = [
  'linkedin', 'twitter', 'whatsapp',
  'newsletter', 'facebook', 'instagram'
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNodesState();

  setTimeout(redrawWires, 50);
  window.addEventListener('resize', redrawWires);

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetailModal();
    }
  });

  const promptInput = document.getElementById('promptInput');
  if (promptInput) {
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        startCampaign();
      }
    });
  }
});

// ----------------------------------------------------
// THEME MANAGEMENT
// ----------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('omnicast_theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fa-solid fa-sun';
  } else {
    document.documentElement.classList.remove('dark');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.className = 'fa-solid fa-moon';
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('omnicast_theme', isDark ? 'dark' : 'light');
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  redrawWires();
}

// ----------------------------------------------------
// DYNAMIC SVG WIRE RENDERING (PIXEL PERFECT CENTERING)
// ----------------------------------------------------
function redrawWires() {
  const container = document.getElementById('workflowContainer');
  const svg = document.getElementById('workflowSvgLayer');
  if (!container || !svg) return;

  const cRect = container.getBoundingClientRect();

  const getPortCenter = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - cRect.left,
      y: r.top + r.height / 2 - cRect.top
    };
  };

  const resBot = getPortCenter('#node_research .port-bottom');
  const planTop = getPortCenter('#node_plan .port-top');
  const planBot = getPortCenter('#node_plan .port-bottom');
  const fitTop = getPortCenter('#node_platform_fitting .port-top');
  const fitBot = getPortCenter('#node_platform_fitting .port-bottom');

  if (!resBot || !planTop || !planBot || !fitTop || !fitBot) return;

  const platformPorts = PLATFORM_NODES.map(p => ({
    platform: p,
    pos: getPortCenter(`#node_${p} .port-top`)
  })).filter(item => item.pos !== null);

  if (platformPorts.length === 0) return;

  svg.innerHTML = '';

  // 1. Line: Research Bottom -> Plan Top
  const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line1.id = 'wire_research_to_plan';
  line1.setAttribute('x1', resBot.x);
  line1.setAttribute('y1', resBot.y);
  line1.setAttribute('x2', planTop.x);
  line1.setAttribute('y2', planTop.y);
  line1.setAttribute('class', currentCampaign.cards['research'] ? 'wire-path completed' : 'wire-path');
  svg.appendChild(line1);

  // 2. Line: Plan Bottom -> Platform Fitting Top
  const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line2.id = 'wire_plan_to_fitting';
  line2.setAttribute('x1', planBot.x);
  line2.setAttribute('y1', planBot.y);
  line2.setAttribute('x2', fitTop.x);
  line2.setAttribute('y2', fitTop.y);
  line2.setAttribute('class', currentCampaign.cards['plan'] ? 'wire-path completed' : 'wire-path');
  svg.appendChild(line2);

  // 3. Trunk & Bus Bar down from Platform Fitting to 6 Platform Nodes
  const firstCardY = platformPorts[0].pos.y;
  const busY = fitBot.y + (firstCardY - fitBot.y) * 0.45;

  const minX = Math.min(...platformPorts.map(p => p.pos.x));
  const maxX = Math.max(...platformPorts.map(p => p.pos.x));

  const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  trunk.id = 'wire_fitting_trunk';
  trunk.setAttribute('x1', fitBot.x);
  trunk.setAttribute('y1', fitBot.y);
  trunk.setAttribute('x2', fitBot.x);
  trunk.setAttribute('y2', busY);
  trunk.setAttribute('class', currentCampaign.cards['platform_fitting'] ? 'wire-path completed' : 'wire-path');
  svg.appendChild(trunk);

  const bus = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  bus.id = 'wire_bus_bar';
  bus.setAttribute('x1', minX);
  bus.setAttribute('y1', busY);
  bus.setAttribute('x2', maxX);
  bus.setAttribute('y2', busY);
  bus.setAttribute('class', currentCampaign.cards['platform_fitting'] ? 'wire-path completed' : 'wire-path');
  svg.appendChild(bus);

  platformPorts.forEach((item) => {
    const feeder = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    feeder.id = `wire_branch_${item.platform}`;
    feeder.setAttribute('x1', item.pos.x);
    feeder.setAttribute('y1', busY);
    feeder.setAttribute('x2', item.pos.x);
    feeder.setAttribute('y2', item.pos.y);
    feeder.setAttribute('class', currentCampaign.cards[item.platform] ? 'wire-path completed' : 'wire-path');
    svg.appendChild(feeder);
  });
}

// ----------------------------------------------------
// NODE GRAPH INITIAL STATE
// ----------------------------------------------------
function initNodesState() {
  VISIBLE_PLATFORMS.forEach(p => {
    const node = document.getElementById(`node_${p}`);
    const pill = document.getElementById(`status_pill_${p}`);
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

// ----------------------------------------------------
// PIPELINE EXECUTION ("GO" BUTTON)
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

  const tone = document.getElementById('toneSelect').value;

  currentCampaign = {
    id: null,
    prompt: promptText,
    cards: {},
    research: null,
    plan: null,
    virality: null
  };

  initNodesState();
  document.getElementById('downloadBundleBtn').classList.add('hidden');

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
        include_media: false
      })
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      
      const cleanBuffer = buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const events = cleanBuffer.split('\n\n');
      buffer = events.pop() || '';

      for (let raw of events) {
        if (raw.trim()) {
          parseSSEEvent(raw);
        }
      }
    }

    if (buffer.trim()) {
      parseSSEEvent(buffer.trim());
    }

  } catch (err) {
    console.error('SSE stream error, trying fallback:', err);
    try {
      const fallbackRes = await fetch('/api/forge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          tone: tone,
          include_media: false
        })
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackData.cards) {
        fallbackData.cards.forEach(card => updateNodeContent(card));
        completeWorkflow();
      }
    } catch (fbErr) {
      showToast(`Error: ${fbErr.message}`, 'error');
    }
  } finally {
    goBtn.disabled = false;
    goBtn.innerHTML = `<i class="fa-solid fa-play text-xs"></i><span>Go</span>`;
  }
}

function parseSSEEvent(raw) {
  const cleanRaw = raw.replace(/\r/g, '');
  const lines = cleanRaw.split('\n');
  let type = '';
  let dataStr = '';

  for (let l of lines) {
    const trimmed = l.trim();
    if (trimmed.startsWith('event:')) {
      type = trimmed.replace('event:', '').trim();
    } else if (trimmed.startsWith('data:')) {
      dataStr += trimmed.replace('data:', '').trim();
    }
  }

  if (!type || !dataStr) return;

  try {
    const data = JSON.parse(dataStr);
    handlePipelineEvent(type.trim(), data);
  } catch (e) {
    console.error('SSE parse error:', e, dataStr);
  }
}

function handlePipelineEvent(type, data) {
  if (type === 'status') {
    if (data.campaign_id) currentCampaign.id = data.campaign_id;

    const activityMsg = document.getElementById('liveActivityMessage');
    const agentBadge = document.getElementById('activeAgentBadge');
    if (activityMsg && data.message) activityMsg.innerText = data.message;
    if (agentBadge && data.agent) agentBadge.innerText = data.agent.toUpperCase();

    if (data.stage === 'researching') {
      setNodeState('research', 'running');
    } else if (data.stage === 'planning') {
      setNodeState('plan', 'running');
      setWireActive('wire_research_to_plan');
    } else if (data.stage === 'platform_fitting') {
      setNodeState('platform_fitting', 'running');
      setWireActive('wire_plan_to_fitting');
    } else if (data.stage.startsWith('generating_')) {
      const platformKey = data.stage.replace('generating_', '').replace('_script', '');
      if (VISIBLE_PLATFORMS.includes(platformKey)) {
        setNodeState(platformKey, 'running');
        setWireActive('wire_fitting_trunk');
        setWireActive('wire_bus_bar');
        setWireActive(`wire_branch_${platformKey}`);
      }
    }
  }
  else if (type === 'card') {
    if (VISIBLE_PLATFORMS.includes(data.platform)) {
      updateNodeContent(data);
    }
  }
  else if (type === 'virality') {
    currentCampaign.virality = data;
  }
  else if (type === 'complete') {
    completeWorkflow();
  }
}

function completeWorkflow() {
  VISIBLE_PLATFORMS.forEach(p => {
    if (currentCampaign.cards[p]) {
      setNodeState(p, 'completed');
    }
  });

  setWireCompleted('wire_research_to_plan');
  setWireCompleted('wire_plan_to_fitting');
  setWireCompleted('wire_fitting_trunk');
  setWireCompleted('wire_bus_bar');
  PLATFORM_NODES.forEach(p => setWireCompleted(`wire_branch_${p}`));

  const activityMsg = document.getElementById('liveActivityMessage');
  const agentBadge = document.getElementById('activeAgentBadge');
  if (activityMsg) activityMsg.innerText = '✨ Swarm completed all 9 workflow nodes!';
  if (agentBadge) {
    agentBadge.innerText = '100% COMPLETE';
    agentBadge.className = 'flex-shrink-0 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-mono';
  }

  document.getElementById('downloadBundleBtn').classList.remove('hidden');
  document.getElementById('downloadBundleBtn').classList.add('flex');
  showToast('✨ All workflow nodes completed successfully!', 'success');
}

function setNodeState(platform, state) {
  const node = document.getElementById(`node_${platform}`);
  const pill = document.getElementById(`status_pill_${platform}`);
  if (!node) return;

  node.className = node.className.replace(/state-\w+/g, '') + ` state-${state}`;

  if (pill) {
    if (state === 'running') {
      pill.className = 'px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 animate-pulse';
      pill.innerHTML = '⚡ Running...';
    } else if (state === 'completed') {
      pill.className = 'px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      pill.innerHTML = '✓ Ready';
    } else {
      pill.className = 'px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-gray-800 text-slate-500';
      pill.innerHTML = '⚪ Idle';
    }
  }
}

function setWireActive(wireId) {
  const wire = document.getElementById(wireId);
  if (wire) {
    wire.classList.remove('completed');
    wire.classList.add('active');
  }
}

function setWireCompleted(wireId) {
  const wire = document.getElementById(wireId);
  if (wire) {
    wire.classList.remove('active');
    wire.classList.add('completed');
  }
}

function updateNodeContent(card) {
  const platform = card.platform;
  currentCampaign.cards[platform] = card;
  setNodeState(platform, 'completed');
  setWireCompleted(`wire_branch_${platform}`);

  const snippetElem = document.getElementById(`snippet_${platform}`);
  if (snippetElem && card.content) {
    const cleanSnippet = card.content
      .replace(/^#+ /gm, '')
      .replace(/\*\*/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/---/g, '')
      .trim()
      .slice(0, 110) + '...';
    snippetElem.innerText = cleanSnippet;
  }
}

// ----------------------------------------------------
// CENTERED MODAL DETAIL INSPECTION (TIGHT & CLEAN)
// ----------------------------------------------------
function openDetailModal(platform) {
  activeModalPlatform = platform;
  const card = currentCampaign.cards[platform];
  const meta = getPlatformMeta(platform);

  document.getElementById('modalTitle').innerText = card ? card.title : meta.label;
  document.getElementById('modalPlatformSubtitle').innerText = meta.label;
  
  const iconBadge = document.getElementById('modalBadgeIcon');
  iconBadge.className = `w-8 h-8 rounded-xl ${meta.badgeClass} flex items-center justify-center text-white text-sm shadow-sm`;
  iconBadge.innerHTML = `<i class="${meta.icon}"></i>`;

  const contentView = document.getElementById('modalContentView');
  if (card && card.content) {
    contentView.innerHTML = parseMarkdownToHtml(card.content);
  } else {
    contentView.innerHTML = `<div class="p-8 text-center text-slate-400">Node has not executed yet. Click <strong>Go</strong> to run the workflow.</div>`;
  }

  contentView.classList.remove('hidden');
  document.getElementById('modalEditView').classList.add('hidden');
  document.getElementById('modalTweakInput').value = '';
  document.getElementById('nodeDetailModal').classList.remove('hidden');
}

function closeDetailModal() {
  document.getElementById('nodeDetailModal').classList.add('hidden');
  activeModalPlatform = null;
}

// ----------------------------------------------------
// MODAL ACTIONS: COPY, DOWNLOAD, EDIT, 1-CLICK REGEN
// ----------------------------------------------------
function copyCurrentModalContent() {
  if (!activeModalPlatform) return;
  const card = currentCampaign.cards[activeModalPlatform];
  if (!card) return;

  navigator.clipboard.writeText(card.content).then(() => {
    const icon = document.getElementById('modalCopyIcon');
    if (icon) {
      icon.className = 'fa-solid fa-check text-emerald-500';
      setTimeout(() => { icon.className = 'fa-regular fa-copy'; }, 2000);
    }
    showToast(`Copied ${card.title} to clipboard!`, 'success');
  });
}

function downloadCurrentModalContent() {
  if (!activeModalPlatform) return;
  const card = currentCampaign.cards[activeModalPlatform];
  if (!card) return;

  const ext = (activeModalPlatform === 'whatsapp' || activeModalPlatform === 'facebook') ? 'txt' : 'md';
  const blob = new Blob([card.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `omnicast_${activeModalPlatform}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Downloaded omnicast_${activeModalPlatform}.${ext}`, 'info');
}

function toggleModalEditMode() {
  const contentView = document.getElementById('modalContentView');
  const editView = document.getElementById('modalEditView');
  const textarea = document.getElementById('modalEditTextarea');
  const card = currentCampaign.cards[activeModalPlatform];

  if (editView.classList.contains('hidden')) {
    textarea.value = card ? card.content : '';
    contentView.classList.add('hidden');
    editView.classList.remove('hidden');
  } else {
    editView.classList.add('hidden');
    contentView.classList.remove('hidden');
  }
}

function saveModalEdit() {
  const textarea = document.getElementById('modalEditTextarea');
  const card = currentCampaign.cards[activeModalPlatform];
  if (!card) return;

  card.content = textarea.value;
  document.getElementById('modalContentView').innerHTML = parseMarkdownToHtml(card.content);
  toggleModalEditMode();

  updateNodeContent(card);
  showToast(`Saved changes for ${card.title}`, 'success');
}

// ----------------------------------------------------
// 1-CLICK AUTONOMOUS REGENERATION (NO PROMPT FORCED)
// ----------------------------------------------------
async function execute1ClickRegen() {
  if (!activeModalPlatform) return;
  const platform = activeModalPlatform;
  const card = currentCampaign.cards[platform];
  if (!card) return;

  const tweak = document.getElementById('modalTweakInput').value.trim();

  const regenBtn = document.getElementById('modalRegenBtn');
  const regenIcon = document.getElementById('modalRegenIcon');
  regenBtn.disabled = true;
  regenBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-[11px]"></i><span>Re-rolling...</span>`;
  if (regenIcon) regenIcon.className = 'fa-solid fa-spinner fa-spin text-amber-500';

  try {
    const res = await fetch('/api/regenerate-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: currentCampaign.id || 'cmp_active',
        platform: platform,
        current_content: card.content,
        tweak_instruction: tweak || 'Autonomously explore an alternative high-retention angle with fresh hooks and punchlines.',
        original_prompt: currentCampaign.prompt,
        research_summary: currentCampaign.research ? currentCampaign.research.summary : ''
      })
    });

    if (!res.ok) throw new Error(`Regen failed with status ${res.status}`);

    const updatedCard = await res.json();
    currentCampaign.cards[platform] = updatedCard;

    document.getElementById('modalContentView').innerHTML = parseMarkdownToHtml(updatedCard.content);
    document.getElementById('modalTweakInput').value = '';

    updateNodeContent(updatedCard);
    showToast(`✨ Re-rolled ${updatedCard.title} successfully!`, 'success');
  } catch (err) {
    showToast(`Regeneration error: ${err.message}`, 'error');
  } finally {
    regenBtn.disabled = false;
    regenBtn.innerHTML = `<i class="fa-solid fa-rotate text-[11px]"></i><span>Re-roll</span>`;
    if (regenIcon) regenIcon.className = 'fa-solid fa-rotate';
  }
}

// ----------------------------------------------------
// FULL ZIP BUNDLE EXPORT
// ----------------------------------------------------
async function downloadCampaignBundle() {
  const cardsList = Object.values(currentCampaign.cards);
  if (cardsList.length === 0) return;

  const btn = document.getElementById('downloadBundleBtn');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i><span>Packaging ZIP...</span>`;

  try {
    const res = await fetch('/api/export-bundle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: currentCampaign.id,
        prompt: currentCampaign.prompt,
        created_at: new Date().toISOString(),
        cards: cardsList
      })
    });

    const data = await res.json();
    if (data.download_url) {
      const a = document.createElement('a');
      a.href = data.download_url;
      a.download = data.filename || 'omnicast_campaign.zip';
      a.click();
      showToast('📦 Campaign ZIP bundle downloaded!', 'success');
    }
  } catch (err) {
    showToast(`Failed to download bundle: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-file-zipper"></i><span>Download All (.ZIP)</span>`;
  }
}

// ----------------------------------------------------
// UTILITIES
// ----------------------------------------------------
function getPlatformMeta(platform) {
  const map = {
    research: { label: 'Deep Research Dossier', icon: 'fa-solid fa-magnifying-glass', badgeClass: 'badge-research' },
    plan: { label: 'Strategic Campaign Plan', icon: 'fa-solid fa-brain', badgeClass: 'badge-plan' },
    platform_fitting: { label: 'Platform Adaptation Engine', icon: 'fa-solid fa-ruler-combined', badgeClass: 'badge-fitting' },
    linkedin: { label: 'LinkedIn Post', icon: 'fa-brands fa-linkedin-in', badgeClass: 'badge-linkedin' },
    twitter: { label: 'X / Twitter Thread', icon: 'fa-brands fa-x-twitter', badgeClass: 'badge-twitter' },
    whatsapp: { label: 'WhatsApp Broadcast', icon: 'fa-brands fa-whatsapp', badgeClass: 'badge-whatsapp' },
    newsletter: { label: 'Email Newsletter', icon: 'fa-regular fa-envelope', badgeClass: 'badge-newsletter' },
    facebook: { label: 'Facebook Post', icon: 'fa-brands fa-facebook-f', badgeClass: 'badge-facebook' },
    instagram: { label: 'Instagram Carousel', icon: 'fa-brands fa-instagram', badgeClass: 'badge-instagram' },
  };
  return map[platform] || { label: platform, icon: 'fa-solid fa-cube', badgeClass: 'bg-indigo-600 text-white' };
}

function parseMarkdownToHtml(md) {
  if (!md) return '';
  let html = md;
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-bold text-sm text-slate-900 dark:text-white mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-bold text-base text-slate-900 dark:text-white mt-3.5 mb-1.5">$1</h2>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
  html = html.replace(/`(.*?)`/gim, '<code class="px-1 py-0.5 rounded text-xs bg-slate-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-mono">$1</code>');
  html = html.replace(/^---$/gim, '<hr class="my-2.5 border-slate-200 dark:border-gray-800">');
  html = html.replace(/^\• (.*$)/gim, '<li class="flex items-start space-x-1.5 my-0.5"><span class="text-indigo-500 font-bold">•</span><span>$1</span></li>');
  html = html.replace(/^\* (.*$)/gim, '<li class="flex items-start space-x-1.5 my-0.5"><span class="text-indigo-500 font-bold">•</span><span>$1</span></li>');
  html = html.replace(/\n/gim, '<br>');
  return html;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600 text-white' : (type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900');
  const icon = type === 'success' ? 'fa-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info');

  toast.className = `flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-medium ${bg} pointer-events-auto transform transition-all duration-300 translate-y-2 opacity-0`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => { toast.classList.remove('translate-y-2', 'opacity-0'); }, 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
