import { createGraphView } from "./components/graphView.js";
import { novels } from "./data/novels.js";
import { relationshipTypes } from "./data/relationshipTypes.js";
import { universe } from "./data/universe.js";
import { getRelationshipType, getVisibleGraph, searchCharacters } from "./utils/graphData.js";

const app = document.querySelector("#app");

if (!app) {
  throw new Error("Missing app root.");
}

const state = {
  selectedNovelId: novels[0].id,
  activeTypeIds: [],
  searchQuery: "",
  selectedCharacterId: "",
  selectedRelationshipId: "",
  activeMenu: "",
  detailOpen: false
};

const characterMap = new Map(universe.characters.map((character) => [character.id, character]));
const relationshipMap = new Map(universe.relationships.map((relationship) => [relationship.id, relationship]));
const novelMap = new Map(novels.map((novel) => [novel.id, novel]));

app.innerHTML = `
  <main class="workspace-canvas">
    <div id="graph-root" class="graph-root"></div>
    <header class="panel overlay-panel overlay-panel-status">
      <div class="status-head">
        <div>
          <p class="eyebrow">Jin Yong Universe Map</p>
          <h1>金庸人物宇宙圖譜</h1>
        </div>
        <p id="graph-title" class="graph-title"></p>
      </div>
      <p class="graph-hint">拖曳節點、滾輪縮放、拖動畫布平移。左側工具列按需打開選單。</p>
    </header>
    <section class="overlay-panel overlay-panel-tools">
      <div id="tool-dock" class="panel tool-dock"></div>
      <div id="menu-panel" class="panel menu-panel" hidden></div>
    </section>
    <aside id="detail-drawer" class="overlay-panel overlay-panel-detail is-collapsed">
      <button id="detail-toggle" class="panel detail-handle" type="button" aria-expanded="false">
        <span>詳細資訊</span>
      </button>
      <section class="panel detail-drawer-panel">
        <div class="panel-heading">
          <h2>詳細資訊</h2>
          <button id="detail-close" class="ghost-button" type="button">收起</button>
        </div>
        <div id="detail-content" class="detail-content"></div>
      </section>
    </aside>
  </main>
`;

const toolDock = document.querySelector("#tool-dock");
const menuPanel = document.querySelector("#menu-panel");
const detailDrawer = document.querySelector("#detail-drawer");
const detailToggle = document.querySelector("#detail-toggle");
const detailClose = document.querySelector("#detail-close");
const detailContent = document.querySelector("#detail-content");
const graphTitle = document.querySelector("#graph-title");
const graphRoot = document.querySelector("#graph-root");

if (
  !toolDock ||
  !menuPanel ||
  !detailDrawer ||
  !detailToggle ||
  !detailClose ||
  !detailContent ||
  !graphTitle ||
  !graphRoot
) {
  throw new Error("UI mount failed.");
}

const graphView = createGraphView(graphRoot, {
  onNodeSelect(nodeId) {
    state.selectedCharacterId = nodeId;
    state.selectedRelationshipId = "";
    state.activeMenu = "";
    state.detailOpen = Boolean(nodeId);
    renderToolDock();
    renderMenuPanel();
    renderDetailDrawer();
    renderDetails();
  },
  onEdgeSelect(edgeId) {
    state.selectedRelationshipId = edgeId;
    state.selectedCharacterId = "";
    state.activeMenu = "";
    state.detailOpen = Boolean(edgeId);
    renderToolDock();
    renderMenuPanel();
    renderDetailDrawer();
    renderDetails();
  }
});

