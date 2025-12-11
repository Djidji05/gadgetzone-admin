<template>
  <div class="p-6">
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="max-w-6xl mx-auto">
      <div class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <!-- Header -->
        <div class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 p-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div class="p-2 bg-primary-600 rounded-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            {{ isEditing ? 'Modifier le produit' : 'Ajouter un nouveau produit' }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Remplissez les informations ci-dessous pour {{ isEditing ? 'mettre à jour' : 'ajouter' }} un produit
          </p>
        </div>

        <form @submit.prevent="submitForm" class="p-6 space-y-8">
          <!-- Section 1: Informations de base -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Informations de base</h3>
            </div>

            <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div class="lg:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="name">
                  Nom du produit <span class="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  v-model="produit.name"
                  type="text"
                  required
                  class="form-input w-full"
                  placeholder="Ex: iPhone 15 Pro Max 256GB"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="price">
                  Prix (HTG) <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">HTG</span>
                  <input
                    id="price"
                    v-model.number="produit.price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="form-input w-full pl-16"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="stock">
                  Quantité en stock <span class="text-red-500">*</span>
                </label>
                <input
                  id="stock"
                  v-model.number="produit.stock"
                  type="number"
                  min="0"
                  required
                  class="form-input w-full"
                  placeholder="0"
                />
              </div>

              <div class="lg:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="category_id">
                  Catégorie <span class="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  v-model.number="produit.category_id"
                  required
                  class="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option :value="null">Sélectionnez une catégorie</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="lg:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="brand_id">
                  Marque
                </label>
                <select
                  id="brand_id"
                  v-model.number="produit.brand_id"
                  class="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option :value="null">Sélectionnez une marque (optionnel)</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
              </div>

              <div class="lg:col-span-2">
                <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" for="description">
                  Description
                </label>
                <textarea
                  id="description"
                  v-model="produit.description"
                  rows="4"
                  class="form-textarea w-full"
                  placeholder="Décrivez les caractéristiques principales du produit..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Section 2: Options du produit -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Options et Détails</h3>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div class="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                <input
                  id="is_featured"
                  v-model="produit.is_featured"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="is_featured" class="ml-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <div>
                    <div class="font-semibold">Produit vedette</div>
                    <div class="text-xs text-blue-600 dark:text-blue-400">Affiché en page d'accueil</div>
                  </div>
                </label>
              </div>

              <div class="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border-2 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                <input
                  id="is_new"
                  v-model="produit.is_new"
                  type="checkbox"
                  class="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label for="is_new" class="ml-3 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <div class="font-semibold">Nouveau produit</div>
                    <div class="text-xs text-green-600 dark:text-green-400">Badge "Nouveau"</div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Caractéristiques (Features) -->
            <div class="mt-4">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Caractéristiques principales (Liste à puces)
              </label>
              <div class="space-y-2">
                <div v-for="(feature, index) in featureList" :key="index" class="flex gap-2">
                  <input
                    v-model="featureList[index]"
                    type="text"
                    class="form-input flex-1"
                    placeholder="Ex: Écran Super Retina XDR"
                  />
                  <button type="button" @click="removeFeature(index)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <button type="button" @click="addFeature" class="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  Ajouter une caractéristique
                </button>
              </div>
            </div>

            <!-- Spécifications (Key-Value) -->
            <div class="mt-4">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Spécifications techniques
              </label>
              <div class="space-y-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div v-for="(spec, index) in specificationList" :key="index" class="flex gap-2 items-start">
                  <div class="w-1/3">
                    <input
                      v-model="spec.key"
                      type="text"
                      class="form-input w-full"
                      placeholder="Caractéristique (ex: Poids)"
                    />
                  </div>
                  <div class="flex-1">
                    <input
                      v-model="spec.value"
                      type="text"
                      class="form-input w-full"
                      placeholder="Valeur (ex: 180g)"
                    />
                  </div>
                  <button type="button" @click="removeSpecification(index)" class="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-0.5">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <button type="button" @click="addSpecification" class="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                  Ajouter une spécification
                </button>
              </div>
            </div>
          </div>

          <!-- Section 3: Images du produit -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Images du produit</h3>
            </div>

            <!-- Zone de dépôt -->
            <div
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="fileInput?.click()"
              class="relative mt-1 flex justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 pb-6 pt-5 transition-all hover:border-primary-500 hover:bg-primary-50 dark:hover:border-primary-500 dark:hover:bg-primary-900/10 cursor-pointer group"
            >
              <div class="space-y-2 text-center">
                <svg class="mx-auto h-16 w-16 text-gray-400 group-hover:text-primary-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="flex flex-col items-center text-sm text-gray-600 dark:text-gray-400">
                  <span class="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                    <span>Télécharger une image</span>
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
            <div v-if="produit.images && produit.images.length > 0" class="mt-6">
              <h4 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Aperçu des images ({{ produit.images.length }})
              </h4>
              <p class="text-xs text-gray-500 mb-4">La première image sera l'image principale. Cliquez sur "Définir principale" pour changer.</p>
              
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <div 
                  v-for="(img, index) in produit.images" 
                  :key="index"
                  class="group relative aspect-square rounded-lg overflow-hidden border-2 transition-all"
                  :class="index === 0 ? 'border-primary-500 ring-2 ring-primary-200 ring-offset-2' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'"
                >
                  <img :src="img" class="h-full w-full object-cover" />
                  
                  <!-- Badge Principale -->
                  <div v-if="index === 0" class="absolute top-2 left-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                    Principale
                  </div>

                  <!-- Overlay Actions -->
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button
                      v-if="index !== 0"
                      type="button"
                      @click.stop="setMainImage(index)"
                      class="px-3 py-1 bg-white text-gray-900 text-xs font-medium rounded hover:bg-gray-100 w-full"
                    >
                      Définir principale
                    </button>
                    <button
                      type="button"
                      @click.stop="removeImage(index)"
                      class="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 w-full flex items-center justify-center gap-1"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="$router.go(-1)"
              class="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </span>
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <span class="flex items-center gap-2">
                <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-white font-bold">
                  {{ loading ? 'Enregistrement...' : (isEditing ? 'Mettre à jour le produit' : 'Enregistrer le produit') }}
                </span>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue';
