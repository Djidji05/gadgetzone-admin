<template>
  <div class="px-6 py-8 pb-24">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Académie Vendeur</h1>
        <p class="text-gray-500 mt-1">Gérez les vidéos, guides et ressources pour former les vendeurs HTFasil.</p>
      </div>
      <button @click="openCreateModal" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
        <i class="fas fa-plus"></i> Nouveau Contenu
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 mb-8">
      <div class="flex-1 relative">
        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input type="text" v-model="search" placeholder="Rechercher par titre..." class="w-full bg-gray-50 border-transparent rounded-xl py-2.5 pl-10 pr-4 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-sm">
      </div>
      <select v-model="filterType" class="bg-gray-50 border-transparent rounded-xl py-2.5 px-4 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium text-sm text-gray-700 w-48 font-semibold">
        <option value="">Tous les types</option>
        <option value="video">Vidéos</option>
        <option value="article">Articles & Guides</option>
      </select>
    </div>

    <!-- Content List -->
    <div class="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400">
        <i class="fas fa-circle-notch animate-spin text-3xl text-blue-600 mb-4"></i>
        <p>Chargement des cours...</p>
      </div>

      <div v-else-if="filteredCourses.length === 0" class="p-16 text-center text-gray-400">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
             <i class="fas fa-graduation-cap text-3xl"></i>
        </div>
        <p class="text-lg font-bold text-gray-500">Aucun contenu trouvé</p>
        <p class="text-sm mt-1">Commencez par ajouter votre premier cours ou guide.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-gray-50/80 text-gray-500 border-b border-gray-100 uppercase text-[10px] tracking-widest font-bold">
            <tr>
              <th class="py-4 px-6 w-16">Miniature</th>
              <th class="py-4 px-6">Titre & Catégorie</th>
              <th class="py-4 px-6 whitespace-nowrap">Type du Contenu</th>
              <th class="py-4 px-6">Statut</th>
              <th class="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="course in filteredCourses" :key="course.id" class="hover:bg-blue-50/30 transition-colors group cursor-pointer" @dblclick="openEditModal(course)">
              <td class="py-4 px-6">
                <div class="w-14 h-10 rounded-lg bg-gray-100 bg-cover bg-center shadow-sm relative overflow-hidden" :style="{ backgroundImage: `url(${course.thumbnail || 'https://via.placeholder.com/150'})` }">
                     <div v-if="course.type === 'video'" class="absolute inset-0 bg-black/20 flex items-center justify-center"><i class="fas fa-play text-white text-[10px]"></i></div>
                </div>
              </td>
              <td class="py-4 px-6">
                <p class="font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1 text-[13px]">{{ course.title }}</p>
                <div class="mt-1 flex items-center gap-2">
                    <span class="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md" 
                          :class="getCategoryColor(course.category)">
                        {{ course.category }}
                    </span>
                    <span class="text-xs text-gray-400 flex items-center gap-1"><i class="far fa-clock"></i> {{ course.type === 'video' ? course.duration : course.readTime + ' min' }}</span>
                </div>
              </td>
              <td class="py-4 px-6 whitespace-nowrap">
                  <span v-if="course.type === 'video'" class="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-lg w-fit text-xs">
                      <i class="fas fa-video"></i> Vidéo
                  </span>
                  <span v-else class="flex items-center gap-1.5 text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-lg w-fit text-xs">
                      <i class="fas fa-file-alt"></i> Article
                  </span>
              </td>
              <td class="py-4 px-6">
                  <span class="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border" 
                        :class="course.status === 'published' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'">
                      {{ course.status === 'published' ? 'Publié' : 'Brouillon' }}
                  </span>
              </td>
              <td class="py-4 px-6 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal(course)" class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center">
                      <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button @click="confirmDelete(course)" class="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center">
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 mx-auto flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        <!-- Header -->
        <div class="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-xl font-black text-gray-900 flex items-center gap-3">
              <i class="fas" :class="editingCourse ? 'fa-edit text-blue-500' : 'fa-plus-circle text-green-500'"></i> 
              {{ editingCourse ? 'Modifier le cours' : 'Ajouter un nouveau cours' }}
          </h3>
          <button @click="closeModal" class="w-8 h-8 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all flex items-center justify-center shadow-sm">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
        
        <!-- Form Content -->
        <form @submit.prevent="saveCourse" class="overflow-y-auto flex-1 p-8 no-scrollbar">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <!-- Left Side (Basic Info) -->
                <div class="space-y-5">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Titre du cours</label>
                        <input type="text" v-model="form.title" required class="w-full bg-gray-50 border-transparent rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-bold text-gray-900 border" placeholder="Ex: Maîtriser la photo produit...">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Description courte</label>
                        <textarea v-model="form.description" rows="3" required class="w-full bg-gray-50 border-transparent rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-sm text-gray-700 border resize-none" placeholder="Un résumé attractif pour donner envie d'apprendre..."></textarea>
                    </div>
                </div>

                <!-- Right Side (Settings) -->
                <div class="space-y-5">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Format du contenu</label>
                            <div class="flex gap-2">
                                <label class="flex-1 cursor-pointer">
                                    <input type="radio" v-model="form.type" value="video" class="peer sr-only">
                                    <div class="p-3 text-center rounded-xl border-2 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 text-gray-400 border-gray-100 font-bold text-xs transition-all hover:border-blue-200">
                                        <i class="fas fa-video block text-lg mb-1"></i> Vidéo
                                    </div>
                                </label>
                                <label class="flex-1 cursor-pointer">
                                    <input type="radio" v-model="form.type" value="article" class="peer sr-only">
                                    <div class="p-3 text-center rounded-xl border-2 peer-checked:border-purple-600 peer-checked:bg-purple-50 peer-checked:text-purple-700 text-gray-400 border-gray-100 font-bold text-xs transition-all hover:border-purple-200">
                                        <i class="fas fa-file-alt block text-lg mb-1"></i> Article
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div>
                             <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Catégorie</label>
                             <select v-model="form.category" required class="w-full h-full max-h-[70px] bg-gray-50 border-transparent rounded-xl p-3.5 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-bold text-sm text-gray-700 border">
                                <option value="Débuter">🏁 Débuter</option>
                                <option value="Marketing">📈 Marketing</option>
                                <option value="Expédition">📦 Expédition</option>
                                <option value="Règles">⚖️ Règles</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                         <div v-show="form.type === 'video'">
                             <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Durée (ex: 12:30)</label>
                             <input type="text" v-model="form.duration" class="w-full bg-gray-50 border-transparent rounded-xl p-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-mono text-sm border" placeholder="00:00">
                         </div>
                         <div v-show="form.type === 'article'">
                             <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Temps lecture (min)</label>
                             <input type="number" v-model="form.readTime" class="w-full bg-gray-50 border-transparent rounded-xl p-3 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-sm border font-bold" placeholder="5">
                         </div>
                         
                         <div>
                             <label class="block text-xs font-bold text-gray-500 uppercase mb-2">Statut publication</label>
                             <select v-model="form.status" required class="w-full bg-gray-50 border-transparent rounded-xl p-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-bold text-sm text-gray-700 border">
                                <option value="published">Publié (Visible)</option>
                                <option value="draft">Brouillon (Caché)</option>
                            </select>
                         </div>
                    </div>
                </div>
            </div>

            <hr class="border-gray-100 mb-8 w-[150%] -ml-10">

            <!-- Type Specific Content -->
            <div class="mb-8">
                <div v-if="form.type === 'video'" class="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl">
                    <h4 class="font-black text-blue-900 mb-4 flex items-center gap-2"><i class="fas fa-play-circle text-blue-500"></i> Configuration Vidéo</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-xs font-bold text-blue-700 uppercase mb-2">URL Embed (ex: Youtube)</label>
                            <input type="url" v-model="form.url" class="w-full bg-white border border-blue-200 rounded-xl p-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all text-sm text-gray-700" placeholder="https://www.youtube.com/embed/... ">
                            <p class="text-[10px] text-blue-500 mt-1 font-medium"><i class="fas fa-info-circle"></i> Utilisez l'URL d'intégration /embed/ de Youtube pour un affichage optimal.</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-blue-700 uppercase mb-2">URL Miniature (Thumbnail)</label>
                            <input type="url" v-model="form.thumbnail" class="w-full bg-white border border-blue-200 rounded-xl p-3.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 transition-all text-sm text-gray-700" placeholder="https://image/thumb.jpg">
                        </div>
                    </div>
                </div>

                <div v-else class="bg-purple-50/50 border border-purple-100 p-6 rounded-2xl">
                    <h4 class="font-black text-purple-900 mb-4 flex items-center gap-2"><i class="fas fa-book-open text-purple-500"></i> Contenu de l'Article</h4>
                    <div class="mb-4">
                        <label class="block text-xs font-bold text-purple-700 uppercase mb-2">URL Image Principale (Cover)</label>
                        <input type="url" v-model="form.thumbnail" class="w-full bg-white border border-purple-200 rounded-xl p-3.5 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all text-sm text-gray-700" placeholder="https://image/cover.jpg">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-purple-700 uppercase mb-2">Contenu Riche (HTML autorisée)</label>
                        <!-- Basic textarea for code simplicity. For real prod, a WYSIWYG editor like Quill/TinyMCE should be here -->
                        <textarea v-model="form.content" rows="10" class="w-full bg-white border border-purple-200 rounded-xl p-4 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all text-sm font-mono leading-relaxed" placeholder="<h3>Mon Titre</h3><p>Mon texte ici...</p>"></textarea>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="flex justify-end gap-3 pb-4">
              <button type="button" @click="closeModal" class="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                Annuler
              </button>
              <button type="submit" :disabled="saving" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
                <i v-if="saving" class="fas fa-circle-notch animate-spin"></i>
                <i v-else class="fas fa-check"></i>
                {{ editingCourse ? 'Enregistrer les modifications' : 'Créer et publier' }}
              </button>
            </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api'; // Or standard axios if api is not present in admin

