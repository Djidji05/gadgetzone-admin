<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">CMS - Pages</h2>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>

    <div v-else class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5 flex justify-between">
        <h4 class="text-xl font-bold">Pages du site ({{ pages.length }})</h4>
        <button 
          @click="showCreateModal = true"
          class="rounded bg-primary px-6 py-2 text-white hover:bg-opacity-90"
        >
          Nouvelle page
        </button>
      </div>
      
      <div class="p-6">
        <div v-if="pages.length === 0" class="text-center py-12">
          <p class="text-gray-600">Aucune page pour le moment</p>
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="page in pages" 
            :key="page.id"
            class="flex items-center justify-between border-b pb-4 last:border-0"
          >
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h5 class="font-medium text-black dark:text-white">{{ page.title }}</h5>
                <span 
                  v-if="page.isPublished"
                  class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded"
                >
                  Publié
                </span>
                <span 
                  v-else
                  class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  Brouillon
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-1">/{{ page.slug }}</p>
              <p v-if="page.metaDescription" class="text-sm text-gray-500 mt-1">{{ page.metaDescription }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="editPage(page)"
                class="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Modifier
              </button>
              <button 
                @click="deletePage(page.id)"
                class="rounded border border-red-500 text-red-500 px-4 py-2 hover:bg-red-50"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { pagesService, type Page } from '@/services/pages';

const pages = ref<Page[]>([]);
const isLoading = ref(true);
const showCreateModal = ref(false);

const loadPages = async () => {
  try {
    isLoading.value = true;
    const data = await pagesService.getAll();
    pages.value = data.pages;
  } catch (error) {
    console.error('Error loading pages:', error);
    alert('Erreur lors du chargement des pages');
  } finally {
    isLoading.value = false;
  }
};

const editPage = (page: Page) => {
  // TODO: Implement edit modal
  console.log('Edit page:', page);
  alert('Fonctionnalité d\'édition à implémenter');
};

const deletePage = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
    return;
  }

  try {
    await pagesService.delete(id);
    await loadPages();
  } catch (error) {
    console.error('Error deleting page:', error);
    alert('Erreur lors de la suppression de la page');
  }
};

onMounted(() => {
  loadPages();
});
</script>
