const SVG_NS = "http://www.w3.org/2000/svg";

const LESSONS = [
  "lesson-stock",
  "lesson-price",
  "lesson-kline",
  "lesson-index",
  "lesson-cycle",
  "lesson-assets",
  "lesson-short",
  "lesson-quant",
  "lesson-fundamental",
  "lesson-technical",
  "lesson-rules",
  "lesson-tools",
  "lesson-risk",
  "lesson-scam",
  "lesson-mindset"
];

const STORAGE_KEY = "new-money-visited";

const views = Array.from(document.querySelectorAll(".view"));
const navItems = Array.from(document.querySelectorAll(".nav-item[data-view]"));
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const resetButton = document.querySelector("#resetProgress");

/* ---------- helpers ---------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSvg(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
  return node;
}

function formatMoney(value) {
  return `${Math.round(value).toLocaleString("zh-CN")} 元`;
}

function formatPercent(value, digits = 1) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function animateNumber(element, target, formatter = (v) => String(Math.round(v))) {
  if (!element) return;
  const start = performance.now();
  const duration = 620;
  const from = Number(element.dataset.value || 0);

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = from + (target - from) * eased;
    element.textContent = formatter(current);
    element.dataset.value = String(current);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatter(target);
      element.dataset.value = String(target);
    }
  }

  requestAnimationFrame(tick);
}

function launchConfetti(count = 110) {
  const canvas = document.querySelector("#confettiCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const colors = ["#d9792b", "#16856b", "#3f6fb5", "#c84a4a", "#e5a14b"];
  const pieces = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.4,
    size: 5 + Math.random() * 7,
    color: colors[Math.floor(Math.random() * colors.length)],
    velocityY: 1.5 + Math.random() * 2.5,
    velocityX: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    spin: -0.15 + Math.random() * 0.3
  }));

  let frame = 0;

  function draw() {
    frame += 1;
    context.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((piece) => {
      piece.x += piece.velocityX;
      piece.y += piece.velocityY;
      piece.rotation += piece.spin;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
      context.restore();
    });
    if (frame < 180) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  requestAnimationFrame(draw);
}

/* ---------- navigation & progress ---------- */

function loadVisited() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id) => LESSONS.includes(id))
      : [];
  } catch {
    return [];
  }
}

function saveVisited(visited) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visited));
}

function renderProgress(visited) {
  const count = visited.length;
  progressText.textContent = `${count} / ${LESSONS.length}`;
  progressBar.style.width = `${(count / LESSONS.length) * 100}%`;

  document.querySelectorAll("[data-status]").forEach((node) => {
    const isDone = visited.includes(node.dataset.status);
    node.textContent = isDone ? "已学习" : "待学习";
    node.classList.toggle("done", isDone);
  });
}

function showView(id) {
  const target = id && views.some((view) => view.id === id) ? id : "overview";

  views.forEach((view) => {
    view.classList.toggle("active", view.id === target);
  });

  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === target);
  });

  const activeNav = navItems.find((item) => item.classList.contains("active"));
  if (activeNav) {
    requestAnimationFrame(() => {
      activeNav.scrollIntoView({
        block: window.innerWidth > 900 ? "center" : "nearest",
        inline: "center",
        behavior: "smooth"
      });
    });
  }

  if (LESSONS.includes(target)) {
    const visited = loadVisited();
    if (!visited.includes(target)) {
      visited.push(target);
      saveVisited(visited);
    }
    renderProgress(visited);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-view]");
  if (!trigger) return;
  event.preventDefault();
  showView(trigger.dataset.view);
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderProgress([]);
  showView("overview");
});

/* ---------- ticker duplication for seamless loop ---------- */

function setupTicker() {
  const track = document.querySelector(".ticker-track");
  if (!track) return;
  const clone = track.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  track.parentElement.appendChild(clone);
}

/* ---------- stock & company ---------- */

function setupStock() {
  const grid = document.querySelector("#shareGrid");
  const slider = document.querySelector("#stockShares");
  const ownership = document.querySelector("#stockOwnership");
  const hint = document.querySelector("#stockShareHint");

  for (let i = 0; i < 100; i += 1) {
    const cell = document.createElement("span");
    cell.className = "share-cell";
    grid.appendChild(cell);
  }

  function update() {
    const value = Number(slider.value);
    const cells = grid.querySelectorAll(".share-cell");
    cells.forEach((cell, index) => {
      cell.classList.toggle("owned", index < value);
    });
    ownership.textContent = `拥有 ${value}%`;
    hint.textContent = `你拥有 ${value} 份，占这家公司的 ${value}%。`;
  }

  slider.addEventListener("input", update);
  update();

  document.querySelectorAll("[data-stock-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#stockChallengeFeedback");
      const isCorrect = button.dataset.stockAnswer === "owner";
      feedback.textContent = isCorrect
        ? "答对了，买股票就是成为公司的股东。"
        : "再想想：股票代表所有权，不是借款，也不是直接购买产品。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) launchConfetti(50);
    });
  });
}

/* ---------- price formation ---------- */

