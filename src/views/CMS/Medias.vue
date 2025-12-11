<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <!-- En-tête -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Bibliothèque de Médias
      </h2>
      <button
        @click="showUploadModal = true"
        class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90 transition"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Télécharger des fichiers
      </button>
    </div>

    <!-- Filtres et Recherche -->
    <div class="mb-6 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="flex flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Rechercher des fichiers..."
            class="w-full rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          />
        </div>
        <div>
          <select
            v-model="filterType"
            class="rounded border border-stroke bg-gray px-4 py-2 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="">Tous les types</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Vidéos</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded border',
              viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'bg-gray border-stroke text-black dark:border-strokedark dark:text-white'
            ]"
            title="Vue grille"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded border',
              viewMode === 'list' ? 'bg-primary text-white border-primary' : 'bg-gray border-stroke text-black dark:border-strokedark dark:text-white'
            ]"
            title="Vue liste"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-sm font-bold text-black dark:text-white">
              {{ filteredMedia.length }}
            </h4>
            <span class="text-sm font-medium">Fichiers</span>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-sm font-bold text-black dark:text-white">
              {{ totalSize }}
            </h4>
            <span class="text-sm font-medium">Espace utilisé</span>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-sm font-bold text-black dark:text-white">
              {{ imageCount }}
            </h4>
            <span class="text-sm font-medium">Images</span>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-title-sm font-bold text-black dark:text-white">
              {{ videoCount }}
            </h4>
            <span class="text-sm font-medium">Vidéos</span>
          </div>
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Galerie -->
    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="px-4 py-6 md:px-6 xl:px-7.5">
        <h4 class="text-xl font-bold text-black dark:text-white">
          Galerie de médias
        </h4>
      </div>

      <div v-if="filteredMedia.length === 0" class="p-10 text-center text-gray-500 dark:text-gray-400">
        <svg class="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p class="mt-4">Aucun fichier trouvé</p>
        <button
          @click="showUploadModal = true"
          class="mt-4 text-primary hover:underline"
        >
          Télécharger votre premier fichier
        </button>
      </div>

      <!-- Vue Grille -->
      <div v-else-if="viewMode === 'grid'" class="grid grid-cols-2 gap-4 p-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <div
          v-for="media in filteredMedia"
          :key="media.id"
          class="group relative overflow-hidden rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-all cursor-pointer"
          @click="selectMedia(media)"
        >
          <div class="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <img
              v-if="media.type === 'image' && media.url"
              :src="media.url"
              :alt="media.name"
              class="h-full w-full object-cover"
            />
            <svg v-else class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="p-2">
            <p class="truncate text-sm font-medium text-black dark:text-white">{{ media.name }}</p>
            <p class="text-xs text-gray-500">{{ formatSize(media.size) }}</p>
          </div>
          <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click.stop="deleteMedia(media)"
              class="rounded-full bg-red-500 p-2 text-white hover:bg-red-600"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Vue Liste -->
      <div v-else class="overflow-x-auto p-6">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-2 text-left dark:bg-meta-4">
              <th class="px-4 py-4 font-medium text-black dark:text-white">Aperçu</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Nom</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Type</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Taille</th>
              <th class="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="media in filteredMedia"
              :key="media.id"
              class="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td class="px-4 py-5">
                <div class="h-12 w-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <img
                    v-if="media.type === 'image' && media.url"
                    :src="media.url"
                    :alt="media.name"
                    class="h-full w-full object-cover"
                  />
                  <svg v-else class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </td>
              <td class="px-4 py-5">
                <p class="text-black dark:text-white">{{ media.name }}</p>
              </td>
              <td class="px-4 py-5">
                <span class="inline-flex rounded-full px-3 py-1 text-sm font-medium capitalize bg-primary bg-opacity-10 text-primary">
                  {{ media.type }}
                </span>
              </td>
              <td class="px-4 py-5">
                <p class="text-black dark:text-white">{{ formatSize(media.size) }}</p>
              </td>
              <td class="px-4 py-5">
                <div class="flex items-center gap-3">
                  <button
                    @click="selectMedia(media)"
                    class="text-primary hover:text-primary/80"
                    title="Voir"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteMedia(media)"
                    class="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Upload -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="showUploadModal = false"
    >
      <div class="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-boxdark">
        <h3 class="mb-4 text-xl font-bold text-black dark:text-white">
          Télécharger des fichiers
        </h3>
        <div class="mb-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            @change="handleFileUpload"
            class="hidden"
            ref="fileInput"
          />
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Glissez-déposez vos fichiers ici ou
            <button
              @click="$refs.fileInput.click()"
              class="text-primary hover:underline"
            >
              parcourez
            </button>
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Images, vidéos, documents (Max 10MB par fichier)
          </p>
        </div>
        <div class="flex justify-end gap-3">
          <button
            @click="showUploadModal = false"
            class="rounded border border-stroke px-6 py-2 text-black hover:bg-gray-50 dark:border-strokedark dark:text-white dark:hover:bg-gray-800"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Détails -->
    <div
      v-if="selectedMedia"
      class="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50"
      @click.self="selectedMedia = null"
    >
      <div class="w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-boxdark">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-xl font-bold text-black dark:text-white">
            Détails du fichier
          </h3>
          <button
            @click="selectedMedia = null"
            class="text-gray-500 hover:text-black dark:hover:text-white"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <img
              v-if="selectedMedia.type === 'image' && selectedMedia.url"
              :src="selectedMedia.url"
              :alt="selectedMedia.name"
              class="w-full rounded-lg"
            />
            <div v-else class="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <svg class="h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium">Nom du fichier</label>
              <p class="text-black dark:text-white">{{ selectedMedia.name }}</p>
            </div>
            <div v-if="selectedMedia.url">
              <label class="mb-2 block text-sm font-medium">URL</label>
              <div class="flex gap-2">
                <input
                  :value="selectedMedia.url"
                  readonly
                  class="flex-1 rounded border border-stroke bg-gray px-3 py-2 text-sm text-black dark:border-strokedark dark:bg-meta-4 dark:text-white"
                />
                <button
                  @click="copyToClipboard(selectedMedia.url)"
                  class="rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                  Copier
                </button>
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Type</label>
              <p class="capitalize text-black dark:text-white">{{ selectedMedia.type }}</p>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Taille</label>
              <p class="text-black dark:text-white">{{ formatSize(selectedMedia.size) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Media {
  id: number
  name: string
  url?: string
  type: 'image' | 'document' | 'video'
  size: number
}

const searchQuery = ref('')
const filterType = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const showUploadModal = ref(false)
const selectedMedia = ref<Media | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Données avec URLs réelles pour les images produits
const medias = ref<Media[]>([
  { id: 1, name: 'product-1.jpg', type: 'image', url: '/images/product/product-01.png', size: 245000 },
  { id: 2, name: 'banner.png', type: 'image', url: '/images/product/product-02.png', size: 512000 },
  { id: 3, name: 'video-demo.mp4', type: 'video', size: 2048000 },
  { id: 4, name: 'logo.svg', type: 'image', url: '/images/logo/logo.png', size: 45000 },
  { id: 5, name: 'catalogue.pdf', type: 'document', size: 1024000 },
  { id: 6, name: 'promo.jpg', type: 'image', url: '/images/product/product-03.png', size: 389000 }
])

const filteredMedia = computed(() => {
  let result = medias.value

  if (searchQuery.value) {
    result = result.filter(m =>
      m.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (filterType.value) {
    result = result.filter(m => m.type === filterType.value)
  }

  return result
})

const totalSize = computed(() => {
  const bytes = medias.value.reduce((sum, m) => sum + m.size, 0)
  return formatSize(bytes)
})

const imageCount = computed(() => {
  return medias.value.filter(m => m.type === 'image').length
})

const videoCount = computed(() => {
  return medias.value.filter(m => m.type === 'video').length
})

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    console.log('Fichiers sélectionnés:', files.length)
    // TODO: Implémenter l'upload réel vers le serveur
    showUploadModal.value = false
  }
}

const selectMedia = (media: Media) => {
  selectedMedia.value = media
}

const deleteMedia = (media: Media) => {
  if (confirm(`Supprimer "${media.name}" ?`)) {
    medias.value = medias.value.filter(m => m.id !== media.id)
  }
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  alert('URL copiée dans le presse-papiers')
}
</script>
