<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
        <p class="text-gray-600">Suivez les revenus et les transactions</p>
      </div>
      <div class="flex space-x-3">
        <button class="btn btn-secondary flex items-center bg-red-600 hover:bg-red-700 text-white border-none shadow-sm" @click="handleExport">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Exporter en PDF
        </button>
        <button class="btn btn-primary" @click="handleNewPayment">
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

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          @click="activeTab = 'payments'"
          :class="[
            activeTab === 'payments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          <i class="fas fa-shopping-cart mr-2"></i>
          Paiements Clients
        </button>
        <button
          @click="activeTab = 'withdrawals'"
          :class="[
            activeTab === 'withdrawals'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          <i class="fas fa-hand-holding-usd mr-2"></i>
          Retraits Vendeurs
          <span v-if="pendingWithdrawalsCount > 0" class="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
            {{ pendingWithdrawalsCount }}
          </span>
        </button>
        <button
          @click="activeTab = 'refunds'; loadRefundsData()"
          :class="[
            activeTab === 'refunds'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          <i class="fas fa-undo-alt mr-2"></i>
          Remboursements
          <span v-if="refundStats.pending > 0" class="ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
            {{ refundStats.pending }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Client Payments Tab Content -->
    <div v-if="activeTab === 'payments'" class="space-y-6">
      <!-- Graphiques et Liste -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Graphique des revenus -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-lg font-semibold text-gray-900">Évolution des Revenus</h2>
            <select v-model="selectedPeriod" class="form-select w-48" @change="loadRevenueData">
              <option value="7j">7 derniers jours</option>
              <option value="30j">30 derniers jours</option>
              <option value="90j">90 derniers jours</option>
            </select>
          </div>
          <div class="h-64">
            <apexchart
              v-if="!isLoadingRevenue"
              type="area"
              height="100%"
              :options="chartOptions"
              :series="chartSeries"
            />
            <div v-else class="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Vendor Withdrawals Tab Content -->
    <div v-else-if="activeTab === 'withdrawals'" class="space-y-6">
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-900">Demandes de Retrait Vendeurs</h2>
            <div class="flex space-x-3">
              <select v-model="payoutStatusFilter" class="form-select" @change="fetchWithdrawals">
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="completed">Traités</option>
                <option value="failed">Rejetés</option>
              </select>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boutique</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="isWithdrawalsLoading">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                  <i class="fas fa-spinner fa-spin mr-2"></i> Chargement...
                </td>
              </tr>
              <tr v-else-if="withdrawals.length === 0">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">Aucune demande de retrait trouvée</td>
              </tr>
              <tr v-for="payout in withdrawals" :key="payout.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-8 h-8 rounded bg-blue-50 flex items-center justify-center mr-3">
                      <i class="fas fa-store text-blue-500 text-xs"></i>
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ payout.store?.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-gray-900">{{ formatCurrency(payout.amount) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                  {{ payout.method }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(payout.status)">
                    {{ getStatusText(payout.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(payout.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <template v-if="payout.status === 'pending'">
                    <button @click="approveWithdrawal(payout)" class="text-green-600 hover:text-green-900 mr-3">Approuver</button>
                    <button @click="rejectWithdrawal(payout)" class="text-red-600 hover:text-red-900">Rejeter</button>
                  </template>
                  <span v-else class="text-gray-400">Aucune action</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Remboursements Tab Content -->
    <div v-if="activeTab === 'refunds'" class="space-y-6">

      <!-- Stats rapides -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-orange-600">{{ refundStats.pending }}</p>
          <p class="text-sm text-orange-700">En attente</p>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-blue-600">{{ refundStats.processing }}</p>
          <p class="text-sm text-blue-700">En traitement</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-green-600">{{ refundStats.completed }}</p>
          <p class="text-sm text-green-700">Complétés</p>
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p class="text-2xl font-bold text-gray-700">{{ formatCurrency(refundStats.total_refunded) }}</p>
          <p class="text-sm text-gray-500">Total remboursé</p>
        </div>
      </div>

      <!-- Commandes annulées à rembourser -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-clock text-orange-500 mr-2"></i>
            Commandes annulées à rembourser
          </h2>
          <button @click="loadRefundsData" class="text-sm text-blue-600 hover:underline">
            <i class="fas fa-sync-alt mr-1"></i> Actualiser
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode paiement</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annulée le</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="isLoadingRefunds">
                <td colspan="6" class="px-6 py-10 text-center">
                  <i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
                </td>
              </tr>
              <tr v-else-if="pendingRefundOrders.length === 0">
                <td colspan="6" class="px-6 py-10 text-center text-gray-500">
                  <i class="fas fa-check-circle text-green-400 text-3xl mb-2 block"></i>
                  Aucune commande annulée en attente de remboursement
                </td>
              </tr>
              <tr v-for="order in pendingRefundOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="font-mono text-sm font-medium text-gray-900">{{ order.order_number }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ order.customer?.name }}</p>
                    <p class="text-xs text-gray-500">{{ order.customer?.email }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-bold text-gray-900">{{ formatCurrency(order.total_amount) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="order.payment_method" class="text-sm text-gray-700">{{ order.payment_method }}</span>
                  <span v-else class="text-xs text-orange-500 italic">Non spécifié</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.cancelled_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <button
                    @click="openRefundModal(order)"
                    class="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <i class="fas fa-undo-alt mr-1"></i> Rembourser
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Historique des remboursements -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">
            <i class="fas fa-history text-gray-500 mr-2"></i>
            Historique des remboursements
          </h2>
          <select v-model="refundStatusFilter" @change="loadRefundHistory" class="form-select w-44 text-sm">
            <option value="all">Tous</option>
            <option value="pending">En attente</option>
            <option value="processing">En traitement</option>
            <option value="completed">Complétés</option>
            <option value="failed">Échoués</option>
          </select>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant original</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frais</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remboursé</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="refundHistory.length === 0">
                <td colspan="8" class="px-6 py-10 text-center text-gray-500">Aucun remboursement enregistré</td>
              </tr>
              <tr v-for="refund in refundHistory" :key="refund.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm">
                  CMD-{{ String(refund.order_id).padStart(5, '0') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <p class="text-sm font-medium text-gray-900">{{ refund.customer?.name }}</p>
                  <p class="text-xs text-gray-500">{{ refund.customer?.email }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ formatCurrency(refund.original_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  -{{ formatCurrency(refund.fee_amount) }}
                  <span class="text-xs text-gray-400">({{ refund.fee_rate }}%)</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                  {{ formatCurrency(refund.refund_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ refund.payment_method }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRefundStatusClass(refund.status)">
                    {{ getRefundStatusText(refund.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <template v-if="refund.status === 'pending'">
                    <button @click="markProcessing(refund)" class="text-blue-600 hover:text-blue-800 mr-2">Traiter</button>
                    <button @click="markFailed(refund)" class="text-red-600 hover:text-red-800">Échec</button>
                  </template>
                  <template v-else-if="refund.status === 'processing'">
                    <button @click="markCompleted(refund)" class="text-green-600 hover:text-green-800">Confirmer</button>
                  </template>
                  <span v-else class="text-gray-400">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Remboursement -->
    <div v-if="showRefundModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900">
            <i class="fas fa-undo-alt text-red-500 mr-2"></i>
            Créer un remboursement
          </h3>
          <button @click="showRefundModal = false" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Infos commande -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500">Commande</p>
            <p class="font-bold text-gray-900">{{ selectedRefundOrder?.order_number }}</p>
            <p class="text-sm text-gray-600 mt-1">Client : {{ selectedRefundOrder?.customer?.name }}</p>
            <p class="text-sm font-bold text-gray-900 mt-1">Montant : {{ formatCurrency(selectedRefundOrder?.total_amount || 0) }}</p>
          </div>

          <!-- Méthode de remboursement -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Méthode de remboursement *</label>
            <select v-model="refundForm.payment_method" class="form-select w-full" @change="updateRefundCalculation">
              <option value="">Sélectionner...</option>
              <option value="MonCash">MonCash (frais 2%)</option>
              <option value="Natcash">Natcash (frais 2%)</option>
              <option value="Carte de crédit">Carte de crédit (frais 3%)</option>
              <option value="Zelle">Zelle (frais 1%)</option>
              <option value="Espèces">Espèces (frais 0%)</option>
              <option value="Virement">Virement (frais 0%)</option>
            </select>
          </div>

          <!-- Frais personnalisés -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Taux de frais (%) 
              <span class="text-gray-400 font-normal">— laisser vide pour taux par défaut</span>
            </label>
            <input
              v-model.number="refundForm.fee_rate_override"
              type="number" min="0" max="100" step="0.5"
              placeholder="Ex: 2.5"
              class="form-input w-full"
              @input="updateRefundCalculation"
            />
          </div>

          <!-- Calcul en temps réel -->
          <div v-if="refundForm.payment_method" class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-1">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Montant original</span>
              <span class="font-medium">{{ formatCurrency(selectedRefundOrder?.total_amount || 0) }}</span>
            </div>
            <div class="flex justify-between text-sm text-red-600">
              <span>Frais ({{ refundCalculation.feeRate }}%)</span>
              <span>- {{ formatCurrency(refundCalculation.feeAmount) }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-green-700 border-t border-blue-200 pt-2 mt-2">
              <span>Montant à rembourser</span>
              <span>{{ formatCurrency(refundCalculation.refundAmount) }}</span>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
            <textarea
              v-model="refundForm.notes"
              rows="2"
              placeholder="Raison de l'annulation, instructions spéciales..."
              class="form-input w-full resize-none"
            ></textarea>
          </div>
        </div>

        <div class="flex space-x-3 mt-6">
          <button @click="showRefundModal = false" class="btn btn-secondary flex-1">Annuler</button>
          <button
            @click="submitRefund"
            :disabled="!refundForm.payment_method || isSubmittingRefund"
            class="btn btn-primary flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <i class="fas fa-spinner fa-spin mr-2" v-if="isSubmittingRefund"></i>
            <i class="fas fa-undo-alt mr-2" v-else></i>
            Créer le remboursement
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { adminService, refundService } from '@/services/api'
import { paiementsService } from '@/services/paiements'
import { useUIStore } from '@/stores/ui'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const uiStore = useUIStore()

// Définir le nom du composant pour ESLint
defineOptions({
  name: 'PaiementsView'
})

// Debug log
console.log('🔥 Paiements component is loading!')

// État
const activeTab = ref('payments')
const selectedPeriod = ref('30j')
const searchQuery = ref('')
const statusFilter = ref('')
const isLoadingPaiements = ref(false)

const stats = ref({
  totalRevenue: 0,
  revenueGrowth: 0,
  todayPayments: 0,
  todayGrowth: 0,
  successRate: 0,
  pendingPayments: 0
})

const paymentMethods = ref<any[]>([])
const payments = ref<any[]>([])
const withdrawals = ref<any[]>([])
const isWithdrawalsLoading = ref(false)
const isLoadingRevenue = ref(false)
const payoutStatusFilter = ref('pending')
const totalPayments = ref(0)
const currentPage = ref(1)

// Refunds state
const isLoadingRefunds = ref(false)
const pendingRefundOrders = ref<any[]>([])
const refundHistory = ref<any[]>([])
const refundStatusFilter = ref('all')
const refundStats = ref({ pending: 0, processing: 0, completed: 0, failed: 0, total_refunded: 0, total_fees_collected: 0 })
const showRefundModal = ref(false)
const selectedRefundOrder = ref<any>(null)
const isSubmittingRefund = ref(false)
const refundForm = ref({
  payment_method: '',
  fee_rate_override: null as number | null,
  notes: ''
})
const refundCalculation = ref({ feeRate: 0, feeAmount: 0, refundAmount: 0 })

const FEE_RATES: Record<string, number> = {
  'MonCash': 2, 'Natcash': 2, 'Carte de crédit': 3, 'Zelle': 1, 'Espèces': 0, 'Virement': 0
}

// Watch for changes in search and status to reset page and reload
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  loadPaiementsData()
})

// Refresh data when switching tabs
watch(activeTab, (newTab) => {
  if (newTab === 'withdrawals') {
    fetchWithdrawals()
  } else if (newTab === 'refunds') {
    loadRefundsData()
  }
})

// Chart Data
const chartSeries = ref<{ name: string; data: number[] }[]>([{
  name: 'Revenus',
  data: []
}])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    sparkline: { enabled: false }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#3b82f6'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100]
    }
  },
  xaxis: {
    categories: revenueCategories.value,
    labels: { show: true },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatCurrency(val)
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val)
    }
  },
  grid: {
    borderColor: '#f1f1f1',
    strokeDashArray: 4
  }
}))

const revenueCategories = ref<string[]>([])

const pendingWithdrawalsCount = computed(() => {
  return withdrawals.value.filter(w => w.status === 'pending').length
})

// Computed
const filteredPayments = computed(() => {
  // If we wanted to keep local filtering as well, but with server-side it's better to trust the API
  return payments.value
})

// Méthodes
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount) + ' HTG'
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

// ... Existing methods ...

const fetchWithdrawals = async () => {
  try {
    isWithdrawalsLoading.value = true
    const params = payoutStatusFilter.value !== 'all' ? { status: payoutStatusFilter.value } : {}
    const response = await adminService.getPayouts(params)
    withdrawals.value = response.payouts || []
  } catch (error) {
    console.error('Erreur lors du chargement des retraits:', error)
    uiStore.addToast('Erreur lors du chargement des retraits', 'error')
  } finally {
    isWithdrawalsLoading.value = false
  }
}

const approveWithdrawal = async (payout: any) => {
  const confirmed = await uiStore.confirm({
    title: 'Approuver le retrait',
    message: `Confirmez-vous le paiement de ${formatCurrency(payout.amount)} à la boutique ${payout.store?.name} ?`,
    confirmText: 'Confirmer le paiement',
    type: 'info'
  })

  if (!confirmed) return

  const reference = await uiStore.prompt({
    title: 'Référence de transaction',
    message: 'Veuillez saisir la référence de la transaction (ex: ID MonCash, Numéro de virement).',
    placeholder: 'Référence...'
  })

  if (reference === null) return

  try {
    await adminService.approvePayout(payout.id, { reference })
    uiStore.addToast('Retrait approuvé avec succès', 'success')
    await fetchWithdrawals()
  } catch (error) {
    console.error('Erreur approbation retrait:', error)
    uiStore.addToast('Erreur lors de l\'approbation', 'error')
  }
}

const rejectWithdrawal = async (payout: any) => {
  const reason = await uiStore.prompt({
    title: 'Motif du rejet',
    message: `Pourquoi rejetez-vous la demande de retrait de ${payout.store?.name} ?`,
    placeholder: 'Motif du rejet...'
  })

  if (!reason) return

  try {
    await adminService.rejectPayout(payout.id, { reason })
    uiStore.addToast('Retrait rejeté', 'info')
    await fetchWithdrawals()
  } catch (error) {
    console.error('Erreur rejet retrait:', error)
    uiStore.addToast('Erreur lors du rejet', 'error')
  }
}

const loadPaiementsData = async () => {
  try {
    isLoadingPaiements.value = true
    const [statsData, methodsData, paymentsData] = await Promise.all([
      paiementsService.getStats(),
      paiementsService.getPaymentMethods(),
      paiementsService.getPaiements({ 
        search: searchQuery.value, 
        status: statusFilter.value,
        page: currentPage.value,
        limit: 10
      })
    ])
    
    stats.value = statsData
    totalPayments.value = paymentsData.total
    paymentMethods.value = methodsData.map(m => {
      // Map icons and colors based on name
      const map: Record<string, any> = {
        'Carte de crédit': { icon: 'fas fa-credit-card', color: 'text-blue-600', bgColor: 'bg-blue-100' },
        'Natcash': { icon: 'fas fa-mobile-alt', color: 'text-green-600', bgColor: 'bg-green-100' },
        'Mon Cash Wise': { icon: 'fas fa-wallet', color: 'text-purple-600', bgColor: 'bg-purple-100' },
        'Zelle': { icon: 'fas fa-university', color: 'text-orange-600', bgColor: 'bg-orange-100' }
      }
      return { ...m, ...map[m.name] || { icon: 'fas fa-money-bill', color: 'text-gray-600', bgColor: 'bg-gray-100' } }
    })
    payments.value = paymentsData.payments
    await loadRevenueData()
  } catch (error) {
    console.error('Erreur chargement données paiements:', error)
    uiStore.addToast('Erreur lors du chargement des paiements', 'error')
  } finally {
    isLoadingPaiements.value = false
  }
}

const loadRevenueData = async () => {
  try {
    isLoadingRevenue.value = true
    const data = await paiementsService.getRevenueData(selectedPeriod.value)
    chartSeries.value = [{
      name: 'Revenus',
      data: data.map(d => d.revenue)
    }]
    revenueCategories.value = data.map(d => d.date)
  } catch (error) {
    console.error('Erreur chargement graphique revenus:', error)
  } finally {
    isLoadingRevenue.value = false
  }
}

const handleExport = () => {
  try {
    const doc = new jsPDF()
    const timestamp = new Date().toISOString().split('T')[0]
    
    // Header Style HTFasil
    doc.setFontSize(22)
    doc.setTextColor(220, 38, 38)
    doc.text('HTFasil', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Gestion des Paiements et Transactions', 14, 26)

    let title = ''
    let head: string[][] = []
    let body: any[][] = []

    if (activeTab.value === 'payments') {
      title = 'Export des Paiements Clients'
      head = [['Client', 'Email', 'Montant', 'Méthode', 'Statut', 'Date']]
      body = payments.value.map(p => [
        p.customer,
        p.email,
        formatCurrency(p.amount),
        p.method,
        getStatusText(p.status),
        p.date
      ])
    } else if (activeTab.value === 'withdrawals') {
      title = 'Export des Retraits Vendeurs'
      head = [['Boutique', 'Montant', 'Méthode', 'Statut', 'Date']]
      body = withdrawals.value.map(w => [
        w.store?.name || 'N/A',
        formatCurrency(w.amount),
        w.method,
        getStatusText(w.status),
        formatDate(w.created_at)
      ])
    } else if (activeTab.value === 'refunds') {
      title = 'Export des Remboursements'
      head = [['ID Commande', 'Client', 'Montant', 'Frais', 'Remboursé', 'Date']]
      body = refundHistory.value.map(r => [
        `CMD-${r.order_id}`,
        r.customer?.name || 'N/A',
        formatCurrency(r.original_amount),
        formatCurrency(r.fee_amount),
        formatCurrency(r.refund_amount),
        formatDate(r.created_at || new Date().toISOString())
      ])
    }

    doc.setFontSize(16)
    doc.setTextColor(31, 41, 55)
    doc.text(title, 14, 40)
    
    doc.setFontSize(10)
    doc.text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, 14, 48)

    autoTable(doc, {
      startY: 55,
      head: head,
      body: body,
      headStyles: { fillColor: [220, 38, 38], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 9 }
    })

    doc.save(`${activeTab.value}_export_${timestamp}.pdf`)
    uiStore.addToast('Export PDF généré avec succès', 'success')
  } catch (error) {
    console.error('Erreur export PDF:', error)
    uiStore.addToast('Erreur lors de la génération du PDF', 'error')
  }
}

const handleNewPayment = () => {
  uiStore.addToast('Fonctionnalité de création de paiement manuel en cours de développement', 'info')
}

// Refund methods
const loadRefundsData = async () => {
  isLoadingRefunds.value = true
  try {
    const [pending, stats, history] = await Promise.all([
      refundService.getPendingOrders(),
      refundService.getStats(),
      refundService.getRefunds({ status: refundStatusFilter.value })
    ])
    pendingRefundOrders.value = pending
    refundStats.value = stats
    refundHistory.value = history.refunds || []
  } catch (error) {
    console.error('Erreur chargement remboursements:', error)
    uiStore.addToast('Erreur lors du chargement des remboursements', 'error')
  } finally {
    isLoadingRefunds.value = false
  }
}

const loadRefundHistory = async () => {
  try {
    const data = await refundService.getRefunds({ status: refundStatusFilter.value })
    refundHistory.value = data.refunds || []
  } catch (error) {
    console.error('Erreur historique remboursements:', error)
  }
}

const openRefundModal = (order: any) => {
  selectedRefundOrder.value = order
  refundForm.value = {
    payment_method: order.payment_method || '',
    fee_rate_override: null,
    notes: ''
  }
  refundCalculation.value = { feeRate: 0, feeAmount: 0, refundAmount: 0 }
  if (order.payment_method) updateRefundCalculation()
  showRefundModal.value = true
}

const updateRefundCalculation = () => {
  const method = refundForm.value.payment_method
  const amount = selectedRefundOrder.value?.total_amount || 0
  const feeRate = refundForm.value.fee_rate_override !== null
    ? refundForm.value.fee_rate_override
    : (FEE_RATES[method] ?? 2)
  const feeAmount = parseFloat((amount * feeRate / 100).toFixed(2))
  const refundAmount = parseFloat((amount - feeAmount).toFixed(2))
  refundCalculation.value = { feeRate, feeAmount, refundAmount }
}

const submitRefund = async () => {
  if (!refundForm.value.payment_method || !selectedRefundOrder.value) return
  isSubmittingRefund.value = true
  try {
    await refundService.createRefund({
      order_id: selectedRefundOrder.value.id,
      payment_method: refundForm.value.payment_method,
      fee_rate_override: refundForm.value.fee_rate_override ?? undefined,
      notes: refundForm.value.notes || undefined
    })
    uiStore.addToast('Remboursement créé avec succès', 'success')
    showRefundModal.value = false
    await loadRefundsData()
  } catch (error: any) {
    const msg = error?.response?.data?.error || 'Erreur lors de la création du remboursement'
    uiStore.addToast(msg, 'error')
  } finally {
    isSubmittingRefund.value = false
  }
}

const markProcessing = async (refund: any) => {
  const reference = await uiStore.prompt({
    title: 'Référence de transaction',
    message: 'Saisissez la référence de la transaction (ID MonCash, numéro de virement, etc.)',
    placeholder: 'Ex: MC-123456789'
  })
  if (reference === null) return
  try {
    await refundService.processRefund(refund.id, { reference: reference || undefined })
    uiStore.addToast('Remboursement marqué en traitement', 'info')
    await loadRefundHistory()
    refundStats.value = await refundService.getStats()
  } catch (error) {
    uiStore.addToast('Erreur lors de la mise à jour', 'error')
  }
}

const markCompleted = async (refund: any) => {
  const confirmed = await uiStore.confirm({
    title: 'Confirmer le remboursement',
    message: `Confirmez-vous que le remboursement de ${formatCurrency(refund.refund_amount)} a bien été effectué ?`,
    confirmText: 'Oui, confirmer'
  })
  if (!confirmed) return
  try {
    await refundService.completeRefund(refund.id, {})
    uiStore.addToast('Remboursement complété !', 'success')
    await loadRefundHistory()
    refundStats.value = await refundService.getStats()
  } catch (error) {
    uiStore.addToast('Erreur lors de la mise à jour', 'error')
  }
}

const markFailed = async (refund: any) => {
  const reason = await uiStore.prompt({
    title: 'Raison de l\'échec',
    message: 'Pourquoi ce remboursement a-t-il échoué ?',
    placeholder: 'Ex: Numéro MonCash invalide, compte fermé...'
  })
  if (!reason) return
  try {
    await refundService.failRefund(refund.id, { failure_reason: reason })
    uiStore.addToast('Remboursement marqué comme échoué', 'warning')
    await loadRefundHistory()
    refundStats.value = await refundService.getStats()
  } catch (error) {
    uiStore.addToast('Erreur lors de la mise à jour', 'error')
  }
}

const getRefundStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'pending': 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800',
    'processing': 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    'completed': 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    'failed': 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
}

const getRefundStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'pending': 'En attente',
    'processing': 'En traitement',
    'completed': 'Complété',
    'failed': 'Échoué'
  }
  return texts[status] || status
}

onMounted(() => {
  if (route.query.tab === 'withdrawals') {
    activeTab.value = 'withdrawals'
  }
  if (route.query.tab === 'refunds') {
    activeTab.value = 'refunds'
    loadRefundsData()
  }
  loadPaiementsData()
  fetchWithdrawals()
  // Charger les stats de remboursement pour le badge
  refundService.getStats().then((stats: any) => { refundStats.value = stats }).catch(() => {})
})

</script>

<style scoped>
@reference "tailwindcss";
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white;
  @variant hover { @apply bg-blue-700; }
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700;
  @variant hover { @apply bg-gray-300; }
}

.btn-sm {
  @apply px-3 py-2 text-sm;
}

.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-lg;
  @variant focus { @apply outline-none ring-2 ring-blue-500 border-transparent; }
}

.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white;
  @variant focus { @apply outline-none ring-2 ring-blue-500 border-transparent; }
}
</style>