function setupPrice() {
  let demand = 50;
  let supply = 50;
  const priceValue = document.querySelector("#priceValue");
  const priceStatus = document.querySelector("#priceStatus");
  const tiltInner = document.querySelector("#liquidTiltInner");
  const buyerLiquid = document.querySelector("#buyerLiquid");
  const sellerLiquid = document.querySelector("#sellerLiquid");
  const liquidReadout = document.querySelector("#liquidReadout");

  function updatePrice() {
    const price = 100 + (demand - supply) * 0.35;
    priceValue.textContent = price.toFixed(1);
    buyerLiquid.style.height = `${demand}%`;
    sellerLiquid.style.height = `${supply}%`;

    if (demand - supply > 10) {
      tiltInner.classList.add("buyer-more");
      tiltInner.classList.remove("seller-more");
      liquidReadout.textContent = "买方水更多 · 牛市";
      priceStatus.textContent = "买方明显更多，价格正在被推高。";
    } else if (supply - demand > 10) {
      tiltInner.classList.add("seller-more");
      tiltInner.classList.remove("buyer-more");
      liquidReadout.textContent = "卖方水更多 · 熊市";
      priceStatus.textContent = "卖方明显更多，价格正在被压低。";
    } else {
      tiltInner.classList.remove("buyer-more", "seller-more");
      liquidReadout.textContent = "买卖平衡";
      priceStatus.textContent = "买卖力量接近，价格暂时稳定。";
    }
  }

  document.querySelectorAll("[data-price]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.price === "buy") {
        demand = Math.min(100, demand + 5);
        supply = Math.max(0, supply - 2);
      } else {
        supply = Math.min(100, supply + 5);
        demand = Math.max(0, demand - 2);
      }
      updatePrice();
    });
  });

  updatePrice();

  document.querySelectorAll("[data-price-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#priceChallengeFeedback");
      const isCorrect = button.dataset.priceAnswer === "up";
      feedback.textContent = isCorrect
        ? "正确，买方力量更强时，价格通常会上涨。"
        : "再想想：想买的人更多，会推动价格向上。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) launchConfetti(50);
    });
  });
}

/* ---------- K-line ---------- */

const klineTrends = {
  bull: { start: 100, drift: 2.4, volatility: 1.2, seed: 11 },
  range: { start: 100, drift: 0, volatility: 1.8, seed: 22 },
  bear: { start: 100, drift: -2.2, volatility: 1.2, seed: 33 }
};

let klineCandles = makeCandles("bull");

function makeCandles(trendName) {
  const trend = klineTrends[trendName];
  const random = mulberry32(trend.seed);
  let price = trend.start;
  const candles = [];

  for (let i = 0; i < 12; i += 1) {
    const open = price;
    const change = trend.drift + (random() * 2 - 1) * trend.volatility;
    const close = Math.max(5, open + change);
    const high = Math.max(open, close) + random() * 2.4;
    const low = Math.min(open, close) - random() * 2.4;
    candles.push({ open, close, high, low });
    price = close;
  }

  return candles;
}

function renderKlineChart() {
  const svg = document.querySelector("#klineChart");
  if (!svg) return;
  svg.innerHTML = "";

  const width = 720;
  const height = 320;
  const left = 44;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const spacing = plotWidth / klineCandles.length;
  const bodyWidth = Math.max(8, spacing * 0.46);

  const low = Math.min(...klineCandles.map((c) => c.low));
  const high = Math.max(...klineCandles.map((c) => c.high));
  const padding = (high - low) * 0.12 || 1;
  const minPrice = low - padding;
  const maxPrice = high + padding;
  const y = (price) => top + ((maxPrice - price) / (maxPrice - minPrice)) * plotHeight;

  for (let i = 0; i <= 4; i += 1) {
    const price = minPrice + ((maxPrice - minPrice) / 4) * i;
    const yPos = y(price);
    const grid = createSvg("line", {
      x1: left,
      x2: width - right,
      y1: yPos,
      y2: yPos,
      class: "grid-line"
    });
    const label = createSvg("text", {
      x: left - 8,
      y: yPos + 4,
      "text-anchor": "end",
      class: "axis-label"
    });
    label.textContent = price.toFixed(0);
    svg.appendChild(grid);
    svg.appendChild(label);
  }

  klineCandles.forEach((candle, index) => {
    const x = left + index * spacing + spacing / 2;
    const group = createSvg("g", {
      class: `candle ${candle.close >= candle.open ? "candle-up" : "candle-down"}`,
      tabindex: 0
    });
    group.dataset.index = index;
    group.setAttribute("role", "button");
    group.setAttribute("aria-label", `第 ${index + 1} 根K线`);

    const wick = createSvg("line", {
      x1: x,
      x2: x,
      y1: y(candle.high),
      y2: y(candle.low),
      class: "candle-wick"
    });

    const bodyTop = y(Math.max(candle.open, candle.close));
    const bodyHeight = Math.max(2, Math.abs(y(candle.open) - y(candle.close)));
    const body = createSvg("rect", {
      x: x - bodyWidth / 2,
      y: bodyTop,
      width: bodyWidth,
      height: bodyHeight,
      rx: 1,
      class: "candle-body"
    });

    group.appendChild(wick);
    group.appendChild(body);
    group.addEventListener("click", () => showCandleInfo(candle, index));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCandleInfo(candle, index);
      }
    });
    svg.appendChild(group);
  });
}

