<template>
  <div class="payments-page">
    <div class="header">
      <h1>Gestion des Paiements</h1>
      <p>Suivez les revenus et les transactions</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-content">
          <h3>Revenus Totaux</h3>
          <p class="stat-value">{{ formatCurrency(stats.totalRevenue) }}</p>
          <span class="stat-trend positive">+{{ stats.revenueGrowth }}%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon today">💳</div>
        <div class="stat-content">
          <h3>Paiements Aujourd'hui</h3>
          <p class="stat-value">{{ stats.todayPayments }}</p>
          <span class="stat-trend positive">+{{ stats.todayGrowth }}%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">✅</div>
        <div class="stat-content">
          <h3>Taux de Succès</h3>
          <p class="stat-value">{{ stats.successRate }}%</p>
          <span class="stat-trend">Excellent</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">⏰</div>
        <div class="stat-content">
          <h3>Paiements En Attente</h3>
          <p class="stat-value">{{ stats.pendingPayments }}</p>
          <span class="stat-trend">À traiter</span>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="chart-section">
        <h2>Évolution des Revenus</h2>
        <div class="chart-placeholder">
          <div class="chart-icon">📈</div>
          <p>Graphique des revenus</p>
          <small>Intégration Chart.js prévue</small>
        </div>
      </div>

      <div class="methods-section">
        <h2>Méthodes de Paiement</h2>
        <div class="methods-list">
          <div v-for="method in paymentMethods" :key="method.name" class="method-item">
            <div class="method-icon">{{ getMethodIcon(method.name) }}</div>
            <div class="method-info">
              <h4>{{ method.name }}</h4>
              <p>{{ method.count }} transactions</p>
            </div>
            <div class="method-stats">
              <strong>{{ method.percentage }}%</strong>
              <small>{{ formatCurrency(method.amount) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="payments-table">
      <div class="table-header">
        <h2>Paiements Récents</h2>
        <div class="table-controls">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher..."
            class="search-input"
          />
          <select v-model="statusFilter" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="completed">Complété</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
            <option value="refunded">Remboursé</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="payments-table-content">
          <thead>
            <tr>
              <th>Client</th>
              <th>Montant</th>
              <th>Méthode</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id">
              <td>
                <div class="customer-info">
                  <div class="customer-avatar">👤</div>
                  <div>
                    <div class="customer-name">{{ payment.customer }}</div>
                    <div class="customer-email">{{ payment.email }}</div>
                  </div>
                </div>
              </td>
              <td class="amount">{{ formatCurrency(payment.amount) }}</td>
              <td class="method">{{ payment.method }}</td>
              <td>
                <span :class="getStatusClass(payment.status)">
                  {{ getStatusText(payment.status) }}
                </span>
              </td>
              <td class="date">{{ formatDate(payment.date) }}</td>
              <td class="actions">
                <button class="action-btn">Détails</button>
                <button class="action-btn">Facture</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

console.log('🔥 Paiements Simple component loading!')

// État
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
    count: 156,
    percentage: 65,
    amount: 289456
  },
  {
    name: 'Natcash',
    count: 45,
    percentage: 19,
    amount: 84789
  },
  {
    name: 'Mon Cash Wise',
    count: 28,
    percentage: 12,
    amount: 53456
  },
  {
    name: 'Zelle',
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

const getMethodIcon = (method: string) => {
  const icons: { [key: string]: string } = {
    'Carte de crédit': '💳',
    'Natcash': '📱',
    'Mon Cash Wise': '👛',
    'Zelle': '🏦'
  }
  return icons[method] || '❓'
}

const getStatusClass = (status: string) => {
  const classes: { [key: string]: string } = {
    'completed': 'status-completed',
    'pending': 'status-pending',
    'failed': 'status-failed',
    'refunded': 'status-refunded'
  }
  return classes[status] || 'status-default'
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
</script>

<style scoped>
.payments-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.header p {
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.revenue { background: #dcfce7; }
.stat-icon.today { background: #dbeafe; }
.stat-icon.success { background: #f3e8ff; }
.stat-icon.pending { background: #fed7aa; }

.stat-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.75rem;
  color: #6b7280;
}

.stat-trend.positive {
  color: #059669;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-section, .methods-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-section h2, .methods-section h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.chart-placeholder {
  height: 16rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 0.5rem;
  color: #6b7280;
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: #f9fafb;
}

.method-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  background: #e5e7eb;
}

.method-info h4 {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.method-info p {
  font-size: 0.875rem;
  color: #6b7280;
}

.method-stats {
  margin-left: auto;
  text-align: right;
}

.method-stats strong {
  display: block;
  font-weight: 600;
  color: #1f2937;
}

.method-stats small {
  font-size: 0.75rem;
  color: #6b7280;
}

.payments-table {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h2 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.table-controls {
  display: flex;
  gap: 1rem;
}

.search-input, .filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.table-container {
  overflow-x: auto;
}

.payments-table-content {
  width: 100%;
  border-collapse: collapse;
}

.payments-table-content th {
  text-align: left;
  padding: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  border-bottom: 1px solid #e5e7eb;
}

.payments-table-content td {
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.customer-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.customer-name {
  font-weight: 600;
  color: #1f2937;
}

.customer-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.amount {
  font-weight: 600;
  color: #1f2937;
}

.status-completed {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #dcfce7;
  color: #166534;
}

.status-pending {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fef3c7;
  color: #92400e;
}

.status-failed {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #fecaca;
  color: #991b1b;
}

.status-refunded {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #f3f4f6;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.action-btn:hover {
  background: #f9fafb;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .table-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .table-controls {
    flex-direction: column;
  }
}
</style>
