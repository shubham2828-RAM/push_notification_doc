/* =========================================================
   PUSH NOTIFICATION TO MOBILE APP — shared behaviour
   ========================================================= */

/* ---------- Binary rain canvas (used on splash + hero) ---------- */
function startBinaryRain(canvas){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w,h,cols,drops;
  const fontSize = 14;

  function resize(){
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    ctx.scale(1,1);
    cols = Math.floor(w / (fontSize*devicePixelRatio));
    drops = new Array(cols).fill(0).map(()=> Math.random()*-680);
  }
  resize();
  window.addEventListener('resize', resize);

  function draw(){
    ctx.fillStyle = 'rgba(10,14,19,0.14)';
    ctx.fillRect(0,0,w,h);
    ctx.font = (fontSize*devicePixelRatio) + 'px JetBrains Mono, monospace';
    for(let i=0;i<cols;i++){
      const char = Math.random() > 0.5 ? '1' : '0';
      const x = i * fontSize * devicePixelRatio;
      const y = drops[i] * fontSize * devicePixelRatio;
      ctx.fillStyle = Math.random() > 0.985 ? 'rgba(240,167,58,0.7)' : 'rgba(79,216,196,0.35)';
      ctx.fillText(char, x, y);
      if(y > h && Math.random() > 0.975){ drops[i] = 0; }
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---------- Splash screen sequence ---------- */
function initSplash(){
  const splash = document.getElementById('splash');
  if(!splash) return;

  const canvas = document.getElementById('splash-canvas');
  startBinaryRain(canvas);

  const statusEl = document.getElementById('splash-status');
  const barFill = document.getElementById('splash-bar-fill');
  const skipBtn = document.getElementById('splash-skip');

  const words = [
    'CONNECTING TO IWORKBENCH',
    'READING SELLER_MOB_NOTI',
    'EVALUATING DYNAMIC CONDITIONS',
    'RESOLVING FCM TOKENS',
    'PUBLISHING TO KAFKA',
    'AUTHENTICATING WITH FIREBASE',
    'ROUTING TO MOBILE DEVICE',
    'RENDERING ARCHITECTURE DOCS'
  ];
  let wi = 0;
  if(statusEl){
    statusEl.textContent = words[0];
    setInterval(()=>{
      wi = (wi+1) % words.length;
      statusEl.textContent = words[wi];
    }, 1250);
  }

  const DURATION = 10000; 
  const start = performance.now();
  function tick(now){
    const pct = Math.min(100, ((now-start)/DURATION)*100);
    if(barFill) barFill.style.width = pct + '%';
    if(pct < 100){ requestAnimationFrame(tick); }
    else { closeSplash(); }
  }
  requestAnimationFrame(tick);

  setTimeout(()=>{ if(skipBtn) skipBtn.classList.add('show'); }, 2600);
  if(skipBtn){ skipBtn.addEventListener('click', closeSplash); }

  function closeSplash(){
    splash.classList.add('hide');
    document.body.style.overflow = '';
    sessionStorage.setItem('pn_splash_seen','1');
  }

  document.body.style.overflow = 'hidden';
}

/* ---------- Nav toggle (mobile) ---------- */
function initNav(){
  const btn = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if(!btn || !links) return;
  btn.addEventListener('click', ()=> links.classList.toggle('open'));
}

/* ---------- Scroll reveal ---------- */
function initReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold:0.14 });
  items.forEach(i=> io.observe(i));
}

/* ---------- Interactive pipeline nodes ---------- */
const PIPELINE_DETAILS = {
  iworkbench: {
    title: 'iWorkBench — Admin Console',
    text: 'An Ops/Admin user composes a notification in iWorkBench: title, body, deep link, target audience, and the intended send window. Saving the notification hands it off to persistence — nothing is sent from this step.'
  },
  mongodb: {
    title: 'MongoDB — seller_mobile_notifications',
    text: 'The notification record is persisted to the seller_mobile_notifications collection in a pending state, along with its targeting criteria and schedule window, awaiting the next scheduler cycle.'
  },
  scheduler: {
    title: 'Notification Scheduler',
    text: 'The production scheduler runs every 15 minutes. It scans MongoDB for notifications whose send window has opened and are still in a pending or scheduled state.'
  },
  conditions: {
    title: 'Dynamic Condition Evaluation',
    text: 'For each pending notification, the scheduler evaluates its targeting conditions — seller category, region, account status, and opt-in preference — to build the eligible seller set.'
  },
  tokens: {
    title: 'FCM Token Resolution',
    text: 'For every eligible seller, the scheduler resolves the seller\u2019s currently registered FCM device token, pairing each seller with the token their mobile app last registered.'
  },
  kafka: {
    title: 'Kafka — Notification Events',
    text: 'The scheduler publishes one event per eligible seller/token pair to a Kafka topic. Kafka decouples scheduling and targeting from the actual delivery work, and absorbs bursts of eligible sellers.'
  },
  cpaas: {
    title: 'CPaaS Notification Service',
    text: 'A dedicated CPaaS consumer service reads events off Kafka, builds the platform-specific payload for each device, and prepares an authenticated delivery request.'
  },
  fcm: {
    title: 'Firebase Cloud Messaging',
    text: 'The CPaaS service sends an OAuth 2.0 authenticated HTTP POST to the Firebase Cloud Messaging API for each device, one request per token.'
  },
  mobile: {
    title: 'Seller Mobile App',
    text: 'Firebase routes the payload using the FCM token to deliver the notification to the seller\u2019s device, where the mobile app renders it and handles the deep link on tap.'
  }
};

