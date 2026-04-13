<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">
    <!-- Header -->
    <div class="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Pages Statiques
      </h2>
      
      <button 
        @click="createNewPage"
        class="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
      >
        Nouvelle Page
      </button>
    </div>

    <!-- Table -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-black dark:text-white">Liste des Pages</h4>
        <p class="text-sm text-gray-500 mt-1">Gérez le contenu des pages légales et informatives du site public.</p>
      </div>

      <div class="grid grid-cols-4 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-6 md:px-6 2xl:px-7.5">
        <div class="col-span-2 flex items-center">
          <p class="font-medium">Titre</p>
        </div>
        <div class="col-span-2 flex items-center">
          <p class="font-medium">Slug (URL)</p>
        </div>
        <div class="col-span-1 hidden items-center sm:flex">
          <p class="font-medium">Dernière modification</p>
        </div>
        <div class="col-span-1 flex items-center justify-end">
          <p class="font-medium">Actions</p>
        </div>
      </div>

      <div
        v-for="page in pages"
        :key="page.slug"
        class="grid grid-cols-4 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-6 md:px-6 2xl:px-7.5"
      >
        <div class="col-span-2 flex items-center">
          <p class="text-sm font-medium text-black dark:text-white">{{ page.title }}</p>
        </div>
        <div class="col-span-2 flex items-center">
          <code class="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/{{ page.slug }}</code>
        </div>
        <div class="col-span-1 hidden items-center sm:flex">
          <p class="text-xs text-black dark:text-white">{{ formatDate(page.updated_at) }}</p>
        </div>
        <div class="col-span-1 flex items-center justify-end space-x-3.5">
          <button class="hover:text-primary" @click="editPage(page.slug)">
            <svg class="fill-current" width="18" height="18" fill="none" viewBox="0 0 18 18">
               <path d="M15.5 2.5a2.121 2.121 0 0 1 3 3L6 18l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
          <button 
            v-if="!['terms', 'privacy'].includes(page.slug)"
            class="hover:text-danger" 
            @click="deletePage(page.slug)"
          >
            <svg class="fill-current" width="18" height="18" fill="none" viewBox="0 0 18 18">
               <path d="M1 4h16M7 7v7M11 7v7M3 4l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M6 4V2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
      
      <div v-if="pages.length === 0" class="py-10 text-center text-gray-500">
          Chargement ou aucune page trouvée...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { pagesService } from '@/services/api'

const router = useRouter()
const pages = ref([])

const fetchPages = async () => {
  try {
    const data = await pagesService.getAll()
    pages.value = data
  } catch (error) {
    console.error('Erreur lors de la récupération des pages:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editPage = (slug: string) => {
  router.push(`/parametres/pages/edit/${slug}`)
}

const createNewPage = () => {
  const title = prompt('Titre de la nouvelle page:')
  if (!title) return
  
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
  pagesService.create({ title, slug, content: 'Nouveau contenu...' })
    .then(() => fetchPages())
    .catch(err => alert('Erreur: ' + err.message))
}

const deletePage = async (slug: string) => {
  if (confirm(`Supprimer la page "${slug}" ?`)) {
    try {
      await pagesService.delete(slug)
      fetchPages()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

onMounted(() => {
  fetchPages()
})
</script>
