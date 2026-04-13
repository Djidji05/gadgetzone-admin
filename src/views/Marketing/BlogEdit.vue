<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">
    <!-- Breadcrumb -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        {{ isEdit ? 'Modifier l\'Article' : 'Nouvel Article' }}
      </h2>

      <nav>
        <ol class="flex items-center gap-2">
          <li>
            <router-link class="font-medium" to="/marketing/blog">Blog /</router-link>
          </li>
          <li class="font-medium text-primary">{{ isEdit ? 'Modifier' : 'Nouveau' }}</li>
        </ol>
      </nav>
    </div>

    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              Contenu de l'article
            </h3>
          </div>
          <form @submit.prevent="savePost">
            <div class="p-6.5">
              <div class="mb-4.5">
                <label class="mb-2.5 block text-black dark:text-white">
                  Titre
                </label>
                <input
                  v-model="post.title"
                  type="text"
                  placeholder="Titre de l'article"
                  required
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div class="mb-4.5">
                <label class="mb-2.5 block text-black dark:text-white">
                  Image de couverture
                </label>
                <div class="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleFileUpload"
                    class="w-full cursor-pointer rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/5 dark:file:text-white dark:focus:border-primary"
                  />
                  <div v-if="uploading" class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
                <p class="mt-1 text-xs text-gray-400">Format recommandé : JPG, PNG (Max 5Mo)</p>
              </div>

              <div class="mb-6">
                <label class="mb-2.5 block text-black dark:text-white">
                  Contenu
                </label>
                <textarea
                  v-model="post.content"
                  rows="12"
                  placeholder="Rédigez votre article ici..."
                  required
                  class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
              >
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="flex flex-col gap-9">
        <!-- Preview & Settings -->
        <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 class="font-medium text-black dark:text-white">
              Paramètres & Aperçu
            </h3>
          </div>
          <div class="p-6.5">
            <div class="mb-4.5">
              <label class="mb-2.5 block text-black dark:text-white">
                Statut
              </label>
              <select
                v-model="post.status"
                class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>

            <div class="mb-4.5">
              <label class="mb-2.5 block text-black dark:text-white">
                Aperçu de l'image
              </label>
              <div v-if="post.featuredImage" class="relative block h-48 w-full overflow-hidden rounded-md bg-gray-200">
                <img :src="getImageUrl(post.featuredImage)" alt="Preview" class="h-full w-full object-cover" />
              </div>
              <div v-else class="flex h-48 w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <span class="text-gray-400">Aucune image</span>
              </div>
            </div>
            
            <div class="mt-8 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
                <p class="text-xs text-gray-500">
                    <strong>Note:</strong> Les articles publiés sont immédiatement visibles sur la section Blog du site public.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { blogService, uploadService } from '@/services/api'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const uploading = ref(false)

const post = ref({
  title: '',
  content: '',
  featuredImage: '',
  status: 'draft',
  author: 'Admin'
})

const getImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `http://localhost:3003${url}`
}

const generateSlug = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
}

const handleFileUpload = async (event: any) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  try {
    const response = await uploadService.upload([file])
    if (response.urls && response.urls.length > 0) {
      post.value.featuredImage = response.urls[0]
      alert('Image téléversée avec succès !')
    }
  } catch (error) {
    console.error('Erreur lors du téléversement:', error)
    alert('Erreur lors du téléversement de l\'image.')
  } finally {
    uploading.value = false
  }
}

const fetchPost = async () => {
  if (!isEdit.value) return
  try {
    const data = await blogService.getOne(route.params.id as string)
    post.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de l\'article:', error)
    router.push('/marketing/blog')
  }
}

const savePost = async () => {
  if (!post.value.title.trim()) {
    alert('Le titre est requis.')
    return
  }

  loading.value = true
  try {
    const payload = { 
      ...post.value,
      slug: (post.value as any).slug || generateSlug(post.value.title)
    }

    if (isEdit.value) {
      await blogService.update(route.params.id as string, payload)
    } else {
      await blogService.create(payload)
    }
    alert('Article enregistré avec succès !')
    router.push('/marketing/blog')
  } catch (error: any) {
    console.error('Erreur lors de l\'enregistrement:', error)
    const errorData = error.response?.data
    const message = errorData?.error || errorData?.message || error.message
    alert(`Erreur lors de l'enregistrement : ${message}`)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPost()
})
</script>