function showCandleInfo(candle, index) {
  const info = document.querySelector("#klineInfo");
  const type = candle.close >= candle.open ? "阳线" : "阴线";
  info.innerHTML = `
    第 ${index + 1} 根是 <strong>${type}</strong>：
    开 ${candle.open.toFixed(1)} · 收 ${candle.close.toFixed(1)} ·
    高 ${candle.high.toFixed(1)} · 低 ${candle.low.toFixed(1)}
  `;
}

function setupKline() {
  document.querySelectorAll("[data-kline]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-kline]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      klineCandles = makeCandles(button.dataset.kline);
      renderKlineChart();
      document.querySelector("#klineInfo").textContent = "点击任意一根 K 线查看开、高、低、收。";
    });
  });

  document.querySelectorAll("[data-kline-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#klineChallengeFeedback");
      const isCorrect = button.dataset.klineAnswer === "up";
      feedback.textContent = isCorrect ? "答对了，这是一根阳线。" : "再想想：这根蜡烛是绿色，收盘价高于开盘价。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) launchConfetti(55);
    });
  });
}

/* ---------- index & ETF ---------- */

function setupIndex() {
  const stockA = document.querySelector("#stockA");
  const stockB = document.querySelector("#stockB");
  const stockC = document.querySelector("#stockC");
  const stockAValue = document.querySelector("#stockAValue");
  const stockBValue = document.querySelector("#stockBValue");
  const stockCValue = document.querySelector("#stockCValue");
  const indexValue = document.querySelector("#indexValue");
  const indexHint = document.querySelector("#indexHint");

  function update() {
    const a = Number(stockA.value);
    const b = Number(stockB.value);
    const c = Number(stockC.value);
    const average = (a + b + c) / 3;

    stockAValue.textContent = a;
    stockBValue.textContent = b;
    stockCValue.textContent = c;
    indexValue.textContent = `指数 ${Math.round(average)}`;

    const spread = Math.max(a, b, c) - Math.min(a, b, c);
    indexHint.textContent = spread > 80
      ? "三只股票波动很大，但指数只取平均值，所以不会像单只股票那样剧烈。"
      : "三只股票价格接近，指数表现比较平稳。";
  }

  [stockA, stockB, stockC].forEach((input) => input.addEventListener("input", update));
  update();

  document.querySelectorAll("[data-index-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#indexChallengeFeedback");
      const isCorrect = button.dataset.indexAnswer === "basket";
      feedback.textContent = isCorrect
        ? "答对了，指数就是一篮子股票的平均表现。"
        : "再想想：指数不是一个公司，也不是一张债券。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) launchConfetti(50);
    });
  });
}

/* ---------- bull & bear cycle ---------- */

const cycleScenarios = [
  { text: "指数连续数月上涨，人人都在讨论股票，开户人数激增。", answer: "bull" },
  { text: "市场连续下跌，成交量萎缩，投资者普遍恐慌卖出。", answer: "bear" },
  { text: "价格在一个区间里来回波动，没有明显趋势。", answer: "range" }
];

let cycleScenarioIndex = 0;

function buildCycleData() {
  const points = [];
  const phases = [
    { from: 0, to: 30, type: "bull" },
    { from: 30, to: 52, type: "bear" },
    { from: 52, to: 78, type: "bull" },
    { from: 78, to: 100, type: "bear" }
  ];
  let value = 100;

  for (let i = 0; i <= 100; i += 1) {
    const phase = phases.find((p) => i >= p.from && i <= p.to) || phases[0];
    const local = (i - phase.from) / (phase.to - phase.from);
    const drift = phase.type === "bull" ? 1.5 : -1.4;
    const wave = Math.sin(i / 3) * 0.6;
    value += drift + wave;
    points.push({ index: i, value, phase: phase.type });
  }

  return { points, phases };
}

