<template>
  <div class="p-4 sm:p-6 space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Marques</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">Gérez les marques de produits disponibles sur la plateforme</p>
      </div>
      <button 
        @click="openModal()" 
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <i class="fas fa-plus mr-2"></i>
        Ajouter une marque
      </button>
    </div>

    <!-- State Grid -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
    </div>

    <div v-else-if="brands.length === 0" class="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
      <i class="fas fa-tag text-5xl text-gray-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">Aucune marque</h3>
      <p class="text-gray-500">Commencez par ajouter votre première marque de produit.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="brand in brands" :key="brand.id" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div class="h-32 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50">
          <img v-if="brand.logo_url" :src="brand.logo_url" :alt="brand.name" class="max-h-full max-w-full object-contain" />
          <div v-else class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {{ brand.name.charAt(0) }}
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-900 dark:text-white text-lg">{{ brand.name }}</h3>
          <p class="text-sm text-gray-500 line-clamp-2 mt-1 h-10">{{ brand.description || 'Aucune description' }}</p>
          
          <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button @click="openModal(brand)" class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg translate-colors" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="handleDelete(brand.id)" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg translate-colors" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ isEditing ? 'Modifier la marque' : 'Ajouter une marque' }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la marque *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              class="form-input w-full" 
              placeholder="Ex: Samsung, Apple, Sony..."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              v-model="form.description" 
              rows="3" 
              class="form-input w-full resize-none" 
              placeholder="Brève description de la marque..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
            <div class="mt-1 flex items-center gap-4">
              <div class="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
                <img v-if="logoPreview" :src="logoPreview" class="max-h-full max-w-full object-contain" />
                <i v-else class="fas fa-image text-gray-300 text-2xl"></i>
              </div>
              <input 
                type="file" 
                @change="handleFileChange" 
                accept="image/*" 
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button 
              type="button" 
              @click="showModal = false" 
              class="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              :disabled="submitting" 
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              {{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { brandService } from '@/services/api'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const brands = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const currentBrandId = ref<number | null>(null)

const form = ref({
  name: '',
  description: '',
  logo: null as File | null
})
const logoPreview = ref('')

const loadBrands = async () => {
  loading.value = true
  try {
    brands.value = await brandService.getAll()
  } catch (error) {
    console.error('Error loading brands:', error)
    uiStore.addToast('Erreur lors du chargement des marques', 'error')
  } finally {
    loading.value = false
  }
}

const openModal = (brand: any = null) => {
  if (brand) {
    isEditing.value = true
    currentBrandId.value = brand.id
    form.value.name = brand.name
    form.value.description = brand.description || ''
    form.value.logo = null
    logoPreview.value = brand.logo_url || ''
  } else {
    isEditing.value = false
    currentBrandId.value = null
    form.value.name = ''
    form.value.description = ''
    form.value.logo = null
    logoPreview.value = ''
  }
  showModal.value = true
}

const handleFileChange = (e: any) => {
  const file = e.target.files[0]
  if (file) {
    form.value.logo = file
    logoPreview.value = URL.createObjectURL(file)
  }
}

const handleSubmit = async () => {
  submitting.value = true
  const formData = new FormData()
  formData.append('name', form.value.name)
  formData.append('description', form.value.description)
  if (form.value.logo) {
    formData.append('logo', form.value.logo)
  }

  try {
    if (isEditing.value && currentBrandId.value) {
      await brandService.update(currentBrandId.value, formData)
      uiStore.addToast('Marque mise à jour', 'success')
    } else {
      await brandService.create(formData)
      uiStore.addToast('Marque créée avec succès', 'success')
    }
    showModal.value = false
    await loadBrands()
  } catch (error) {
    console.error('Error saving brand:', error)
    uiStore.addToast('Erreur lors de l’enregistrement', 'error')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: number) => {
  const confirmed = await uiStore.confirm({
    title: 'Supprimer la marque',
    message: 'Êtes-vous sûr de vouloir supprimer cette marque ? Cela n’affectera pas les produits existants.',
    confirmText: 'Supprimer',
    type: 'danger'
  })

  if (!confirmed) return

  try {
    await brandService.delete(id)
    uiStore.addToast('Marque supprimée', 'info')
    await loadBrands()
  } catch (error) {
    uiStore.addToast('Erreur lors de la suppression', 'error')
  }
}

onMounted(loadBrands)

defineOptions({ name: 'BrandList' })
</script>