import { productService, categoryService, brandService } from '@/services/api';

const router = useRouter();
const route = useRoute();
const currentPageTitle = ref('Ajouter un produit');
const isEditing = ref(false);
const loading = ref(false);

// Vérifier si on est en mode édition (simulation)
const productId = route.params.id as string;
if (productId) {
  currentPageTitle.value = 'Modifier un produit';
  isEditing.value = true;
  // Simulation de chargement pour édition
  setTimeout(() => {
    produit.value = {
      id: parseInt(productId),
      name: 'iPhone 15 Pro (exemple)',
      description: 'Dernier iPhone avec processeur A17 Pro',
      price: 120000,
      stock: 25,
      category_id: 1,
      image_url: 'https://via.placeholder.com/40/007bff/ffffff?text=i15',
      images: ['https://via.placeholder.com/40/007bff/ffffff?text=i15'], // Init images array
      is_featured: false,
      is_new: false,
    };
    loading.value = false;
  }, 500);
}

const categories = ref<any[]>([]);

const loadCategories = async () => {
  try {
    const data = await categoryService.getAll();
    categories.value = Array.isArray(data) ? data : (data.categories || []);
  } catch (error) {
    console.error('Erreur chargement catégories', error);
  }
};

const brands = ref<any[]>([]);

const loadBrands = async () => {
  try {
    const data = await brandService.getAll();
    brands.value = data;
  } catch (error) {
    console.error('Erreur chargement marques', error);
  }
};

const produit = ref({
  id: null as number | null,
  name: '',
  description: '',
  price: null as number | null,
  stock: 0,
  category_id: null as number | null,
  brand_id: null as number | null,
  image_url: '', // Main image (first one)
  images: [] as string[], // All images
  features: [] as string[],
  specifications: {} as Record<string, string>,
  is_featured: false,
  is_new: false,
});

// State for dynamic lists
const featureList = ref<string[]>(['']); // Start with one empty line
const specificationList = ref<{ key: string; value: string }[]>([{ key: '', value: '' }]);

const addFeature = () => {
  featureList.value.push('');
};

const removeFeature = (index: number) => {
  featureList.value.splice(index, 1);
};

