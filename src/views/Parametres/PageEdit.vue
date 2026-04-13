<template>
  <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-title-md2 font-bold text-black dark:text-white">
        Éditer la Page : {{ page.title }}
      </h2>

      <nav>
        <ol class="flex items-center gap-2">
          <li>
            <router-link class="font-medium" to="/parametres/pages">Pages /</router-link>
          </li>
          <li class="font-medium text-primary">Éditer</li>
        </ol>
      </nav>
    </div>

    <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div class="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
        <h3 class="font-medium text-black dark:text-white">
          Contenu de la Page
        </h3>
      </div>
      <form @submit.prevent="savePage">
        <div class="p-6.5">
          <div class="mb-4.5">
            <label class="mb-2.5 block text-black dark:text-white">
              Titre de la Page
            </label>
            <input
              v-model="page.title"
              type="text"
              placeholder="Titre de la page"
              required
              class="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>

          <div class="mb-4.5">
            <label class="mb-2.5 block text-black dark:text-white">
              Slug (Identifiant URL)
            </label>
            <input
              v-model="page.slug"
              type="text"
              disabled
              class="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 text-black outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white opacity-70 cursor-not-allowed"
            />
          </div>

          <div class="mb-6">
            <label class="mb-2.5 block text-black dark:text-white">
              Contenu (HTML autorisé)
            </label>
            <textarea
              v-model="page.content"
              rows="20"
              placeholder="Rédigez le contenu de la page ici..."
              required
              class="w-full font-mono text-sm shadow-inner rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            ></textarea>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex justify-center rounded bg-primary py-3 px-10 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
            >
              {{ loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
            <button
              type="button"
              @click="$router.push('/parametres/pages')"
              class="flex justify-center rounded border border-stroke py-3 px-10 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { pagesService } from '@/services/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const page = ref({
  title: '',
  slug: '',
  content: ''
})

const fetchPage = async () => {
  try {
    const data = await pagesService.getOne(route.params.slug as string)
    page.value = data
  } catch (error) {
    console.error('Erreur lors du chargement de la page:', error)
    router.push('/parametres/pages')
  }
}

const savePage = async () => {
  loading.value = true
  try {
    await pagesService.update(route.params.slug as string, page.value)
    router.push('/parametres/pages')
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error)
    alert('Une erreur est survenue lors de l\'enregistrement.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPage()
})
</script>
