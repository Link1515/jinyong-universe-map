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
  selectedRelationshipId: ""
};

const characterMap = new Map(universe.characters.map((character) => [character.id, character]));
const relationshipMap = new Map(universe.relationships.map((relationship) => [relationship.id, relationship]));
const novelMap = new Map(novels.map((novel) => [novel.id, novel]));

app.innerHTML = `
  <div class="layout">
    <aside class="sidebar controls">
      <section class="panel hero-panel">
        <p class="eyebrow">Jin Yong Universe Map</p>
        <h1>金庸人物宇宙圖譜</h1>
        <p class="hero-copy">以作品、人物與關係為索引，先完成可探索的 MVP，再逐步擴充完整人物網路。</p>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <h2>作品切換</h2>
          <span id="novel-count"></span>
        </div>
        <div id="novel-tabs" class="novel-tabs"></div>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <h2>人物搜尋</h2>
        </div>
        <label class="search-field">
          <span>輸入姓名、稱號或門派</span>
          <input id="search-input" type="search" placeholder="例如：郭靖、明教、神鵰大俠" />
        </label>
        <div id="search-results" class="search-results"></div>
      </section>
      <section class="panel">
        <div class="panel-heading">
          <h2>關係篩選</h2>
          <button id="reset-filters" class="ghost-button" type="button">顯示全部</button>
        </div>
        <div id="type-filters" class="type-filters"></div>
      </section>
      <section class="panel legend-panel">
        <div class="panel-heading">
          <h2>圖例</h2>
        </div>
        <div id="legend" class="legend"></div>
      </section>
    </aside>
    <main class="workspace">
      <section class="panel graph-panel">
        <div class="panel-heading">
          <div>
            <p id="graph-title" class="eyebrow"></p>
            <h2>人物關聯圖</h2>
          </div>
          <p class="graph-hint">拖曳節點、滑鼠滾輪縮放、拖動畫布平移</p>
        </div>
        <div id="graph-root" class="graph-root"></div>
      </section>
    </main>
    <aside class="sidebar detail-sidebar">
      <section class="panel detail-panel">
        <div class="panel-heading">
          <h2>詳細資訊</h2>
        </div>
        <div id="detail-content" class="detail-content"></div>
      </section>
    </aside>
  </div>
`;

const novelTabs = document.querySelector("#novel-tabs");
const novelCount = document.querySelector("#novel-count");
const typeFilters = document.querySelector("#type-filters");
const legend = document.querySelector("#legend");
const searchInput = /** @type {HTMLInputElement | null} */ (document.querySelector("#search-input"));
const searchResults = document.querySelector("#search-results");
const detailContent = document.querySelector("#detail-content");
const graphTitle = document.querySelector("#graph-title");
const graphRoot = document.querySelector("#graph-root");
const resetFiltersButton = document.querySelector("#reset-filters");

if (
  !novelTabs ||
  !novelCount ||
  !typeFilters ||
  !legend ||
  !searchInput ||
  !searchResults ||
  !detailContent ||
  !graphTitle ||
  !graphRoot ||
  !resetFiltersButton
) {
  throw new Error("UI mount failed.");
}

const graphView = createGraphView(graphRoot, {
  onNodeSelect(nodeId) {
    state.selectedCharacterId = nodeId;
    state.selectedRelationshipId = "";
    renderDetails();
  },
  onEdgeSelect(edgeId) {
    state.selectedRelationshipId = edgeId;
    state.selectedCharacterId = "";
    renderDetails();
  }
});

function renderNovelTabs() {
  novelTabs.replaceChildren();
  novelCount.textContent = `${novels.length} 部作品`;

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
      searchInput.value = "";
      state.selectedCharacterId = "";
      state.selectedRelationshipId = "";
      syncGraph();
      renderSearchResults();
      renderDetails();
      renderNovelTabs();
    });
    novelTabs.append(button);
  });
}

function renderTypeFilters() {
  typeFilters.replaceChildren();

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
      renderTypeFilters();
      renderDetails();
    });
    typeFilters.append(button);
  });
}

function renderLegend() {
  legend.replaceChildren();

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

function renderSearchResults() {
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
      graphView.highlightNode(character.id);
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
      graphView.highlightNode(nextCharacterId || null);
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

searchInput.addEventListener("input", () => {
  state.searchQuery = searchInput.value;
  renderSearchResults();
});

resetFiltersButton.addEventListener("click", () => {
  state.activeTypeIds = [];
  syncGraph();
  renderTypeFilters();
  renderDetails();
});

renderNovelTabs();
renderTypeFilters();
renderLegend();
syncGraph();
renderSearchResults();
renderDetails();