// Type definition loosely based on our DB model
interface AcademyCourse {
  id?: number;
  title: string;
  description: string;
  type: 'video' | 'article';
  category: string;
  url: string | null;
  content: string | null;
  thumbnail: string | null;
  duration: string | null;
  readTime: number | null;
  status: 'published' | 'draft';
}

const courses = ref<AcademyCourse[]>([]);
const loading = ref(true);
const saving = ref(false);

const search = ref('');
const filterType = ref('');

const isModalOpen = ref(false);
const editingCourse = ref<AcademyCourse | null>(null);

const initialFormState: AcademyCourse = {
  title: '',
  description: '',
  type: 'video',
  category: 'Débuter',
  url: '',
  content: '',
  thumbnail: '',
  duration: '',
  readTime: 5,
  status: 'published'
};

const form = reactive({ ...initialFormState });

onMounted(async () => {
  await fetchCourses();
});

const fetchCourses = async () => {
  loading.value = true;
  try {
    const res = await api.get('/academy/all');
    courses.value = res.data;
  } catch (err) {
    console.error("Erreur de récupération de l'académie", err);
    // Afficher toast erreur
  } finally {
    loading.value = false;
  }
};

const filteredCourses = computed(() => {
  return courses.value.filter(c => {
    const s = search.value.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(s) || c.category.toLowerCase().includes(s);
    const matchesType = filterType.value === '' || c.type === filterType.value;
    return matchesSearch && matchesType;
  });
});

