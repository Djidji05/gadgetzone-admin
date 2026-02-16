<template>
  <div class="p-4 sm:p-6 space-y-6">
    <!-- Header -->
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Finance</h1>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Vue d'ensemble financière de l'entreprise</p>
      </div>
      <div class="flex flex-wrap gap-3 w-full sm:w-auto">
        <button 
          @click="showExpenseModal = true"
          class="flex-1 sm:flex-none justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="whitespace-nowrap">Ajouter une dépense</span>
        </button>
        <select class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option>Ce mois</option>
          <option>Ce trimestre</option>
          <option>Cette année</option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Revenue Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-blue-500 hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div 
            class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            :class="revenueGrowth >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'"
          >
            <i :class="['fas', revenueGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ Math.abs(revenueGrowth) }}%
          </div>
        </div>
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Revenus Totaux</h3>
        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ formatCurrency(totalRevenue) }}</p>
      </div>

      <!-- Expenses Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-red-500 hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div 
            class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            :class="expensesGrowth <= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'"
          >
            <i :class="['fas', expensesGrowth <= 0 ? 'fa-arrow-down' : 'fa-arrow-up']"></i>
            {{ Math.abs(expensesGrowth) }}%
          </div>
        </div>
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Dépenses Totales</h3>
        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ formatCurrency(totalExpenses) }}</p>
      </div>

      <!-- Profit Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-green-500 hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div 
            class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            :class="profitGrowth >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'"
          >
            <i :class="['fas', profitGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ Math.abs(profitGrowth) }}%
          </div>
        </div>
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Profit Net</h3>
        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ formatCurrency(netProfit) }}</p>
      </div>

      <!-- Payments Card -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-purple-500 hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div 
            class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            :class="paymentsGrowth >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'"
          >
            <i :class="['fas', paymentsGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down']"></i>
            {{ Math.abs(paymentsGrowth) }}%
          </div>
        </div>
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Paiements Reçus</h3>
        <p class="text-2xl font-black text-gray-900 dark:text-white mt-1">{{ formatCurrency(totalPayments) }}</p>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">Évolution des Revenus</h2>
          <div class="flex gap-2">
            <button class="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">Mois</button>
            <button class="px-3 py-1.5 text-xs rounded-lg text-gray-500 hover:bg-gray-50 font-medium dark:hover:bg-gray-700 transition-colors">Année</button>
          </div>
        </div>
        <apexchart
          type="area"
          height="300"
          :options="revenueChartOptions"
          :series="revenueChartSeries"
        ></apexchart>
      </div>

      <!-- Expenses Breakdown -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Répartition des Dépenses</h2>
        <apexchart
          type="donut"
          height="300"
          :options="expensesChartOptions"
          :series="expensesChartSeries"
        ></apexchart>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profit Trend -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Tendance Profit/Perte</h2>
        <apexchart
          type="bar"
          height="300"
          :options="profitChartOptions"
          :series="profitChartSeries"
        ></apexchart>
      </div>

      <!-- Payment Methods -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-6">Méthodes de Paiement</h2>
        <apexchart
          type="radialBar"
          height="300"
          :options="paymentMethodsChartOptions"
          :series="paymentMethodsSeries"
        ></apexchart>
      </div>
    </div>

    <!-- Expenses List Section -->
    <div id="expenses-section" class="scroll-mt-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Liste des Dépenses</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ filteredExpenses.length }} dépense(s) trouvée(s)</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <!-- Filter by Category -->
          <select 
            v-model="expenseFilter" 
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
          >
            <option value="all">Toutes les catégories</option>
            <option value="salaires">Salaires</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Opérations</option>
            <option value="technologie">Technologie</option>
            <option value="fournitures">Fournitures</option>
            <option value="loyer">Loyer</option>
            <option value="utilities">Services publics</option>
            <option value="autres">Autres</option>
          </select>
          
          <!-- Print Button -->
          <button 
            @click="printExpenses"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>
      </div>

      <!-- Expenses Mobile Cards -->
      <div class="sm:hidden space-y-4">
        <div v-if="filteredExpenses.length === 0" class="text-center py-12">
           <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
           <p class="text-gray-600 dark:text-gray-400 font-medium">Aucune dépense trouvée</p>
        </div>
        <div v-else v-for="expense in filteredExpenses" :key="expense.id" class="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="text-sm font-bold text-gray-900 dark:text-white">{{ expense.date }}</div>
              <span class="inline-block px-2 py-0.5 mt-1 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {{ getCategoryLabel(expense.category) }}
              </span>
            </div>
            <div class="text-right font-bold text-red-600 dark:text-red-400 text-lg">
              -{{ formatCurrency(expense.amount) }}
            </div>
          </div>
          <div class="text-sm text-gray-800 dark:text-gray-200 mb-3">
            {{ expense.description }}
            <div v-if="expense.notes" class="text-xs text-gray-500 mt-1 italic">{{ expense.notes }}</div>
          </div>
          <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-600">
            <div class="text-xs text-gray-500 flex items-center gap-1">
               <span>{{ getPaymentMethodLabel(expense.paymentMethod) }}</span>
            </div>
            <div class="flex gap-2">
              <button 
                @click="viewExpenseDetails(expense)"
                class="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
              </button>
              <button 
                @click="deleteExpense(expense.id)"
                class="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Expenses Table (Hidden on Mobile) -->
      <div class="hidden sm:block overflow-x-auto" id="expenses-print-area">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Catégorie</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Méthode</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Montant</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="expense in filteredExpenses" 
              :key="expense.id" 
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">{{ expense.date }}</td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  {{ getCategoryLabel(expense.category) }}
                </span>
              </td>
              <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">
                <div>{{ expense.description }}</div>
                <div v-if="expense.notes" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ expense.notes }}</div>
              </td>
              <td class="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                {{ getPaymentMethodLabel(expense.paymentMethod) }}
              </td>
              <td class="py-4 px-4 text-right">
                <span class="font-semibold text-red-600 dark:text-red-400">
                  -{{ formatCurrency(expense.amount) }}
                </span>
              </td>
              <td class="py-4 px-4 text-center print:hidden">
                <div class="flex items-center justify-center gap-2">
                  <button 
                    @click="viewExpenseDetails(expense)"
                    class="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button 
                    @click="deleteExpense(expense.id)"
                    class="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-gray-200 dark:border-gray-700">
            <tr>
              <td colspan="4" class="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">Total des dépenses :</td>
              <td class="py-4 px-4 text-right font-bold text-red-600 dark:text-red-400 text-lg">
                -{{ formatCurrency(totalExpensesFiltered) }}
              </td>
              <td class="print:hidden"></td>
            </tr>
          </tfoot>
        </table>

        <!-- Empty State -->
        <div v-if="filteredExpenses.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-gray-600 dark:text-gray-400 font-medium">Aucune dépense trouvée</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-1">Ajoutez votre première dépense pour commencer</p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Transactions Récentes</h2>
        <button 
          @click="scrollToExpenses"
          class="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          Voir tout →
        </button>
      </div>
      <div class="sm:hidden space-y-4">
        <div v-for="transaction in recentTransactions" :key="transaction.id" class="p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-bold text-gray-900 dark:text-white">{{ transaction.description }}</div>
              <div class="text-xs text-gray-500 mt-0.5">{{ transaction.date }}</div>
            </div>
            <div :class="['font-bold', transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600']">
              {{ transaction.type === 'revenue' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </div>
          </div>
          <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
             <span :class="['px-2 py-1 rounded text-xs font-medium', transaction.type === 'revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                {{ transaction.type === 'revenue' ? 'Revenu' : 'Dépense' }}
             </span>
             <span :class="['px-2 py-1 rounded text-xs font-medium', transaction.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700']">
                {{ transaction.status === 'completed' ? 'Complété' : 'En attente' }}
             </span>
          </div>
        </div>
      </div>
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Description</th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Type</th>
              <th class="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Montant</th>
              <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in recentTransactions" :key="transaction.id" class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">{{ transaction.date }}</td>
              <td class="py-4 px-4 text-sm text-gray-900 dark:text-white">{{ transaction.description }}</td>
              <td class="py-4 px-4">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  transaction.type === 'revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                ]">
                  {{ transaction.type === 'revenue' ? 'Revenu' : 'Dépense' }}
                </span>
              </td>
              <td class="py-4 px-4 text-right">
                <span :class="[
                  'font-semibold',
                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ transaction.type === 'revenue' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </span>
              </td>
              <td class="py-4 px-4 text-center">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-medium',
                  transaction.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                ]">
                  {{ transaction.status === 'completed' ? 'Complété' : 'En attente' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Expense Modal -->
    <div 
      v-if="showExpenseModal" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] p-4"
      @click.self="showExpenseModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Ajouter une Dépense</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Enregistrez une nouvelle dépense dans le système</p>
          </div>
          <button 
            @click="showExpenseModal = false"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleAddExpense" class="p-6 space-y-6">
          <!-- Category -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Catégorie <span class="text-red-500">*</span>
            </label>
            <select 
              v-model="expenseForm.category" 
              required
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="salaires">Salaires</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Opérations</option>
              <option value="technologie">Technologie</option>
              <option value="fournitures">Fournitures</option>
              <option value="loyer">Loyer</option>
              <option value="utilities">Services publics</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="expenseForm.description" 
              type="text" 
              required
              placeholder="Ex: Paiement fournisseur ABC"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Montant (HTG) <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">HTG</span>
              <input 
                v-model.number="expenseForm.amount" 
                type="number" 
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Date -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="expenseForm.date" 
              type="date" 
              required
              :max="new Date().toISOString().split('T')[0]"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <!-- Payment Method -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Méthode de paiement <span class="text-red-500">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                v-for="method in paymentMethods"
                :key="method.value"
                @click="expenseForm.paymentMethod = method.value"
                :class="[
                  'p-4 border-2 rounded-lg transition-all',
                  expenseForm.paymentMethod === method.value
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                ]"
              >
                <div class="text-2xl mb-2">{{ method.icon }}</div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ method.label }}</div>
              </button>
            </div>
          </div>

          <!-- Notes (Optional) -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Notes (optionnel)
            </label>
            <textarea 
              v-model="expenseForm.notes" 
              rows="3"
              placeholder="Ajoutez des notes supplémentaires..."
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            ></textarea>
          </div>

          <!-- Recurring Expense -->
          <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <input 
              v-model="expenseForm.recurring" 
              type="checkbox" 
              id="recurring"
              class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label for="recurring" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Dépense récurrente (mensuelle)
            </label>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="showExpenseModal = false"
              class="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Enregistrer la dépense
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Expense Details Modal -->
    <div 
      v-if="showDetailsModal && selectedExpense" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999999] p-4"
      @click.self="showDetailsModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white">Détails de la Dépense</h2>
                <p class="text-red-100 text-sm mt-1">ID: #{{ selectedExpense.id }}</p>
              </div>
            </div>
            <button 
              @click="showDetailsModal = false"
              class="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Amount Card -->
          <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
            <div class="text-center">
              <p class="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Montant de la dépense</p>
              <p class="text-4xl font-bold text-red-700 dark:text-red-300">
                -{{ formatCurrency(selectedExpense.amount) }}
              </p>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Date -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Date</span>
              </div>
              <p class="text-gray-900 dark:text-white font-medium">{{ selectedExpense.date }}</p>
            </div>

            <!-- Category -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Catégorie</span>
              </div>
              <span class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                {{ getCategoryLabel(selectedExpense.category) }}
              </span>
            </div>

            <!-- Payment Method -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Méthode de paiement</span>
              </div>
              <p class="text-gray-900 dark:text-white font-medium">{{ getPaymentMethodLabel(selectedExpense.paymentMethod) }}</p>
            </div>

            <!-- Status -->
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Statut</span>
              </div>
              <span class="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {{ selectedExpense.status === 'completed' ? 'Complété' : 'En attente' }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Description</span>
            </div>
            <p class="text-gray-900 dark:text-white">{{ selectedExpense.description }}</p>
          </div>

          <!-- Notes (if exists) -->
          <div v-if="selectedExpense.notes" class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">Notes</span>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm">{{ selectedExpense.notes }}</p>
          </div>

          <!-- Recurring Badge -->
          <div v-if="selectedExpense.recurring" class="flex items-center justify-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Dépense récurrente (mensuelle)</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-b-2xl flex gap-3">
          <button
            @click="showDetailsModal = false"
            class="flex-1 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors"
          >
            Fermer
          </button>
          <button
            @click="printExpenseDetails()"
            class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { financeService } from '@/services/api';

