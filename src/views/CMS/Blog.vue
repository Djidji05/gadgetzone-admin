<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">Blog</h2>
      <button 
        @click="showCreateModal = true"
        class="rounded bg-primary px-6 py-3 text-white hover:bg-opacity-90"
      >
        Nouvel article
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Chargement...</p>
    </div>

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.published }}</h4>
        <span class="text-sm">Articles publiés</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.totalViews.toLocaleString() }}</h4>
        <span class="text-sm">Vues totales</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.drafts }}</h4>
        <span class="text-sm">Brouillons</span>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <h4 class="text-title-md font-bold">{{ stats.total }}</h4>
        <span class="text-sm">Total articles</span>
      </div>
    </div>

    <!-- Blog Posts List -->
    <div v-if="!isLoading" class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold">Articles récents</h4>
      </div>
      <div class="p-6">
        <div v-if="posts.length === 0" class="text-center py-12">
          <p class="text-gray-600">Aucun article pour le moment</p>
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="post in posts" 
            :key="post.id" 
            class="flex items-start justify-between border-b pb-4 last:border-0"
          >
            <div class="flex-1">
              <h5 class="mb-2 font-medium text-black dark:text-white">{{ post.title }}</h5>
              <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">{{ post.excerpt }}</p>
              <div class="flex gap-4 text-sm text-gray-500">
                <span>{{ post.author }}</span>
                <span>{{ formatDate(post.createdAt) }}</span>
                <span>{{ post.views }} vues</span>
                <span :class="[
                  'rounded-full px-2 py-0.5',
                  post.status === 'published' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                ]">{{ post.status === 'published' ? 'Publié' : 'Brouillon' }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button 
                @click="editPost(post)"
                class="rounded border px-4 py-2 hover:bg-gray-100"
              >
                Modifier
              </button>
              <button 
                @click="deletePost(post.id)"
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
import { blogService, type BlogPost, type BlogStats } from '@/services/blog';

const posts = ref<BlogPost[]>([]);
const stats = ref<BlogStats>({
  published: 0,
  drafts: 0,
  totalViews: 0,
  total: 0
});
const isLoading = ref(true);
const showCreateModal = ref(false);

const loadData = async () => {
  try {
    isLoading.value = true;
    const data = await blogService.getAll();
    posts.value = data.posts;
    stats.value = data.stats;
  } catch (error) {
    console.error('Error loading blog data:', error);
    alert('Erreur lors du chargement des articles');
  } finally {
    isLoading.value = false;
  }
};

const editPost = (post: BlogPost) => {
  // TODO: Implement edit modal
  console.log('Edit post:', post);
  alert('Fonctionnalité d\'édition à implémenter');
};

const deletePost = async (id: number) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    return;
  }

  try {
    await blogService.delete(id);
    await loadData();
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Erreur lors de la suppression de l\'article');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

onMounted(() => {
  loadData();
});
</script>