function renderCycleChart() {
  const svg = document.querySelector("#cycleChart");
  if (!svg) return;
  svg.innerHTML = "";

  const width = 720;
  const height = 300;
  const left = 48;
  const right = 18;
  const top = 20;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const { points, phases } = buildCycleData();

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.14;
  const y = (value) => top + ((max + padding - value) / (max - min + padding * 2)) * plotHeight;
  const x = (index) => left + (index / 100) * plotWidth;

  phases.forEach((phase) => {
    const zone = createSvg("rect", {
      x: x(phase.from),
      y: top,
      width: x(phase.to) - x(phase.from),
      height: plotHeight,
      fill: phase.type === "bull" ? "rgba(22,133,107,0.08)" : "rgba(200,74,74,0.07)"
    });
    const label = createSvg("text", {
      x: x(phase.from) + (x(phase.to) - x(phase.from)) / 2,
      y: top - 6,
      "text-anchor": "middle",
      class: "chart-legend",
      fill: phase.type === "bull" ? "#16856b" : "#c84a4a"
    });
    label.textContent = phase.type === "bull" ? "牛市" : "熊市";
    svg.appendChild(zone);
    svg.appendChild(label);
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.index)} ${y(point.value)}`).join(" ");
  const line = createSvg("path", { d: linePath, class: "chart-line", stroke: "#20242c" });
  svg.appendChild(line);

  const markerX = x(50);
  const marker = createSvg("line", { id: "cycleMarker", x1: markerX, x2: markerX, y1: top, y2: height - bottom, stroke: "#d9792b", "stroke-width": 3, "stroke-dasharray": "4 4" });
  svg.appendChild(marker);

  const lastLabel = createSvg("text", { x: left + 4, y: top + 2, class: "chart-legend" });
  lastLabel.textContent = "长期指数走势";
  svg.appendChild(lastLabel);
}

function updateCycleScrub(value) {
  const { points } = buildCycleData();
  const current = points[Number(value)] || points[0];
  const marker = document.querySelector("#cycleMarker");
  const phasePill = document.querySelector("#cyclePhase");
  const phaseText = document.querySelector("#cyclePhaseText");

  if (marker) {
    const left = 48;
    const right = 18;
    const plotWidth = 720 - left - right;
    const x = left + (Number(value) / 100) * plotWidth;
    marker.setAttribute("x1", x);
    marker.setAttribute("x2", x);
  }

  if (current.phase === "bull") {
    phasePill.textContent = "牛市";
    phasePill.className = "phase-pill bull";
    phaseText.textContent = "市场正在向上，情绪偏乐观，但要留意过热。";
  } else {
    phasePill.textContent = "熊市";
    phasePill.className = "phase-pill bear";
    phaseText.textContent = "市场正在向下，情绪偏恐慌，但熊市也会结束。";
  }
}

function setupCycle() {
  const scrub = document.querySelector("#cycleScrub");
  scrub.addEventListener("input", () => updateCycleScrub(scrub.value));

  const emotion = document.querySelector("#emotionSlider");
  const fill = document.querySelector("#emotionFill");
  const text = document.querySelector("#emotionText");
  const emotionCopy = {
    0: "极度恐惧时，往往也是机会开始出现的时候。",
    25: "偏谨慎：先理解，再决定。",
    50: "保持中性，既不恐慌也不追高，是更稳的状态。",
    75: "偏乐观：留意自己是否在盲目追涨。",
    100: "极度贪婪时，风险通常也在悄悄积累。"
  };

  emotion.addEventListener("input", () => {
    const value = Number(emotion.value);
    fill.style.width = `${value}%`;
    const key = value <= 12 ? 0 : value <= 37 ? 25 : value <= 62 ? 50 : value <= 87 ? 75 : 100;
    text.textContent = emotionCopy[key];
  });

  emotion.dispatchEvent(new Event("input"));

  document.querySelectorAll("[data-cycle-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#cycleScenarioFeedback");
      const scenario = cycleScenarios[cycleScenarioIndex];
      const isCorrect = button.dataset.cycleAnswer === scenario.answer;
      feedback.textContent = isCorrect ? "正确，你开始有市场感觉了。" : "再想想：关键看整体趋势和情绪。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) {
        launchConfetti(45);
        setTimeout(() => {
          cycleScenarioIndex = (cycleScenarioIndex + 1) % cycleScenarios.length;
          const next = cycleScenarios[cycleScenarioIndex];
          document.querySelector("#cycleScenarioText").textContent = next.text;
          feedback.textContent = "换一个场景试试。";
          feedback.className = "challenge-feedback";
        }, 900);
      }
    });
  });
}

/* ---------- basic assets ---------- */

function setupAssets() {
  const assetData = {
    bond: {
      name: "国债",
      risk: "风险 低",
      desc: "国债是国家发行的借条，通常被认为风险较低，但收益也相对有限。"
    },
    fund: {
      name: "基金",
      risk: "风险 中",
      desc: "基金把钱交给专业机构，投资一篮子资产。风险和收益取决于里面装了什么。"
    },
    stock: {
      name: "股票",
      risk: "风险 高",
      desc: "股票代表你拥有公司的一部分。公司表现好，收益可能更高；表现差，亏损也可能更大。"
    },
    index: {
      name: "指数",
      risk: "风险 中高",
      desc: "指数是很多股票的平均表现，比单只股票更分散，但仍会跟随市场波动。"
    }
  };

  document.querySelectorAll("[data-asset]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-asset]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const data = assetData[button.dataset.asset];
      document.querySelector("#assetName").textContent = data.name;
      document.querySelector("#assetRisk").textContent = data.risk;
      document.querySelector("#assetDesc").textContent = data.desc;
    });
  });

  document.querySelectorAll("[data-asset-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#assetFeedback");
      const isCorrect = button.dataset.assetAnswer === "stock";
      feedback.textContent = isCorrect
        ? "正确，单只股票的风险通常高于国债、基金和指数。"
        : "再想想：单只股票集中度最高，通常波动也最大。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) launchConfetti(45);
    });
  });
}

/* ---------- short selling ---------- */

function setupShort() {
  const slider = document.querySelector("#shortBuyback");
  const marker = document.querySelector("#shortMarker");

  function update() {
    const sellPrice = 100;
    const buyback = Number(slider.value);
    const profit = sellPrice - buyback;
    const valueNode = document.querySelector("#shortBuybackValue");
    const profitNode = document.querySelector("#shortProfit");
    const statusNode = document.querySelector("#shortStatus");
    const result = document.querySelector(".short-result");

    valueNode.textContent = `${buyback} 元`;
    profitNode.textContent = `${profit > 0 ? "+" : ""}${profit} 元`;

    result.classList.remove("positive", "negative");
    if (profit > 0) {
      result.classList.add("positive");
      statusNode.textContent = "价格低于卖出价，你赚了。";
    } else if (profit < 0) {
      result.classList.add("negative");
      statusNode.textContent = "价格高于卖出价，你在亏损。";
    } else {
      statusNode.textContent = "刚好打平。";
    }

    const y = 20 + ((160 - buyback) / 120) * 300;
    marker.setAttribute("y1", y);
    marker.setAttribute("y2", y);
  }

  slider.addEventListener("input", update);
  update();
}

/* ---------- quant backtest ---------- */

let quantSeries = [];
let quantStrategy = "dca";

function generateMarketSeries() {
  const random = mulberry32(48);
  const series = [];
  let price = 100;

  for (let i = 0; i < 120; i += 1) {
    const cycle = Math.sin(i / 10) * 0.7 + Math.sin(i / 27) * 0.45;
    const noise = (random() * 2 - 1) * 0.9;
    const monthlyReturn = 0.35 + cycle + noise;
    price = Math.max(10, price * (1 + monthlyReturn / 100));
    series.push(price);
  }

  quantSeries = series;
}

function runBacktest(strategy) {
  const monthlyAmount = 1000;
  const initialCapital = 100000;
  const equity = [];
  let cash = initialCapital;
  let shares = 0;
  let invested = initialCapital;

  if (strategy === "dca") {
    cash = 0;
    shares = 0;
    invested = 0;
    quantSeries.forEach((price) => {
      invested += monthlyAmount;
      shares += monthlyAmount / price;
      equity.push(shares * price);
    });
  } else if (strategy === "momentum") {
    quantSeries.forEach((price, index) => {
      const previous = index > 0 ? quantSeries[index - 1] : price;
      if (price > previous && cash > 0) {
        shares = cash / price;
        cash = 0;
      } else if (price < previous && shares > 0) {
        cash = shares * price;
        shares = 0;
      }
      equity.push(cash + shares * price);
    });
  } else if (strategy === "ma") {
    const period = 12;
    quantSeries.forEach((price, index) => {
      const start = Math.max(0, index - period + 1);
      const window = quantSeries.slice(start, index + 1);
      const average = window.reduce((sum, value) => sum + value, 0) / window.length;
      if (price > average && cash > 0) {
        shares = cash / price;
        cash = 0;
      } else if (price < average && shares > 0) {
        cash = shares * price;
        shares = 0;
      }
      equity.push(cash + shares * price);
    });
  }

  const final = equity[equity.length - 1];
  const returnRate = ((final - invested) / invested) * 100;

  let peak = equity[0];
  let maxDrawdown = 0;
  equity.forEach((value) => {
    peak = Math.max(peak, value);
    maxDrawdown = Math.max(maxDrawdown, (peak - value) / peak);
  });

  return {
    equity,
    final,
    invested,
    returnRate,
    maxDrawdown: maxDrawdown * 100
  };
}

function renderQuantChart(result) {
  const svg = document.querySelector("#quantChart");
  if (!svg) return;
  svg.innerHTML = "";

  const width = 720;
  const height = 320;
  const left = 50;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const allValues = [...quantSeries, ...result.equity];
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const padding = (max - min) * 0.1 || 1;
  const y = (value) => top + ((max + padding - value) / (max - min + padding * 2)) * plotHeight;
  const x = (index) => left + (index / (quantSeries.length - 1)) * plotWidth;

  for (let i = 0; i <= 4; i += 1) {
    const value = min + ((max - min) / 4) * i;
    const yPos = y(value);
    const grid = createSvg("line", { x1: left, x2: width - right, y1: yPos, y2: yPos, class: "grid-line" });
    const label = createSvg("text", { x: left - 8, y: yPos + 4, "text-anchor": "end", class: "axis-label" });
    label.textContent = Math.round(value).toLocaleString("zh-CN");
    svg.appendChild(grid);
    svg.appendChild(label);
  }

  const marketPath = quantSeries.map((value, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(value)}`).join(" ");
  const marketLine = createSvg("path", { d: marketPath, class: "chart-line", stroke: "#c9c1b3", "stroke-dasharray": "5 5", "stroke-width": "2" });
  svg.appendChild(marketLine);

  const strategyPath = result.equity.map((value, index) => `${index === 0 ? "M" : "L"}${x(index)} ${y(value)}`).join(" ");
  const areaPath = `${strategyPath} L${x(quantSeries.length - 1)} ${y(min - padding)} L${x(0)} ${y(min - padding)} Z`;
  const area = createSvg("path", { d: areaPath, fill: "#3f6fb5", class: "chart-area" });
  const strategyLine = createSvg("path", { d: strategyPath, class: "chart-line", stroke: "#3f6fb5" });
  svg.appendChild(area);
  svg.appendChild(strategyLine);

  const legendMarket = createSvg("text", { x: left + 4, y: top + 2, class: "chart-legend" });
  legendMarket.textContent = "市场走势";
  const legendStrategy = createSvg("text", { x: left + 110, y: top + 2, class: "chart-legend", fill: "#3f6fb5" });
  legendStrategy.textContent = "策略资产";
  svg.appendChild(legendMarket);
  svg.appendChild(legendStrategy);
}

