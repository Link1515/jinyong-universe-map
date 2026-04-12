<script setup lang="ts">
import type { Novel } from "../types";

defineProps<{
  novels: Novel[];
  selectedNovelId: string;
}>();

const emit = defineEmits<{
  selectNovel: [novelId: string];
}>();
</script>

<template>
  <section class="menu-section">
    <div class="panel-heading">
      <div>
        <p class="eyebrow">作品切換</p>
        <h2>選擇圖譜</h2>
      </div>
      <span class="menu-meta">{{ novels.length }} 部作品</span>
    </div>
    <div class="novel-tabs">
      <button
        v-for="novel in novels"
        :key="novel.id"
        type="button"
        class="novel-tab"
        :class="{ 'is-active': novel.id === selectedNovelId }"
        @click="emit('selectNovel', novel.id)"
      >
        {{ novel.name }}
      </button>
    </div>
  </section>
</template>
