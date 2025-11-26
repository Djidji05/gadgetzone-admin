<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
        <p class="text-gray-600">Suivez les revenus et les transactions</p>
      </div>
      <div class="flex space-x-3">
        <button class="btn btn-secondary">
          <i class="fas fa-download mr-2"></i>
          Exporter
        </button>
        <button class="btn btn-primary">
          <i class="fas fa-plus mr-2"></i>
          Nouveau Paiement
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Revenus Totaux</p>
            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.totalRevenue) }}</p>
            <p class="text-sm text-green-600 mt-1">
              <i class="fas fa-arrow-up mr-1"></i>
              +{{ stats.revenueGrowth }}% ce mois
            </p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-dollar-sign text-green-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Paiements Aujourd'hui</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.todayPayments }}</p>
            <p class="text-sm text-blue-600 mt-1">
              <i class="fas fa-arrow-up mr-1"></i>
              +{{ stats.todayGrowth }}% vs hier
            </p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-credit-card text-blue-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Taux de Succès</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.successRate }}%</p>
            <p class="text-sm text-green-600 mt-1">
              <i class="fas fa-check mr-1"></i>
              Excellent
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-purple-600"></i>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Paiements En Attente</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.pendingPayments }}</p>
            <p class="text-sm text-orange-600 mt-1">
              <i class="fas fa-clock mr-1"></i>
              À traiter
            </p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-hourglass-half text-orange-600"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques et Liste -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Graphique des revenus -->
      <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Évolution des Revenus</h2>
          <select v-model="selectedPeriod" class="form-select">
            <option value="7j">7 derniers jours</option>
            <option value="30j">30 derniers jours</option>
            <option value="90j">90 derniers jours</option>
            <option value="1an">1 an</option>
          </select>
        </div>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div class="text-center">
            <i class="fas fa-chart-area text-4xl text-gray-400 mb-2"></i>
            <p class="text-gray-500">Graphique des revenus</p>
            <p class="text-sm text-gray-400">Intégration Chart.js prévue</p>
          </div>
        </div>
      </div>

      <!-- Méthodes de paiement -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Méthodes de Paiement</h2>
        <div class="space-y-4">
          <div v-for="method in paymentMethods" :key="method.name" class="flex items-center justify-between">
            <div class="flex items-center">
              <div :class="`w-10 h-10 rounded-lg flex items-center justify-center ${method.bgColor}`">
                <i :class="`${method.icon} ${method.color}`"></i>
              </div>
              <div class="ml-3">
                <p class="font-medium text-gray-900">{{ method.name }}</p>
                <p class="text-sm text-gray-500">{{ method.count }} transactions</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">{{ method.percentage }}%</p>
              <p class="text-sm text-gray-500">{{ formatCurrency(method.amount) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des paiements récents -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Paiements Récents</h2>
          <div class="flex space-x-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="form-input w-64"
            />
            <select v-model="statusFilter" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Méthode
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <i class="fas fa-user text-gray-500"></i>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ payment.customer }}</div>
                    <div class="text-sm text-gray-500">{{ payment.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ formatCurrency(payment.amount) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <i :class="getPaymentMethodIcon(payment.method)" class="mr-2"></i>
                  <span class="text-sm text-gray-900">{{ payment.method }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(payment.status)">
                  {{ getStatusText(payment.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(payment.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">Détails</button>
                <button class="text-gray-600 hover:text-gray-900">Facture</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-700">
            Affichage de <span class="font-medium">1</span> à <span class="font-medium">10</span> sur
            <span class="font-medium">{{ filteredPayments.length }}</span> résultats
          </p>
          <div class="flex space-x-2">
            <button class="btn btn-secondary btn-sm">Précédent</button>
            <button class="btn btn-primary btn-sm">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Définir le nom du composant pour ESLint
defineOptions({
  name: 'PaiementsView'
})

// Debug log
console.log('🔥 Paiements component is loading!')

// État
const selectedPeriod = ref('30j')
const searchQuery = ref('')
const statusFilter = ref('')

// Données simulées
const stats = ref({
  totalRevenue: 456789,
  revenueGrowth: 12.5,
  todayPayments: 23,
  todayGrowth: 8.3,
  successRate: 98.2,
  pendingPayments: 5
})

const paymentMethods = ref([
  {
    name: 'Carte de crédit',
    icon: 'fas fa-credit-card',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    count: 156,
    percentage: 65,
    amount: 289456
  },
  {
    name: 'Natcash',
    icon: 'fas fa-mobile-alt',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    count: 45,
    percentage: 19,
    amount: 84789
  },
  {
    name: 'Mon Cash Wise',
    icon: 'fas fa-wallet',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    count: 28,
    percentage: 12,
    amount: 53456
  },
  {
    name: 'Zelle',
    icon: 'fas fa-university',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    count: 11,
    percentage: 4,
    amount: 29088
  }
])

const payments = ref([
  {
    id: 1,
    customer: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    amount: 299.99,
    method: 'Carte de crédit',
    status: 'completed',
    date: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    customer: 'Marie Curie',
    email: 'marie.curie@email.com',
    amount: 599.99,
    method: 'Natcash',
    status: 'completed',
    date: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    customer: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    amount: 149.99,
    method: 'Mon Cash Wise',
    status: 'pending',
    date: '2024-01-15T08:45:00Z'
  },
  {
    id: 4,
    customer: 'Sophie Laurent',
    email: 'sophie.laurent@email.com',
    amount: 899.99,
    method: 'Carte de crédit',
    status: 'failed',
    date: '2024-01-14T16:20:00Z'
  },
  {
    id: 5,
    customer: 'Bernard Petit',
    email: 'bernard.petit@email.com',
    amount: 399.99,
    method: 'Zelle',
    status: 'completed',
    date: '2024-01-14T14:10:00Z'
  }
])

// Computed
const filteredPayments = computed(() => {
  return payments.value.filter(payment => {
    const matchesSearch = payment.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         payment.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = !statusFilter.value || payment.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// Méthodes
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-HT', {
    style: 'currency',
    currency: 'HTG'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-HT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPaymentMethodIcon = (method: string) => {
  const icons: { [key: string]: string } = {
    'Carte de crédit': 'fas fa-credit-card text-blue-600',
    'Natcash': 'fas fa-mobile-alt text-green-600',
    'Mon Cash Wise': 'fas fa-wallet text-purple-600',
    'Zelle': 'fas fa-university text-orange-600'
  }
  return icons[method] || 'fas fa-question-circle text-gray-600'
}

const getStatusClass = (status: string) => {
  const classes: { [key: string]: string } = {
    'completed': 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    'pending': 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    'failed': 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
    'refunded': 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts: { [key: string]: string } = {
    'completed': 'Complété',
    'pending': 'En attente',
    'failed': 'Échoué',
    'refunded': 'Remboursé'
  }
  return texts[status] || status
}

onMounted(() => {
  // Charger les données depuis l'API
  console.log('Page Paiements montée')
})
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 hover:bg-gray-300;
}

.btn-sm {
  @apply px-3 py-1.5 text-sm;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white;
}
</style>
