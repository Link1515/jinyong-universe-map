<script setup lang="ts">
import { icons as lucideIcons } from '@iconify-json/lucide'
import { Icon, addCollection } from '@iconify/vue'
import { computed } from 'vue'
import { getRelationshipType } from '../utils/graphData'
import { translateGender } from '../utils/formatters'
import type { Character, DetailSelection, Novel, Relationship, RelationshipWithType } from '../types'

addCollection(lucideIcons)

const props = defineProps<{
  detailOpen: boolean
  detail: DetailSelection
  selectedNovel: Novel | null
  selectedCharacter: Character | null
  selectedRelationship: Relationship | null
  detailCharacterRelationships: RelationshipWithType[]
  novelMap: Map<string, Novel>
  characterMap: Map<string, Character>
}>()

const emit = defineEmits<{
  toggleOpen: []
  close: []
  selectCharacter: [characterId: string]
}>()

const panelTitle = computed(() => props.selectedNovel?.name ?? '人物圖譜')
</script>

<template>
  <aside class="overlay-panel overlay-panel-detail" :class="{ 'is-collapsed': !detailOpen }">
    <button type="button" class="panel detail-handle" :aria-expanded="detailOpen" :aria-label="detailOpen ? '收起詳細資訊' : '展開詳細資訊'" @click="emit('toggleOpen')">
      <Icon :icon="detailOpen ? 'lucide:panel-right-close' : 'lucide:panel-right-open'" class="detail-handle-icon" />
    </button>
    <section class="panel detail-drawer-panel">
      <div class="panel-heading">
        <h2>詳細資訊</h2>
      </div>
      <div class="detail-content">
        <article v-if="selectedCharacter" class="detail-card">
          <p class="eyebrow">人物</p>
          <h3>{{ selectedCharacter.name }}</h3>
          <p class="detail-subtitle">{{ selectedCharacter.title }}</p>
          <div class="detail-grid">
            <div>
              <span>作品</span>
              <strong>{{ selectedCharacter.novels.map(id => novelMap.get(id)?.name ?? id).join('、') }}</strong>
            </div>
            <div>
              <span>別名</span>
              <strong>{{ selectedCharacter.aliases.length ? selectedCharacter.aliases.join('、') : '無' }}</strong>
            </div>
            <div>
              <span>性別</span>
              <strong>{{ translateGender(selectedCharacter.gender) }}</strong>
            </div>
            <div>
              <span>勢力</span>
              <strong>{{ selectedCharacter.factions.length ? selectedCharacter.factions.join('、') : '無' }}</strong>
            </div>
          </div>
          <p class="detail-body">{{ selectedCharacter.description }}</p>
          <div class="tag-row">
            <span v-for="tag in selectedCharacter.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="relation-list">
            <h4>重要關係</h4>
            <button
              v-for="relationship in detailCharacterRelationships"
              :key="relationship.id"
              type="button"
              class="relation-item"
              @click="emit('selectCharacter', relationship.source === selectedCharacter.id ? relationship.target : relationship.source)"
            >
              <strong>{{ relationship.label }}</strong>
              <span>
                {{ characterMap.get(relationship.source === selectedCharacter.id ? relationship.target : relationship.source)?.name ?? '未知人物' }}
                ·
                {{ relationship.typeConfig?.name ?? relationship.type }}
              </span>
            </button>
          </div>
        </article>

        <article v-else-if="selectedRelationship" class="detail-card">
          <p class="eyebrow">關係</p>
          <h3>{{ selectedRelationship.label }}</h3>
          <p class="detail-subtitle">
            {{ characterMap.get(selectedRelationship.source)?.name ?? selectedRelationship.source }}
            ↔
            {{ characterMap.get(selectedRelationship.target)?.name ?? selectedRelationship.target }}
          </p>
          <div class="detail-grid">
            <div>
              <span>類型</span>
              <strong>{{ getRelationshipType(selectedRelationship.type)?.name ?? selectedRelationship.type }}</strong>
            </div>
            <div>
              <span>方向性</span>
              <strong>{{ selectedRelationship.directed ? '有方向' : '雙向' }}</strong>
            </div>
            <div>
              <span>作品</span>
              <strong>{{ selectedRelationship.novels.map(id => novelMap.get(id)?.name ?? id).join('、') }}</strong>
            </div>
            <div>
              <span>重要度</span>
              <strong>{{ selectedRelationship.weight }}</strong>
            </div>
          </div>
          <p class="detail-body">{{ selectedRelationship.description }}</p>
          <p v-if="selectedRelationship.metadata?.note" class="meta-note"><strong>備註：</strong>{{ selectedRelationship.metadata.note }}</p>
        </article>

        <article v-else class="detail-card">
          <p class="eyebrow">導覽</p>
          <h3>{{ panelTitle }}</h3>
          <p class="detail-body">{{ selectedNovel?.description ?? '' }}</p>
          <ul class="guide-list">
            <li>點擊人物可查看角色資料與可跳轉的重要關係。</li>
            <li>點擊連線可查看關係類型、描述與作品歸屬。</li>
            <li>搜尋結果會自動聚焦，篩選器只保留指定關係類型。</li>
          </ul>
        </article>
      </div>
    </section>
  </aside>
</template>