function initPipeline(){
  const nodes = document.querySelectorAll('.p-node');
  const detailTitle = document.getElementById('pipeline-detail-title');
  const detailText = document.getElementById('pipeline-detail-text');
  if(!nodes.length || !detailTitle) return;

  function show(key, el){
    const d = PIPELINE_DETAILS[key];
    if(!d) return;
    detailTitle.textContent = d.title;
    detailText.textContent = d.text;
    nodes.forEach(n=> n.classList.remove('active'));
    el.classList.add('active');
  }

  nodes.forEach(n=>{
    n.addEventListener('click', ()=> show(n.dataset.node, n));
    n.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); show(n.dataset.node, n); }
    });
  });

  // auto cycle for a "live" feel, pauses on manual interaction
  const order = Array.from(nodes);
  let idx = 0;
  let auto = setInterval(()=>{
    idx = (idx+1) % order.length;
    show(order[idx].dataset.node, order[idx]);
  }, 3200);
  nodes.forEach(n=> n.addEventListener('click', ()=> clearInterval(auto)));

  show(order[0].dataset.node, order[0]);
}

/* ---------- Scheduler countdown (simulated) ---------- */
function initSchedulerClock(){
  const el = document.getElementById('scheduler-clock');
  if(!el) return;
  const CYCLE = 15 * 60 ; // simulated seconds standing in for the 15-minute production cycle
  let remaining = CYCLE;
  function render(){
    const m = String(Math.floor(remaining/60)).padStart(2,'0');
    const s = String(remaining%60).padStart(2,'0');
    el.textContent = `${m}:${s}`;
  }
  render();
  setInterval(()=>{
    remaining = remaining > 0 ? remaining - 1 : CYCLE;
    render();
  }, 1000);
}

/* ---------- Details-page auth gate (demo only, not real security) ---------- */

/* ---------- Notification → Condition graph ----------
   Edit this object to match your real notification/condition list.
   Key = notification name shown to the user, value = array of condition names. */
const CONDITION_MAP = {
  'Promotional Notification': ['Monthly Shipment Volume', 'BYOC Plan', 'Manual Seller Selection','Kyc Type', 'Plan Type', 'Device Type','First Recharge Date', 'State Location','Signup Date', 'Channel Type'],
  'Reminder Notification': ['Monthly Shipment Volume','Manual Seller Selection','Kyc Type', 'Plan Type', 'Device Type','First Recharge Date', 'State Location','Signup Date', 'Channel Type', 'Billing Type', 'App Version', 'Wallet Balance'],
  'Alert Message': ['Monthly Shipment Volume', 'BYOC Plan','Manual Seller Selection', 'Plan Type', 'App Version','First Recharge Date', 'State Location','Signup Date', 'Channel Type', 'Billing Type'],
  'Location Based Notifications (Geofencing)': ['Monthly Shipment Volume', 'BYOC Plan','Signup Date', 'State Location', 'First Recharge Date'],
  'Coupons': ['Monthly Shipment Volume', 'BYOC Plan','Manual Seller Selection', 'Kyc Type', 'Plan Type', 'Wallet Balance','First Recharge Date', 'State Location','Signup Date', 'Channel Type', 'Billing Type'],
};

const SVG_NS = 'http://www.w3.org/2000/svg';