function updateQuantStats(result) {
  animateNumber(document.querySelector("#quantFinal"), result.final, formatMoney);
  animateNumber(document.querySelector("#quantInvested"), result.invested, formatMoney);
  animateNumber(document.querySelector("#quantReturn"), result.returnRate, (v) => formatPercent(v));
  animateNumber(document.querySelector("#quantDrawdown"), result.maxDrawdown, (v) => `-${v.toFixed(1)}%`);
}

function renderQuant() {
  const result = runBacktest(quantStrategy);
  renderQuantChart(result);
  updateQuantStats(result);
}

function setupQuant() {
  document.querySelectorAll("[data-strategy]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-strategy]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      quantStrategy = button.dataset.strategy;
      renderQuant();
    });
  });

  document.querySelector("#quantRegenerate").addEventListener("click", () => {
    generateMarketSeries();
    renderQuant();
  });
}

/* ---------- fundamental ---------- */

function setupFundamental() {
  const epsInput = document.querySelector("#fundEps");
  const priceInput = document.querySelector("#fundPrice");
  const peOutput = document.querySelector("#fundPE");
  const hint = document.querySelector("#fundPEHint");

  function update() {
    const eps = Math.max(0.1, Number(epsInput.value) || 0.1);
    const price = Math.max(1, Number(priceInput.value) || 1);
    const pe = price / eps;
    peOutput.textContent = `约 ${Math.round(pe)} 年回本`;
    hint.textContent = `如果公司每年每股赚 ${eps} 元，股价 ${price} 元，那么大约需要 ${Math.round(pe)} 年把你付的钱赚回来。`;
  }

  epsInput.addEventListener("input", update);
  priceInput.addEventListener("input", update);
  update();
}