const openCreateModal = () => {
  Object.assign(form, initialFormState);
  editingCourse.value = null;
  isModalOpen.value = true;
};

const openEditModal = (course: AcademyCourse) => {
  editingCourse.value = course;
  Object.assign(form, JSON.parse(JSON.stringify(course))); // deep copy to avoid direct mutation
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveCourse = async () => {
  saving.value = true;
  try {
    if (editingCourse.value && editingCourse.value.id) {
       await api.put(`/academy/${editingCourse.value.id}`, form);
    } else {
       await api.post('/academy', form);
    }
    await fetchCourses();
    closeModal();
  } catch (e) {
    console.error("Erreur save course", e);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (course: AcademyCourse) => {
    if(confirm(`Êtes-vous sûr de vouloir supprimer '${course.title}' ? Cette action est irréversible.`)) {
        try {
            await api.delete(`/academy/${course.id}`);
            await fetchCourses();
        } catch (e) {
            console.error("Erreur delete course", e);
        }
    }
};

const getCategoryColor = (category: string) => {
    switch(category) {
        case 'Débuter': return 'bg-green-100 text-green-700';
        case 'Marketing': return 'bg-blue-100 text-blue-700';
        case 'Expédition': return 'bg-orange-100 text-orange-700';
        case 'Règles': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.animate-in {
    animation-duration: 0.2s;
    animation-fill-mode: both;
}
@keyframes zoomIn95 {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}
.zoom-in-95 { animation-name: zoomIn95; }
</style>
