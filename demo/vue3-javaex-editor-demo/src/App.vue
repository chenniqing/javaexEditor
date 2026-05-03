<template>
  <main class="demo-shell">
    <aside class="demo-sidebar">
      <div class="demo-brand">
        <p>Vue 3 示例</p>
        <h1>javaexEditor</h1>
      </div>
      <nav class="demo-nav" aria-label="示例页面">
        <a
          v-for="page in pages"
          :key="page.key"
          :href="`#${page.key}`"
          :class="{ 'is-active': page.key === currentPage.key }"
        >
          {{ page.title }}
        </a>
      </nav>
    </aside>

    <section class="demo-main">
      <component :is="currentPage.component" :key="currentPage.key" :page="currentPage" />
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { pages } from "./pages/index.js";

const currentPageKey = ref(getHashPageKey());
const currentPage = computed(() => pages.find((page) => page.key === currentPageKey.value) || pages[0]);

onMounted(() => {
  window.addEventListener("hashchange", handleHashChange);
  if (!location.hash) {
    location.hash = "#default";
    currentPageKey.value = "default";
  } else {
    handleHashChange();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("hashchange", handleHashChange);
});

function handleHashChange() {
  currentPageKey.value = getHashPageKey();
}

function getHashPageKey() {
  return (location.hash || "#default").slice(1);
}
</script>