const apexchart = VueApexCharts;

// États de chargement
const isLoading = ref(true);
const error = ref<string | null>(null);

// Data
const totalRevenue = ref(0);
const totalExpenses = ref(0);
const totalPayments = ref(0);
const revenueGrowth = ref(0);
const expensesGrowth = ref(0);
const profitGrowth = ref(0);
const paymentsGrowth = ref(0);

const netProfit = computed(() => totalRevenue.value - totalExpenses.value);

// Revenue Chart
const revenueChartSeries = ref([{
  name: 'Revenus',
  data: [] as number[]
}]);

const revenueChartOptions = ref<any>({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: ['#3B82F6'],
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
    }
  },
  xaxis: {
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  },
  yaxis: {
    labels: {
      formatter: (value: number) => `${(value / 1000).toFixed(0)}k`
    }
  },
  tooltip: {
    y: {
      formatter: (value: number) => `${value.toLocaleString()} HTG`
    }
  }
});

// Expenses Chart
const expensesChartSeries = ref<number[]>([]);
const expensesChartOptions = ref<any>({
  chart: { 
    type: 'donut',
    fontFamily: 'inherit'
  },
  labels: [] as string[],
  colors: [
    '#0ea5e9', // Sky 500
    '#22c55e', // Green 500
    '#eab308', // Yellow 500
    '#f97316', // Orange 500
    '#ef4444', // Red 500
    '#8b5cf6', // Violet 500
    '#ec4899', // Pink 500
    '#64748b'  // Slate 500
  ],
  stroke: {
    show: true,
    width: 2,
    colors: ['#ffffff'] // White stroke for separation (or use bg color if dark mode handled)
  },
  dataLabels: { enabled: false },
  legend: { 
    position: 'bottom',
    fontFamily: 'inherit',
    fontWeight: 500,
    labels: {
      colors: '#6b7280' // Gray 500
    },
    itemMargin: {
      horizontal: 10,
      vertical: 5
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '75%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontFamily: 'inherit',
            fontWeight: 500,
            color: '#6b7280',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '24px',
            fontFamily: 'inherit',
            fontWeight: 700,
            color: '#111827', // Gray 900
            offsetY: 10,
            formatter: () => formatCurrency(totalExpenses.value)
          },
          total: {
            show: true,
            showAlways: true,
            label: 'Total',
            fontSize: '14px',
            fontFamily: 'inherit',
            fontWeight: 500,
            color: '#6b7280',
            formatter: function (w: any) {
              const total = w.globals.seriesTotals.reduce((a: number, b: number, index: number) => {
                // exclude hidden series
                return w.globals.collapsedSeriesIndices.indexOf(index) === -1 ? a + b : a
              }, 0)
              return formatCurrency(total)
            }
          }
        }
      }
    }
  },
  tooltip: {
    theme: 'light',
    style: {
      fontSize: '12px',
      fontFamily: 'inherit'
    },
    y: {
      formatter: (value: number) => formatCurrency(value)
    }
  }
});