/* ---------- technical ---------- */

const technicalTrends = {
  up: {
    label: "上涨趋势",
    path: "M50 250 C150 230 180 200 260 190 S430 120 500 90 S650 50 680 40",
    hint: "上涨像上坡：价格整体越来越高。"
  },
  down: {
    label: "下跌趋势",
    path: "M50 50 C150 70 180 100 260 110 S430 180 500 210 S650 250 680 260",
    hint: "下跌像下坡：价格整体越来越低。"
  },
  side: {
    label: "横盘震荡",
    path: "M50 150 C120 135 170 165 240 150 S380 135 450 150 S600 165 680 150",
    hint: "横盘像在平地来回走：价格没有明显方向。"
  }
};

function renderTechnicalChart(trendName) {
  const svg = document.querySelector("#technicalChart");
  if (!svg) return;
  svg.innerHTML = "";

  const trend = technicalTrends[trendName];
  renderTechnicalCandles(svg, trendName);
  svg.appendChild(createSvg("path", { d: trend.path, class: "chart-line", stroke: "#3f6fb5", "stroke-width": "4" }));
  const label = createSvg("text", { x: 40, y: 28, class: "chart-legend", fill: "#3f6fb5" });
  label.textContent = trend.label;
  svg.appendChild(label);
}

function renderTechnicalCandles(svg, trendName) {
  const seedMap = { up: 21, down: 22, side: 23 };
  const random = mulberry32(seedMap[trendName]);

  for (let index = 0; index < 11; index += 1) {
    const x = 55 + index * 56;
    let mid;
    if (trendName === "up") {
      mid = 238 - index * 17 + (random() * 2 - 1) * 8;
    } else if (trendName === "down") {
      mid = 52 + index * 17 + (random() * 2 - 1) * 8;
    } else {
      mid = 150 + (random() * 2 - 1) * 34;
    }

    const bodyHeight = 25 + random() * 24;
    const wickTop = mid - bodyHeight / 2 - random() * 12;
    const wickBottom = mid + bodyHeight / 2 + random() * 12;
    const up = trendName === "down" ? random() > 0.75 : random() > 0.28;
    const bodyY = mid - bodyHeight / 2;
    const group = createSvg("g", { class: `tech-bg-candle ${up ? "up" : "down"}` });
    group.appendChild(createSvg("line", { x1: x, x2: x, y1: wickTop, y2: wickBottom, class: "tech-bg-wick" }));
    group.appendChild(createSvg("rect", { x: x - 8, y: bodyY, width: 16, height: bodyHeight, rx: 2, class: "tech-bg-body" }));
    svg.appendChild(group);
  }
}

function setupTechnical() {
  document.querySelectorAll("[data-trend]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-trend]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const trend = technicalTrends[button.dataset.trend];
      document.querySelector("#technicalReadout").textContent = trend.label;
      document.querySelector("#technicalHint").textContent = trend.hint;
      renderTechnicalChart(button.dataset.trend);
    });
  });
  renderTechnicalChart("up");
}

/* ---------- rules & fees ---------- */