const addSpecification = () => {
  specificationList.value.push({ key: '', value: '' });
};

const removeSpecification = (index: number) => {
  specificationList.value.splice(index, 1);
};

const fileInput = ref<HTMLInputElement | null>(null);

// Charger le produit si en mode édition
const loadProduit = async () => {
  if (!isEditing.value) return;

  try {
    loading.value = true;
    const product = await productService.getById(parseInt(productId));
    if (product) {
      // Ensure images array exists
      const images = (product as any).images || (product.image_url ? [product.image_url] : []);
      
      // Initialize dynamic lists
      const features = (product as any).features || [];
      featureList.value = features.length > 0 ? [...features] : [''];
      
      const specs = (product as any).specifications || {};
      specificationList.value = Object.keys(specs).length > 0 
        ? Object.entries(specs).map(([key, value]) => ({ key, value: String(value) }))
        : [{ key: '', value: '' }];

      produit.value = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category_id: product.category_id || null,
        brand_id: (product as any).brand_id || null,
        image_url: product.image_url || '',
        images: images,
        features: features,
        specifications: specs,
        is_featured: (product as any).is_featured || false,
        is_new: (product as any).is_new || false,
      };
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
  loadCategories();
  loadBrands();
  loadProduit();
});

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // Process all selected files
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result as string;
          // Add to images array
          produit.value.images.push(imageUrl);
          // Set as main image if it's the first one
          if (produit.value.images.length === 1) {
            produit.value.image_url = imageUrl;
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }
};

const removeImage = (index: number) => {
  produit.value.images.splice(index, 1);
  // Update main image if needed
  if (produit.value.images.length > 0) {
    produit.value.image_url = produit.value.images[0];
  } else {
    produit.value.image_url = '';
  }
};

const setMainImage = (index: number) => {
  const image = produit.value.images[index];
  // Move to front of array
  produit.value.images.splice(index, 1);
  produit.value.images.unshift(image);
  produit.value.image_url = image;
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

const validateForm = () => {
  if (!produit.value.name?.trim()) return 'Le nom du produit est obligatoire.';
  if (!produit.value.price || produit.value.price <= 0) return 'Le prix doit être supérieur à 0.';
  if (produit.value.stock === null || produit.value.stock < 0) return 'Le stock ne peut pas être négatif.';
  if (!produit.value.category_id) return 'Veuillez sélectionner une catégorie.';
  if (produit.value.images.length === 0) return 'Veuillez ajouter au moins une image.';
  return null;
};

const submitForm = async () => {
  const validationError = validateForm();
  if (validationError) {
    alert(validationError);
    return;
  }

  try {
    loading.value = true;

    // Prepare features (filter empty)
    const cleanFeatures = featureList.value.filter(f => f.trim() !== '');
    
    // Prepare specifications (filter empty keys)
    const cleanSpecs: Record<string, string> = {};
    specificationList.value.forEach(item => {
      if (item.key.trim()) {
        cleanSpecs[item.key.trim()] = item.value.trim();
      }
    });

    const productData = {
      name: produit.value.name,
      description: produit.value.description,
      price: produit.value.price || 0,
      stock: produit.value.stock,
      category_id: produit.value.category_id,
      brand_id: produit.value.brand_id,
      image_url: produit.value.image_url,
      images: produit.value.images,
      features: cleanFeatures,
      specifications: cleanSpecs,
      is_featured: produit.value.is_featured,
      is_new: produit.value.is_new,
    };

    if (isEditing.value && produit.value.id) {
      // Mode édition : mettre à jour le produit existant
      await productService.update(produit.value.id, productData);
      console.log('Produit modifié (API):', productData);
      alert('Produit modifié avec succès !');
    } else {
      // Mode ajout : créer un nouveau produit
      await productService.create(productData as any);
      console.log('Produit ajouté (API):', productData);
      alert('Produit ajouté avec succès !');
    }

    // Rediriger vers la liste des produits
    router.push('/liste-produits');
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde du produit :', error);
    const message = error.response?.data?.details || error.response?.data?.error || error.message || 'Une erreur est survenue';
    alert(`Erreur lors de la sauvegarde : ${message}`);
  } finally {
    loading.value = false;
  }
};
</script>