// Profit Chart
const profitChartSeries = ref([
  {
    name: 'Revenus',
    data: [] as number[]
  },
  {
    name: 'Dépenses',
    data: [] as number[]
  }
]);

const profitChartOptions = ref<any>({
  chart: {
    type: 'bar',
    toolbar: { show: false }
  },
  colors: ['#10B981', '#EF4444'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 8
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  },
  yaxis: {
    labels: {
      formatter: (value: number) => `${value}k`
    }
  },
  fill: { opacity: 1 },
  tooltip: {
    y: {
      formatter: (value: number) => `${value}k HTG`
    }
  }
});

// Payment Methods Chart
const paymentMethodsSeries = ref<number[]>([]);
const paymentMethodsChartOptions = ref<any>({
  chart: { type: 'radialBar' },
  plotOptions: {
    radialBar: {
      dataLabels: {
        name: { fontSize: '14px' },
        value: { fontSize: '16px' },
        total: {
          show: true,
          label: 'Total',
          formatter: () => '100%'
        }
      }
    }
  },
  labels: ['Carte', 'Mobile', 'Cash'],
  colors: ['#3B82F6', '#8B5CF6', '#10B981']
});

// Recent Transactions
const recentTransactions = ref<any[]>([]);

// Expense Modal
const showExpenseModal = ref(false);
const expenseForm = ref({
  category: '',
  description: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'card',
  notes: '',
  recurring: false
});