function setupRules() {
  const amountInput = document.querySelector("#tradeAmount");
  const feeRateInput = document.querySelector("#tradeFeeRate");
  const totalOutput = document.querySelector("#tradeTotal");
  const hint = document.querySelector("#tradeFee");

  function update() {
    const amount = Math.max(0, Number(amountInput.value) || 0);
    const feeRate = Math.max(0, Number(feeRateInput.value) || 0);
    const commission = amount * (feeRate / 100);
    const stamp = amount * 0.001;
    const total = commission + stamp;
    totalOutput.textContent = `总成本 ${total.toFixed(2)} 元`;
    hint.textContent = `手续费约 ${commission.toFixed(2)} 元，加上印花税 ${stamp.toFixed(2)} 元，成本会被放大。`;
  }

  amountInput.addEventListener("input", update);
  feeRateInput.addEventListener("input", update);
  update();
}

/* ---------- tools ---------- */

function setupTools() {
  const slider = document.querySelector("#dividendAmount");
  const note = document.querySelector("#dividendNote");
  const hint = document.querySelector("#dividendHint");

  function update() {
    const dividend = Number(slider.value);
    note.textContent = `分红 ${dividend} 元`;
    hint.textContent = `如果股价 20 元，每股分红 ${dividend} 元，除息后参考价会向下调整约 ${dividend} 元。`;
  }

  slider.addEventListener("input", update);
  update();

  const ipoButton = document.querySelector("#ipoDraw");
  const ipoResult = document.querySelector("#ipoResult");
  const ipoOutcomes = [
    { text: "中签了，但上市首日破发，亏损 8%。", type: "loss" },
    { text: "中签了，上市首日上涨 25%。", type: "win" },
    { text: "没有中签，这是打新的常态。", type: "" },
    { text: "中签了，上市首日小幅上涨 3%。", type: "win" },
    { text: "中签了，但上市首日跌破发行价，亏损 12%。", type: "loss" }
  ];

  ipoButton.addEventListener("click", () => {
    const outcome = ipoOutcomes[Math.floor(Math.random() * ipoOutcomes.length)];
    ipoResult.textContent = outcome.text;
    ipoResult.className = `tool-result ${outcome.type}`;
  });

  const convertStock = document.querySelector("#convertStock");
  const convertStockValue = document.querySelector("#convertStockValue");
  const convertibleNote = document.querySelector("#convertibleNote");
  const convertibleHint = document.querySelector("#convertibleHint");
  const convertibleResult = document.querySelector("#convertibleResult");
  const conversionPrice = 10;

  function updateConvertible() {
    const stockPrice = Number(convertStock.value);
    const conversionValue = stockPrice * 10;
    convertStockValue.textContent = `${stockPrice} 元`;
    convertibleNote.textContent = `换成股票：约 ${Math.round(conversionValue)} 元`;
    if (stockPrice > conversionPrice) {
      convertibleResult.textContent = `股票涨了，换成股票更划算，价值约 ${Math.round(conversionValue)} 元。`;
      convertibleResult.className = "tool-result win";
    } else if (stockPrice < conversionPrice) {
      convertibleResult.textContent = `股票跌了，继续拿借条更稳，因为换成股票只值约 ${Math.round(conversionValue)} 元。`;
      convertibleResult.className = "tool-result";
    } else {
      convertibleResult.textContent = "股票价格刚好等于约定价格，换不换都差不多。";
      convertibleResult.className = "tool-result";
    }
    convertibleHint.textContent = "把可转债想成一张兑换券：公司答应你，以后可以用 10 元换 1 股，一共能换 10 股。股票越贵，兑换券越值钱；股票便宜时，继续当借条更稳。";
  }

  convertStock.addEventListener("input", updateConvertible);
  updateConvertible();
}

/* ---------- risk ---------- */

function setupRisk() {
  const capitalInput = document.querySelector("#riskCapital");
  const positionInput = document.querySelector("#riskPosition");
  const stopInput = document.querySelector("#riskStop");
  const stopValue = document.querySelector("#riskStopValue");
  const maxLoss = document.querySelector("#riskMaxLoss");
  const hint = document.querySelector("#riskHint");

  function update() {
    const capital = Math.max(0, Number(capitalInput.value) || 0);
    const position = Math.max(0, Math.min(100, Number(positionInput.value) || 0));
    const stop = Number(stopInput.value);
    const loss = capital * (position / 100) * (stop / 100);
    stopValue.textContent = `${stop}%`;
    maxLoss.textContent = `最大亏损 ${Math.round(loss).toLocaleString("zh-CN")} 元`;
    hint.textContent = `这笔交易如果触发止损，你会损失约 ${Math.round(loss).toLocaleString("zh-CN")} 元。`;
  }

  capitalInput.addEventListener("input", update);
  positionInput.addEventListener("input", update);
  stopInput.addEventListener("input", update);
  update();
}

/* ---------- scam & mindset ---------- */

function setupScam() {
  document.querySelectorAll(".myth-card").forEach((card) => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
  });
}