function renderToolDock() {
  const activeFilterCount = state.activeTypeIds.length;
  toolDock.innerHTML = `
    <button type="button" class="tool-button ${state.activeMenu === "novels" ? "is-active" : ""}" data-menu="novels">
      <span>作品</span>
      <strong>${novelMap.get(state.selectedNovelId)?.name ?? ""}</strong>
    </button>
    <button type="button" class="tool-button ${state.activeMenu === "search" ? "is-active" : ""}" data-menu="search">
      <span>搜尋</span>
      <strong>${state.searchQuery.trim() ? "定位人物" : "打開搜尋"}</strong>
    </button>
    <button type="button" class="tool-button ${state.activeMenu === "filters" ? "is-active" : ""}" data-menu="filters">
      <span>篩選</span>
      <strong>${activeFilterCount > 0 ? `${activeFilterCount} 項啟用` : "全部關係"}</strong>
    </button>
    <button type="button" class="tool-button ${state.activeMenu === "legend" ? "is-active" : ""}" data-menu="legend">
      <span>圖例</span>
      <strong>關係樣式</strong>
    </button>
  `;

  toolDock.querySelectorAll("[data-menu]").forEach((element) => {
    element.addEventListener("click", () => {
      const button = /** @type {HTMLButtonElement} */ (element);
      const nextMenu = button.dataset.menu ?? "";
      state.activeMenu = state.activeMenu === nextMenu ? "" : nextMenu;
      renderToolDock();
      renderMenuPanel();
    });
  });
}

function renderMenuPanel() {
  if (!state.activeMenu) {
    menuPanel.hidden = true;
    menuPanel.innerHTML = "";
    return;
  }

  menuPanel.hidden = false;

  if (state.activeMenu === "novels") {
    menuPanel.innerHTML = `
      <section class="menu-section">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">作品切換</p>
            <h2>選擇圖譜</h2>
          </div>
          <span class="menu-meta">${novels.length} 部作品</span>
        </div>
        <div id="novel-tabs" class="novel-tabs"></div>
      </section>
    `;

    const novelTabs = menuPanel.querySelector("#novel-tabs");
    if (!novelTabs) return;

    novels.forEach((novel) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "novel-tab";
      if (novel.id === state.selectedNovelId) {
        button.classList.add("is-active");
      }
      button.textContent = novel.name;
      button.addEventListener("click", () => {
        state.selectedNovelId = novel.id;
        state.searchQuery = "";
        state.selectedCharacterId = "";
        state.selectedRelationshipId = "";
        state.activeMenu = "";
        syncGraph();
        renderToolDock();
        renderMenuPanel();
        renderDetails();
      });
      novelTabs.append(button);
    });
    return;
  }

  if (state.activeMenu === "search") {
    menuPanel.innerHTML = `
      <section class="menu-section">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">人物搜尋</p>
            <h2>定位角色</h2>
          </div>
        </div>
        <label class="search-field">
          <span>輸入姓名、稱號或門派</span>
          <input id="search-input" type="search" placeholder="例如：郭靖、明教、神鵰大俠" value="${escapeAttribute(
            state.searchQuery
          )}" />
        </label>
        <div id="search-results" class="search-results"></div>
      </section>
    `;

    const searchInput = /** @type {HTMLInputElement | null} */ (menuPanel.querySelector("#search-input"));
    const searchResults = menuPanel.querySelector("#search-results");
    if (!searchInput || !searchResults) return;

    searchInput.addEventListener("input", () => {
      state.searchQuery = searchInput.value;
      renderToolDock();
      renderSearchResults(searchResults);
    });

    queueMicrotask(() => searchInput.focus());
    renderSearchResults(searchResults);
    return;
  }

  if (state.activeMenu === "filters") {
    menuPanel.innerHTML = `
      <section class="menu-section">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">關係篩選</p>
            <h2>選擇顯示類型</h2>
          </div>
          <button id="reset-filters" class="ghost-button" type="button">顯示全部</button>
        </div>
        <div id="type-filters" class="type-filters"></div>
      </section>
    `;

    const typeFilters = menuPanel.querySelector("#type-filters");
    const resetFiltersButton = menuPanel.querySelector("#reset-filters");
    if (!typeFilters || !resetFiltersButton) return;

    relationshipTypes.forEach((type) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "type-filter";
      button.textContent = type.name;
      button.style.setProperty("--type-color", type.color);
      if (state.activeTypeIds.includes(type.id)) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        if (state.activeTypeIds.includes(type.id)) {
          state.activeTypeIds = state.activeTypeIds.filter((id) => id !== type.id);
        } else {
          state.activeTypeIds = [...state.activeTypeIds, type.id];
        }
        state.selectedRelationshipId = "";
        syncGraph();
        renderToolDock();
        renderMenuPanel();
        renderDetails();
      });
      typeFilters.append(button);
    });

    resetFiltersButton.addEventListener("click", () => {
      state.activeTypeIds = [];
      syncGraph();
      renderToolDock();
      renderMenuPanel();
      renderDetails();
    });
    return;
  }

  menuPanel.innerHTML = `
    <section class="menu-section">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">圖例</p>
          <h2>關係樣式對照</h2>
        </div>
      </div>
      <div id="legend" class="legend"></div>
    </section>
  `;

  const legend = menuPanel.querySelector("#legend");
  if (!legend) return;

  relationshipTypes.forEach((type) => {
    const row = document.createElement("div");
    row.className = "legend-row";
    row.innerHTML = `
      <span class="legend-swatch ${type.line}" style="--swatch-color:${type.color}"></span>
      <div>
        <strong>${type.name}</strong>
        <p>${type.group}</p>
      </div>
    `;
    legend.append(row);
  });
}