const paymentMethods = [
  { value: 'card', label: 'Carte', icon: '💳' },
  { value: 'cash', label: 'Espèces', icon: '💵' },
  { value: 'transfer', label: 'Virement', icon: '🏦' }
];

// Charger toutes les données financières
const loadFinanceData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    console.log('📊 Chargement des données financières...');

    // Charger toutes les données en parallèle
    const [
      overview,
      revenueChart,
      expensesData,
      expensesBreakdown,
      profitTrend,
      paymentMethods,
      transactions
    ] = await Promise.all([
      financeService.getOverview(),
      financeService.getRevenueChart(),
      financeService.getExpenses(),
      financeService.getExpensesBreakdown(),
      financeService.getProfitTrend(),
      financeService.getPaymentMethods(),
      financeService.getTransactions(10)
    ]);

    console.log('✅ Données chargées:', { overview, revenueChart, expensesBreakdown });

    // Mettre à jour les KPIs
    totalRevenue.value = overview.totalRevenue;
    totalExpenses.value = overview.totalExpenses;
    totalPayments.value = overview.totalPayments;
    revenueGrowth.value = overview.growth.revenue;
    expensesGrowth.value = overview.growth.expenses;
    profitGrowth.value = overview.growth.profit;
    paymentsGrowth.value = overview.growth.payments;

    // Mettre à jour le graphique des revenus
    revenueChartSeries.value = [{
      name: 'Revenus',
      data: revenueChart.data
    }];

    // Mettre à jour le graphique des dépenses
    expensesChartSeries.value = expensesBreakdown.values;
    expensesChartOptions.value.labels = expensesBreakdown.categories;

    // Mettre à jour le graphique profit/perte
    profitChartSeries.value = [
      { name: 'Revenus', data: profitTrend.revenue },
      { name: 'Dépenses', data: profitTrend.expenses }
    ];

    // Mettre à jour les méthodes de paiement
    paymentMethodsSeries.value = paymentMethods.percentages;

    // Mettre à jour les transactions récentes
    recentTransactions.value = transactions.transactions;

  } catch (err) {
    console.error('❌ Erreur chargement données finance:', err);
    error.value = 'Impossible de charger les données financières';
  } finally {
    isLoading.value = false;
  }
};