function setupMindset() {
  const capitalInput = document.querySelector("#tradeCapital");
  const priceInput = document.querySelector("#tradePrice");
  const sharesOutput = document.querySelector("#tradeShares");
  const hint = document.querySelector("#tradeHint");

  function update() {
    const capital = Math.max(0, Number(capitalInput.value) || 0);
    const price = Math.max(1, Number(priceInput.value) || 1);
    const shares = Math.floor(capital / price / 100) * 100;
    const hands = shares / 100;
    sharesOutput.textContent = `可买 ${shares} 股`;
    hint.textContent = `按 A股 100 股为 1 手计算，你大约可以买入 ${hands} 手。`;
  }

  capitalInput.addEventListener("input", update);
  priceInput.addEventListener("input", update);
  update();

  document.querySelectorAll("[data-mindset-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.querySelector("#mindsetFeedback");
      const isCorrect = button.dataset.mindsetAnswer === "plan";
      feedback.textContent = isCorrect
        ? "正确，先回到自己的计划，而不是被情绪带着走。"
        : "再想想：冲动操作和借钱加仓，常常会让问题更大。";
      feedback.className = `challenge-feedback ${isCorrect ? "correct" : "wrong"}`;
      if (isCorrect) launchConfetti(45);
    });
  });
}

/* ---------- quiz ---------- */

const quizQuestions = [
  {
    question: "买股票，本质上是在做什么？",
    options: ["借钱给公司", "成为公司股东", "购买公司的产品"],
    answer: 1
  },
  {
    question: "想买的人远多于想卖的人，价格通常会怎样？",
    options: ["上涨", "下跌", "保持不变"],
    answer: 0
  },
  {
    question: "绿色 K 线通常代表什么？",
    options: ["收盘价高于开盘价", "收盘价低于开盘价", "最高价高于最低价"],
    answer: 0
  },
  {
    question: "“指数”最像下面哪个概念？",
    options: ["一只股票", "一篮子股票", "一张债券"],
    answer: 1
  },
  {
    question: "牛市通常指什么？",
    options: ["市场持续下跌", "价格长期在一个小区间波动", "市场整体持续上涨"],
    answer: 2
  },
  {
    question: "做空的基本顺序是？",
    options: ["先买后卖", "先借后卖，再买回来还", "只买不卖"],
    answer: 1
  },
  {
    question: "量化交易的核心是？",
    options: ["靠运气操作", "把规则写成程序并回测", "只做高频交易"],
    answer: 1
  },
  {
    question: "想知道买一家公司多少年能回本，可以怎么算？",
    options: ["股价 / 每年每股收益", "每年每股收益 / 股价", "收入 / 成本"],
    answer: 0
  },
  {
    question: "A股股票通常采用的交易制度是？",
    options: ["T+0", "T+1", "T+2"],
    answer: 1
  },
  {
    question: "《安全边际》强调的价值投资第一原则是？",
    options: ["追涨杀跌", "安全边际", "高频交易"],
    answer: 1
  }
];

let quizIndex = 0;
let quizScore = 0;

function renderQuiz() {
  const body = document.querySelector("#quizBody");
  const actions = document.querySelector("#quizActions");
  const result = document.querySelector("#quizResult");
  result.innerHTML = "";
  actions.innerHTML = "";

  if (quizIndex >= quizQuestions.length) {
    body.innerHTML = "";
    const scoreText = `你答对了 ${quizScore} / ${quizQuestions.length}`;
    result.innerHTML = `
      <p class="kicker">测验完成</p>
      <h2>${scoreText}</h2>
      <p>${quizScore >= 4 ? "你已经建立了第一层市场直觉。" : "再回去看看课程，会更有感觉。"}</p>
    `;
    actions.innerHTML = `<button class="secondary-button" id="quizRestart" type="button">再测一次</button>`;
    document.querySelector("#quizRestart").addEventListener("click", () => {
      quizIndex = 0;
      quizScore = 0;
      renderQuiz();
    });
    if (quizScore >= 4) launchConfetti(140);
    return;
  }

  const question = quizQuestions[quizIndex];
  body.innerHTML = `
    <div class="quiz-question">
      <p class="kicker">第 ${quizIndex + 1} 题 / 共 ${quizQuestions.length} 题</p>
      <h2>${question.question}</h2>
    </div>
    <div class="quiz-options">
      ${question.options.map((option, index) => `<button class="quiz-option" type="button" data-option="${index}">${option}</button>`).join("")}
    </div>
  `;

  document.querySelectorAll(".quiz-option").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = Number(button.dataset.option);
      const isCorrect = selected === question.answer;
      if (isCorrect) quizScore += 1;

      document.querySelectorAll(".quiz-option").forEach((option, index) => {
        option.disabled = true;
        if (index === question.answer) option.classList.add("correct");
        if (index === selected && !isCorrect) option.classList.add("wrong");
      });

      actions.innerHTML = `<button class="primary-button" id="quizNext" type="button">下一题 <svg class="icon" aria-hidden="true"><use href="#icon-arrow"></use></svg></button>`;
      document.querySelector("#quizNext").addEventListener("click", () => {
        quizIndex += 1;
        renderQuiz();
      });
    });
  });
}

function setupQuiz() {
  renderQuiz();
}

/* ---------- init ---------- */

function init() {
  setupTicker();
  renderProgress(loadVisited());

  setupStock();
  setupPrice();

  renderKlineChart();
  setupKline();

  setupIndex();

  renderCycleChart();
  updateCycleScrub(50);
  setupCycle();

  setupAssets();

  setupShort();

  generateMarketSeries();
  renderQuant();
  setupQuant();

  setupFundamental();
  setupTechnical();
  setupRules();
  setupTools();
  setupRisk();
  setupScam();
  setupMindset();

  setupQuiz();
}

init();