function renderDetailDrawer() {
  detailDrawer.classList.toggle("is-collapsed", !state.detailOpen);
  detailToggle.setAttribute("aria-expanded", state.detailOpen ? "true" : "false");
}

function getCurrentGraph() {
  return getVisibleGraph([state.selectedNovelId], state.activeTypeIds, universe.characters, universe.relationships);
}

function syncGraph() {
  const graph = getCurrentGraph();
  const novel = novelMap.get(state.selectedNovelId);
  graphTitle.textContent = novel ? `${novel.name} · ${graph.characters.length} 人 / ${graph.relationships.length} 關係` : "";
  graphView.update(graph);

  if (state.selectedCharacterId && !graph.characters.some((character) => character.id === state.selectedCharacterId)) {
    state.selectedCharacterId = "";
  }
  if (
    state.selectedRelationshipId &&
    !graph.relationships.some((relationship) => relationship.id === state.selectedRelationshipId)
  ) {
    state.selectedRelationshipId = "";
  }

  graphView.setSelection(state.selectedCharacterId || null, state.selectedRelationshipId || null);
}

function renderSearchResults(searchResults) {
  searchResults.replaceChildren();
  const graph = getCurrentGraph();
  const matches = searchCharacters(state.searchQuery, graph.characters).slice(0, 8);

  if (!state.searchQuery.trim()) {
    searchResults.innerHTML = `<p class="empty-state">搜尋會高亮人物並自動聚焦到節點。</p>`;
    graphView.highlightNode(null);
    return;
  }

  if (matches.length === 0) {
    searchResults.innerHTML = `<p class="empty-state">目前作品與篩選條件下沒有符合的人物。</p>`;
    graphView.highlightNode(null);
    return;
  }

  matches.forEach((character) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.innerHTML = `
      <strong>${character.name}</strong>
      <span>${character.title}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedCharacterId = character.id;
      state.selectedRelationshipId = "";
      state.activeMenu = "";
      state.detailOpen = true;
      graphView.highlightNode(character.id);
      renderToolDock();
      renderMenuPanel();
      renderDetailDrawer();
      renderDetails();
    });
    searchResults.append(button);
  });

  graphView.highlightNode(matches[0].id);
}

function renderCharacterDetail(character) {
  const relatedRelationships = universe.relationships.filter(
    (relationship) =>
      relationship.novels.includes(state.selectedNovelId) &&
      (relationship.source === character.id || relationship.target === character.id)
  );

  detailContent.innerHTML = `
    <article class="detail-card">
      <p class="eyebrow">人物</p>
      <h3>${character.name}</h3>
      <p class="detail-subtitle">${character.title}</p>
      <div class="detail-grid">
        <div><span>作品</span><strong>${character.novels.map((id) => novelMap.get(id)?.name ?? id).join("、")}</strong></div>
        <div><span>別名</span><strong>${character.aliases.length ? character.aliases.join("、") : "無"}</strong></div>
        <div><span>性別</span><strong>${translateGender(character.gender)}</strong></div>
        <div><span>勢力</span><strong>${character.factions.length ? character.factions.join("、") : "無"}</strong></div>
      </div>
      <p class="detail-body">${character.description}</p>
      <div class="tag-row">${character.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="relation-list">
        <h4>重要關係</h4>
        ${relatedRelationships
          .map((relationship) => {
            const peerId = relationship.source === character.id ? relationship.target : relationship.source;
            const peer = characterMap.get(peerId);
            const type = getRelationshipType(relationship.type);
            return `
              <button type="button" class="relation-item" data-character="${peerId}" data-relationship="${relationship.id}">
                <strong>${relationship.label}</strong>
                <span>${peer?.name ?? "未知人物"} · ${type?.name ?? relationship.type}</span>
              </button>
            `;
          })
          .join("")}
      </div>
    </article>
  `;

  detailContent.querySelectorAll("[data-character]").forEach((element) => {
    element.addEventListener("click", () => {
      const button = /** @type {HTMLButtonElement} */ (element);
      const nextCharacterId = button.dataset.character ?? "";
      state.selectedCharacterId = nextCharacterId;
      state.selectedRelationshipId = "";
      state.detailOpen = Boolean(nextCharacterId);
      graphView.highlightNode(nextCharacterId || null);
      renderDetailDrawer();
      renderDetails();
    });
  });
}

function renderRelationshipDetail(relationship) {
  const source = characterMap.get(relationship.source);
  const target = characterMap.get(relationship.target);
  const type = getRelationshipType(relationship.type);
  detailContent.innerHTML = `
    <article class="detail-card">
      <p class="eyebrow">關係</p>
      <h3>${relationship.label}</h3>
      <p class="detail-subtitle">${source?.name ?? relationship.source} ↔ ${target?.name ?? relationship.target}</p>
      <div class="detail-grid">
        <div><span>類型</span><strong>${type?.name ?? relationship.type}</strong></div>
        <div><span>方向性</span><strong>${relationship.directed ? "有方向" : "雙向"}</strong></div>
        <div><span>作品</span><strong>${relationship.novels.map((id) => novelMap.get(id)?.name ?? id).join("、")}</strong></div>
        <div><span>重要度</span><strong>${relationship.weight}</strong></div>
      </div>
      <p class="detail-body">${relationship.description}</p>
      ${relationship.metadata?.note ? `<p class="meta-note"><strong>備註：</strong>${relationship.metadata.note}</p>` : ""}
    </article>
  `;
}

function renderDetails() {
  if (state.selectedCharacterId) {
    const character = characterMap.get(state.selectedCharacterId);
    if (character) {
      renderCharacterDetail(character);
      graphView.setSelection(character.id, null);
      return;
    }
  }

  if (state.selectedRelationshipId) {
    const relationship = relationshipMap.get(state.selectedRelationshipId);
    if (relationship) {
      renderRelationshipDetail(relationship);
      graphView.setSelection(null, relationship.id);
      return;
    }
  }

  const novel = novelMap.get(state.selectedNovelId);
  detailContent.innerHTML = `
    <article class="detail-card">
      <p class="eyebrow">導覽</p>
      <h3>${novel?.name ?? "人物圖譜"}</h3>
      <p class="detail-body">${novel?.description ?? ""}</p>
      <ul class="guide-list">
        <li>點擊人物可查看角色資料與可跳轉的重要關係。</li>
        <li>點擊連線可查看關係類型、描述與作品歸屬。</li>
        <li>搜尋結果會自動聚焦，篩選器只保留指定關係類型。</li>
      </ul>
    </article>
  `;
  graphView.setSelection(null, null);
}

/**
 * @param {"male"|"female"|"unknown"} gender
 */
function translateGender(gender) {
  if (gender === "male") return "男";
  if (gender === "female") return "女";
  return "未標註";
}

document.addEventListener("pointerdown", (event) => {
  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (toolDock.contains(target) || menuPanel.contains(target) || detailContent.contains(target)) {
    return;
  }

  if (state.activeMenu) {
    state.activeMenu = "";
    renderToolDock();
    renderMenuPanel();
  }
});

detailToggle.addEventListener("click", () => {
  state.detailOpen = !state.detailOpen;
  renderDetailDrawer();
});

detailClose.addEventListener("click", () => {
  state.detailOpen = false;
  renderDetailDrawer();
});

renderToolDock();
renderMenuPanel();
renderDetailDrawer();
syncGraph();
renderDetails();

/**
 * @param {string} value
 */
function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}