const handleAddExpense = async () => {
  try {
    console.log('💰 Ajout de la dépense...', expenseForm.value);
    
    await financeService.createExpense(expenseForm.value);
    
    console.log('✅ Dépense ajoutée avec succès');
    
    // Recharger toutes les données
    await loadFinanceData();
    
    // Reset form and close modal
    expenseForm.value = {
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'card',
      notes: '',
      recurring: false
    };
    showExpenseModal.value = false;
  } catch (err) {
    console.error('❌ Erreur ajout dépense:', err);
    alert('Erreur lors de l\'ajout de la dépense');
  }
};

// Expense Filter
const expenseFilter = ref('all');

const filteredExpenses = computed(() => {
  const expenses = recentTransactions.value.filter(t => t.type === 'expense');
  if (expenseFilter.value === 'all') {
    return expenses;
  }
  return expenses.filter(e => e.category === expenseFilter.value);
});

const totalExpensesFiltered = computed(() => {
  return filteredExpenses.value.reduce((sum, expense) => sum + expense.amount, 0);
});

// Print Expenses
const printExpenses = () => {
  const printContent = document.getElementById('expenses-print-area');
  if (!printContent) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Liste des Dépenses - GadgetZone</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #000;
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 10px;
        }
        .header-info {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .amount {
          text-align: right;
          font-weight: bold;
          color: #dc2626;
        }
        .category {
          background-color: #e9d5ff;
          color: #7c3aed;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          display: inline-block;
        }
        tfoot {
          font-weight: bold;
          background-color: #f3f4f6;
        }
        .print-hidden {
          display: none;
        }
        @media print {
          .print-hidden {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <h1>GadgetZone - Liste des Dépenses</h1>
      <div class="header-info">
        <p>Date d'impression: ${new Date().toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>Filtre: ${expenseFilter.value === 'all' ? 'Toutes les catégories' : getCategoryLabel(expenseFilter.value)}</p>
        <p>Nombre de dépenses: ${filteredExpenses.value.length}</p>
      </div>
      ${printContent.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// Delete Expense
const deleteExpense = async (id: number | string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
    try {
      // Extraire l'ID réel (format: "expense-123" -> 123)
      const expenseId = typeof id === 'string' && id.startsWith('expense-') 
        ? parseInt(id.split('-')[1]) 
        : id;
      
      await financeService.deleteExpense(expenseId as any);
      await loadFinanceData();
    } catch (err) {
      console.error('❌ Erreur suppression dépense:', err);
      alert('Erreur lors de la suppression de la dépense');
    }
  }
};

// Helper functions
const getCategoryLabel = (category: string) => {
  const categories: Record<string, string> = {
    salaires: 'Salaires',
    marketing: 'Marketing',
    operations: 'Opérations',
    technologie: 'Technologie',
    fournitures: 'Fournitures',
    loyer: 'Loyer',
    utilities: 'Services publics',
    autres: 'Autres'
  };
  return categories[category] || category;
};

const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    card: '💳 Carte',
    cash: '💵 Espèces',
    transfer: '🏦 Virement'
  };
  return methods[method] || method;
};

// Expense Details Modal
const showDetailsModal = ref(false);
const selectedExpense = ref<any>(null);

const viewExpenseDetails = (expense: any) => {
  selectedExpense.value = expense;
  showDetailsModal.value = true;
};

const printExpenseDetails = () => {
  if (!selectedExpense.value) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Détails Dépense #${selectedExpense.value.id} - GadgetZone</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #dc2626;
          padding-bottom: 20px;
        }
        h1 {
          color: #dc2626;
          margin-bottom: 10px;
        }
        .amount-box {
          background: #fee2e2;
          border: 2px solid #dc2626;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .amount {
          font-size: 48px;
          font-weight: bold;
          color: #dc2626;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
        }
        .detail-item {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .detail-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .detail-value {
          font-size: 16px;
          color: #111827;
          font-weight: 500;
        }
        .description-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        .notes-box {
          background: #fef3c7;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #fbbf24;
        }
        .recurring-badge {
          background: #dbeafe;
          color: #1e40af;
          padding: 10px 20px;
          border-radius: 8px;
          display: inline-block;
          margin: 20px 0;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>GadgetZone - Détails de la Dépense</h1>
        <p>ID: #${selectedExpense.value.id}</p>
        <p>Imprimé le: ${new Date().toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
      </div>

      <div class="amount-box">
        <div style="font-size: 14px; color: #991b1b; margin-bottom: 10px;">Montant de la dépense</div>
        <div class="amount">-${formatCurrency(selectedExpense.value.amount)}</div>
      </div>

      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-label">Date</div>
          <div class="detail-value">${selectedExpense.value.date}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Catégorie</div>
          <div class="detail-value">${getCategoryLabel(selectedExpense.value.category)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Méthode de paiement</div>
          <div class="detail-value">${getPaymentMethodLabel(selectedExpense.value.paymentMethod)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Statut</div>
          <div class="detail-value">${selectedExpense.value.status === 'completed' ? 'Complété' : 'En attente'}</div>
        </div>
      </div>

      <div class="description-box">
        <div class="detail-label">Description</div>
        <div class="detail-value">${selectedExpense.value.description}</div>
      </div>

      ${selectedExpense.value.notes ? `
        <div class="notes-box">
          <div class="detail-label">Notes</div>
          <div class="detail-value">${selectedExpense.value.notes}</div>
        </div>
      ` : ''}

      ${selectedExpense.value.recurring ? `
        <div class="recurring-badge">
          🔄 Dépense récurrente (mensuelle)
        </div>
      ` : ''}

      <div class="footer">
        <p>GadgetZone - Système de gestion financière</p>
        <p>Document confidentiel</p>
      </div>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

// Scroll to expenses section
const scrollToExpenses = () => {
  const expensesSection = document.getElementById('expenses-section');
  if (expensesSection) {
    expensesSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
};

// Helper function
const formatCurrency = (value: number) => {
  return `${value.toLocaleString()} HTG`;
};

// Charger les données au montage
onMounted(() => {
  loadFinanceData();
});
</script>

<style scoped>
/* Custom scrollbar for table */
::-webkit-scrollbar {
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Print styles */
@media print {
  .print\:hidden {
    display: none !important;
  }
  
  body {
    background: white;
  }
  
  table {
    page-break-inside: auto;
  }
  
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }
}
</style>