function initConditionGraph(){
  const list = document.getElementById('notif-list');
  const svg = document.getElementById('condition-graph');
  const empty = document.getElementById('graph-empty');
  const titleEl = document.getElementById('graph-canvas-title');
  const countEl = document.getElementById('graph-canvas-count');
  if(!list || !svg) return;

  Object.keys(CONDITION_MAP).forEach((name, i)=>{
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'graph-list-item';
    item.setAttribute('role','listitem');
    item.dataset.name = name;
    item.innerHTML = `<span>${name}</span><span class="count">${CONDITION_MAP[name].length}</span>`;
    item.addEventListener('click', ()=> selectNotification(name, item));
    list.appendChild(item);
  });

  function selectNotification(name, itemEl){
    document.querySelectorAll('.graph-list-item').forEach(el=> el.classList.remove('active'));
    itemEl.classList.add('active');
    drawGraph(name);
  }

  function drawGraph(name){
    const conditions = CONDITION_MAP[name] || [];
    svg.innerHTML = '';
    empty.classList.add('hidden');
    titleEl.textContent = name;
    countEl.textContent = conditions.length + (conditions.length === 1 ? ' condition' : ' conditions');

    const width = 700;
    const rowHeight = 65;
    const topPad = 40;
    const count = conditions.length || 1;
    const height = Math.max(300, topPad * 2 + (count - 1) * rowHeight);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const hubX = 100, hubY = height / 2;
    const condX = width - 190;
    const startY = hubY - ((count - 1) * rowHeight) / 2;

    // straight connecting lines
    conditions.forEach((cond, i)=>{
      const cy = startY + i * rowHeight;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', hubX + 34);
      line.setAttribute('y1', hubY);
      line.setAttribute('x2', condX - 24);
      line.setAttribute('y2', cy);
      line.setAttribute('class', 'g-link');
      svg.appendChild(line);
      setTimeout(()=> line.classList.add('in'), i * 80);
    });

    // hub node
    const hub = document.createElementNS(SVG_NS, 'g');
    hub.setAttribute('class', 'g-node-hub');
    const hubW = 125, hubH = 64;
    hub.innerHTML = `<rect x="${hubX-hubW/2}" y="${hubY-hubH/2}" width="${hubW}" height="${hubH}" rx="6"></rect>`;    
    svg.appendChild(hub);
    const hubText = document.createElementNS(SVG_NS, 'text');
    hubText.setAttribute('x', hubX);
    hubText.setAttribute('y', hubY);
    hubText.setAttribute('text-anchor', 'middle');
    hubText.setAttribute('dominant-baseline', 'middle');
    wrapSvgText(hubText, name, 13, hubX, hubY);
    hub.appendChild(hubText);

    // condition nodes — label sits beside the circle, same row, no overlap
    conditions.forEach((cond, i)=>{
      const cy = startY + i * rowHeight;
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'g-node-cond');
      g.innerHTML = `<circle cx="${condX}" cy="${cy}" r="16"></circle>`;
      const t = document.createElementNS(SVG_NS, 'text');
      t.setAttribute('x', condX + 34);
      t.setAttribute('y', cy);
      t.setAttribute('text-anchor', 'start');
      t.setAttribute('dominant-baseline', 'middle');
      t.textContent = cond;
      g.appendChild(t);
      svg.appendChild(g);
      setTimeout(()=> g.classList.add('in'), 100 + i * 90);
    });
  }

  function wrapSvgText(textEl, str, fontSize, x, y){
    const words = str.split(' ');
    const lines = [];
    let cur = '';
    words.forEach(w=>{
      const test = cur ? cur + ' ' + w : w;
      if(test.length > 12 && cur){ lines.push(cur); cur = w; }
      else{ cur = test; }
    });
    if(cur) lines.push(cur);
    const offset = -((lines.length - 1) * fontSize * 0.6);
    lines.forEach((line, i)=>{
      const tspan = document.createElementNS(SVG_NS, 'tspan');
      tspan.setAttribute('x', x);
      tspan.setAttribute('dy', i === 0 ? offset : fontSize*1.2);
      tspan.textContent = line;
      textEl.appendChild(tspan);
    });
  }

  const first = list.querySelector('.graph-list-item');
  if(first) selectNotification(first.dataset.name, first);
}

function initGate(){
  const gate = document.getElementById('gate');
  if(!gate) return;

  const DEMO_USER = process.env.DEMO_USER;
  const DEMO_PASS = process.env.DEMO_PASS;

  const form = document.getElementById('gate-form');
  const userInput = document.getElementById('gate-user');
  const passInput = document.getElementById('gate-pass');
  const error = document.getElementById('gate-error');
  const page = document.getElementById('page-content');

  if(sessionStorage.getItem('pn_docs_unlocked') === '1'){
    unlock();
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(userInput.value.trim() === DEMO_USER && passInput.value === DEMO_PASS){
      sessionStorage.setItem('pn_docs_unlocked','1');
      unlock();
    } else {
      error.classList.add('show');
      error.textContent = 'Incorrect username or password.';
    }
  });

  function unlock(){
    gate.classList.add('hide');
    if(page) page.classList.remove('locked-page');
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  initSplash();
  initNav();
  initReveal();
  initPipeline();
  initSchedulerClock();
  initConditionGraph();
  initGate();
});
