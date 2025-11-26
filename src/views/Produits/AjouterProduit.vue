<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    
    <div class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 class="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">Ajouter un produit</h2>
      
      <form @submit.prevent="submitForm" class="space-y-6">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="name">
              Nom du produit <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="produit.name"
              type="text"
              required
              class="form-input"
              placeholder="Entrez le nom du produit"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="price">
              Prix (HTG) <span class="text-red-500">*</span>
            </label>
            <input
              id="price"
              v-model.number="produit.price"
              type="number"
              step="0.01"
              min="0"
              required
              class="form-input"
              placeholder="0.00"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="stock">
              Quantité en stock
            </label>
            <input
              id="stock"
              v-model.number="produit.stock"
              type="number"
              min="0"
              class="form-input"
              placeholder="0"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="category_id">
              Catégorie
            </label>
            <select
              id="category_id"
              v-model.number="produit.category_id"
              class="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option :value="null">Sélectionnez une catégorie</option>
              <option v-for="categorie in categories" :key="categorie.id" :value="categorie.id">
                {{ categorie.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="description">
            Description
          </label>
          <textarea
            id="description"
            v-model="produit.description"
            rows="4"
            class="form-textarea w-full"
            placeholder="Décrivez le produit..."
          ></textarea>
        </div>

        <!-- Images du produit -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Images du produit <span class="text-sm font-normal text-gray-500">(Glissez-déposez ou cliquez pour sélectionner)</span>
          </label>
          
          <!-- Zone de dépôt -->
          <div 
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
            class="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pb-6 pt-5 transition-colors hover:border-primary-500 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-primary-500 dark:hover:bg-gray-800/50"
          >
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600 dark:text-gray-400">
                <span class="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500">
                  <span>Télécharger des fichiers</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    multiple 
                    class="sr-only" 
                    accept="image/*"
                    @change="handleFileUpload"
                    ref="fileInput"
                  />
                </span>
                <p class="pl-1">ou glissez-déposez</p>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF jusqu'à 10MB
              </p>
            </div>
          </div>
          
          <!-- Aperçu des images -->
          <div v-if="imagePreviews.length > 0" class="mt-4">
            <h4 class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Aperçu de l'image</h4>
            <div class="flex flex-wrap gap-4">
              <div class="group relative h-24 w-24">
                <img :src="imagePreviews[0]" class="h-full w-full rounded-md object-cover" />
                <button 
                  type="button"
                  @click.stop="removeImage"
                  class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Supprimer cette image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            @click="$router.go(-1)"
            class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Enregistrer') }} le produit
          </button>
        </div>
      </form>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { productService, type Product } from '@/services/api';

const router = useRouter();
const route = useRoute();
const currentPageTitle = ref('Ajouter un produit');
const isEditing = ref(false);
const loading = ref(false);

// Vérifier si on est en mode édition
const productId = route.params.id as string;
if (productId) {
  currentPageTitle.value = 'Modifier un produit';
  isEditing.value = true;
}

const categories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Accessories' },
  { id: 3, name: 'Smart Home' },
  { id: 4, name: 'Gaming' },
];

const produit = ref({
  id: null as number | null,
  name: '',
  description: '',
  price: null as number | null,
  stock: 0,
  category_id: null as number | null,
  image_url: '',
});

const imagePreviews = ref<string[]>([]);

// Charger le produit si en mode édition
const loadProduit = async () => {
  if (!isEditing.value) return;
  
  try {
    loading.value = true;
    const product = await productService.getById(parseInt(productId));
    produit.value = { ...product };
    
    if (product.image_url) {
      imagePreviews.value.push(product.image_url);
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Erreur lors du chargement du produit');
    router.push('/liste-produits');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProduit();
});

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    
    // Créer un aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value = [e.target.result as string];
        // Pour l'instant, on stocke juste l'URL de l'aperçu
        // Dans une vraie application, il faudrait uploader l'image
        produit.value.image_url = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  imagePreviews.value = [];
  produit.value.image_url = '';
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    const input = document.createElement('input');
    input.type = 'file';
    input.files = e.dataTransfer.files;
    const event = new Event('change');
    Object.defineProperty(event, 'target', { value: { files: e.dataTransfer.files } });
    handleFileUpload(event);
  }
};

const submitForm = async () => {
  try {
    loading.value = true;
    
    const productData = {
      name: produit.value.name,
      description: produit.value.description,
      price: produit.value.price,
      stock: produit.value.stock,
      category_id: produit.value.category_id,
      image_url: produit.value.image_url,
    };
    
    if (isEditing.value && produit.value.id) {
      await productService.update(produit.value.id, productData);
      alert('Produit modifié avec succès !');
    } else {
      await productService.create(productData);
      alert('Produit ajouté avec succès !');
    }
    
    // Rediriger vers la liste des produits
    router.push('/liste-produits');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du produit :', error);
    alert('Une erreur est survenue lors de la sauvegarde du produit.');
  } finally {
    loading.value = false;
  }
};
</script>
