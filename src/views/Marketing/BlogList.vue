<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">
    <!-- Header -->
    <div class="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Gestion du Blog
      </h2>

      <router-link
        to="/marketing/blog/new"
        class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
      >
        <span>
          <svg
            class="fill-current"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M15 7H9V1C9 0.447715 8.55228 0 8 0C7.44772 0 7 0.447715 7 1V7H1C0.447715 7 0 7.44772 0 8C0 8.55228 0.447715 9 1 9H7V15C7 15.5523 7.44772 16 8 16C8.55228 16 9 15.5523 9 15V9H15C15.5523 9 16 8.55228 16 8C16 7.44772 15.5523 7 15 7Z"
              fill=""
            />
          </svg>
        </span>
        Nouvel Article
      </router-link>
    </div>

    <!-- Stats -->
    <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ stats.totalPosts || 0 }}</h4>
            <span class="text-sm font-medium">Total Articles</span>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ stats.totalViews || 0 }}</h4>
            <span class="text-sm font-medium">Vues Totales</span>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-end justify-between">
          <div>
            <h4 class="text-title-md font-bold text-black dark:text-white">{{ stats.publishedPosts || 0 }}</h4>
            <span class="text-sm font-medium">Articles Publiés</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-black dark:text-white">Derniers Articles</h4>
      </div>

      <div class="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div class="col-span-3 flex items-center">
          <p class="font-medium">Titre</p>
        </div>
        <div class="col-span-2 hidden items-center sm:flex">
          <p class="font-medium">Auteur</p>
        </div>
        <div class="col-span-1 flex items-center">
          <p class="font-medium">Statut</p>
        </div>
        <div class="col-span-1 flex items-center">
          <p class="font-medium">Vues</p>
        </div>
        <div class="col-span-1 flex items-center justify-end">
          <p class="font-medium">Actions</p>
        </div>
      </div>

      <div
        v-for="post in posts"
        :key="post.id"
        class="grid grid-cols-6 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
      >
        <div class="col-span-3 flex items-center">
          <div class="flex flex-col gap-1">
             <p class="text-sm font-medium text-black dark:text-white">{{ post.title }}</p>
             <p class="text-xs">{{ formatDate(post.created_at) }}</p>
          </div>
        </div>
        <div class="col-span-2 hidden items-center sm:flex">
          <p class="text-sm text-black dark:text-white">{{ post.author_name || 'Admin' }}</p>
        </div>
        <div class="col-span-1 flex items-center">
          <span
            :class="[
              'inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium',
              post.status === 'published' ? 'bg-success text-success' : 'bg-warning text-warning'
            ]"
          >
            {{ post.status === 'published' ? 'Publié' : 'Brouillon' }}
          </span>
        </div>
        <div class="col-span-1 flex items-center">
          <p class="text-sm text-black dark:text-white">{{ post.views }}</p>
        </div>
        <div class="col-span-1 flex items-center justify-end space-x-3.5">
          <button class="hover:text-primary" @click="editPost(post.id)">
            <svg class="fill-current" width="18" height="18" fill="none" viewBox="0 0 18 18">
               <path d="M15.5 2.5a2.121 2.121 0 0 1 3 3L6 18l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
          <button class="hover:text-danger" @click="deletePost(post.id)">
            <svg class="fill-current" width="18" height="18" fill="none" viewBox="0 0 18 18">
               <path d="M1 4h16M7 7v7M11 7v7M3 4l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M6 4V2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="posts.length === 0" class="py-10 text-center text-gray-500">
          Aucun article trouvé.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { blogService } from '@/services/api'

const router = useRouter()
const posts = ref<any[]>([])
const stats = ref({
  totalPosts: 0,
  totalViews: 0,
  publishedPosts: 0
})

const fetchPosts = async () => {
  try {
    const data: any = await blogService.getAll()
    posts.value = data.posts
    stats.value = data.stats
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const editPost = (id: number) => {
  router.push(`/marketing/blog/edit/${id}`)
}

const deletePost = async (id: number) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    try {
      await blogService.delete(id)
      fetchPosts()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

onMounted(() => {
  fetchPosts()
})
</script>
