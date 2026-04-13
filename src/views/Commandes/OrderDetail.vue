<template>
  <div class="p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
        Détails de la commande #{{ order?.id }}
      </h1>
      <div class="flex items-center gap-3">
        <button
          @click="exportToPDF"
          :disabled="!order"
          class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter en PDF
        </button>
        <button
          @click="$router.back()"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Retour
        </button>
      </div>
    </div>

    <!-- Scanner Modal (Phase 13) -->
    <div v-if="showScanner" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div class="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <i class="fas fa-qrcode"></i>
            Scanner le code client
          </h3>
          <button @click="stopScanner" class="hover:bg-white/20 p-2 rounded-full transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div id="qr-reader" class="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700"></div>
          
          <div v-if="scannerError" class="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
            <i class="fas fa-exclamation-triangle mt-1"></i>
            <span>{{ scannerError }}</span>
          </div>

          <p class="mt-4 text-sm text-gray-500 text-center">
            Placez le QR code du client au centre du cadre pour valider la livraison.
          </p>
        </div>

        <div class="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end gap-3">
          <button @click="stopScanner" class="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl font-medium">
            Annuler
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
    </div>
    
    <div v-else-if="order" class="space-y-6">
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne Gauche: Infos & Articles -->
        <div class="lg:col-span-2 space-y-6">
           <!-- Informations générales -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Informations générales</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Numéro de Commande</p>
                <p class="font-medium">{{ formatOrderId(order.id) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Date de création</p>
                <p class="font-medium">{{ formatDate(order.created_at) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Client</p>
                <p class="font-medium">{{ order.user?.name || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p class="font-medium">{{ order.user?.email || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Statut Actuel</p>
                <span :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p class="font-medium text-lg">{{ formatCurrency(order.total_amount) }}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-sm text-gray-600 dark:text-gray-400">Adresse de Livraison</p>
                <p class="font-medium">{{ formattedAddress }}</p>
              </div>
            </div>
          </div>
          
          <!-- Articles de la commande -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Articles</h2>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b dark:border-gray-700">
                    <th class="text-left p-2">Produit</th>
                    <th class="text-left p-2">Quantité</th>
                    <th class="text-left p-2">Prix unitaire</th>
                    <th class="text-left p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in order.items" :key="item.id" class="border-b dark:border-gray-700">
                    <td class="p-2">
                      <div class="flex items-center gap-3">
                        <img v-if="item.product?.image_url" :src="item.product.image_url" class="w-10 h-10 object-cover rounded" />
                        <div class="flex flex-col">
                          <div class="font-medium text-gray-900 dark:text-white">{{ item.product?.name || '-' }}</div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">{{ formatProductId(item.product_id) }}</div>
                          <span v-if="item.product?.store" class="text-xs text-gray-500">
                            Vendu par : <span class="font-semibold text-blue-600">{{ item.product.store.name }}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="p-2">{{ item.quantity }}</td>
                    <td class="p-2">{{ formatCurrency(item.price) }}</td>
                    <td class="p-2 font-medium">{{ formatCurrency(item.quantity * item.price) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="border-t-2 dark:border-gray-700">
                    <td colspan="3" class="p-2 font-semibold text-right">Total</td>
                    <td class="p-2 font-semibold text-lg">{{ formatCurrency(order.total_amount) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <!-- Colonne Droite: Historique & Actions -->
        <div class="space-y-6">
          <!-- Actions -->
          <div v-if="authStore.isAdmin" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Mettre à jour le statut</h2>
            
            <div v-if="['delivered', 'cancelled'].includes(order.status)" class="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-md text-sm mb-4">
              <i class="fas fa-info-circle mr-2"></i>
              Cette commande est déjà {{ getStatusText(order.status).toLowerCase() }}. Le statut ne peut plus être modifié.
            </div>

            <div class="space-y-4">
              <select
                v-model="newStatus"
                :disabled="isUpdating || ['delivered', 'cancelled'].includes(order.status)"
                class="w-full px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Sélectionner un statut</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>

              <!-- Bouton de Scan (Phase 13) -->
              <button
                v-if="['shipped', 'confirmed', 'processing'].includes(order.status)"
                @click="startScanner"
                class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20 transition-all flex justify-center items-center gap-3 font-bold group"
              >
                <i class="fas fa-qrcode text-lg group-hover:scale-110 transition-transform"></i>
                Valider par Scan (QR)
              </button>

              <button
                @click="updateStatus"
                :disabled="!newStatus || isUpdating || newStatus === order.status || ['delivered', 'cancelled'].includes(order.status)"
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
              >
                <svg v-if="isUpdating" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isUpdating ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </div>

          <!-- Historique de la commande (Timeline) -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Historique de la commande</h2>
            
            <div class="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-6">
              
              <!-- Timeline Items from Logs -->
              <div v-for="log in order.logs" :key="log.id" class="relative">
                <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800" 
                     :class="getLogColor(log.new_status)"></div>
                
                <div class="text-sm">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ getStatusText(log.new_status) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {{ formatDate(log.created_at) }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-300">
                    Par: <span class="font-semibold">{{ log.actor?.name || 'Système' }}</span>
                  </p>
                </div>
              </div>

               <!-- Fallback if no logs (show current dates) -->
               <div v-if="(!order.logs || order.logs.length === 0)" class="space-y-6">
                  <div v-if="order.created_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Création</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</p>
                    </div>
                  </div>
                  <div v-if="order.confirmed_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Confirmée</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.confirmed_at) }}</p>
                    </div>
                  </div>
                  <div v-if="order.shipped_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-purple-500 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Expédiée</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.shipped_at) }}</p>
                    </div>
                  </div>
                  <div v-if="order.delivered_at" class="relative">
                    <div class="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                    <div class="text-sm">
                      <p class="font-medium">Livrée</p>
                      <p class="text-xs text-gray-500">{{ formatDate(order.delivered_at) }}</p>
                    </div>
                  </div>
               </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { orderService, deliveryService } from '@/services/api'
import type { Order } from '@/types'
import { formatOrderId, formatProductId } from '@/utils/formatters';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

const route = useRoute()
const authStore = useAuthStore()

const order = ref<Order | null>(null)
const isLoading = ref(true)
const isUpdating = ref(false)
const newStatus = ref('')

// Scan State (Phase 13)
const showScanner = ref(false)
const scannerError = ref('')
const isVerifying = ref(false)
let html5QrCode: Html5Qrcode | null = null;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'HTG'
  }).format(value)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium',
    confirmed: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium',
    shipped: 'bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium',
    delivered: 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium',
    cancelled: 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium'
  }
  return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return texts[status] || status
}

const getLogColor = (status: string) => {
    switch(status) {
        case 'pending': return 'bg-yellow-500';
        case 'confirmed': return 'bg-blue-500';
        case 'shipped': return 'bg-purple-500';
        case 'delivered': return 'bg-green-500';
        case 'cancelled': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
}

const fetchOrder = async () => {
  try {
    isLoading.value = true
    const fetchedOrder = await orderService.getById(Number(route.params.id))
    order.value = fetchedOrder
    newStatus.value = fetchedOrder.status
  } catch (error) {
    console.error('Erreur lors du chargement de la commande:', error)
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async () => {
  if (!newStatus.value) return
  
  try {
    isUpdating.value = true
    await orderService.updateOrder(Number(route.params.id), { 
      status: newStatus.value as any
    })
    await fetchOrder() // Recharger pour avoir les nouveaux logs
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    isUpdating.value = false
  }
}

// Logic de Scan (Phase 13)
const startScanner = async () => {
  showScanner.value = true
  scannerError.value = ''
  
  // Attendre que le DOM soit mis à jour pour que #qr-reader existe
  setTimeout(() => {
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      onScanSuccess, 
      onScanFailure
    ).catch(err => {
      console.error("Erreur scanner:", err);
      scannerError.value = "Impossible d'accéder à la caméra. Veuillez vérifier les permissions.";
    });
  }, 100);
}

const stopScanner = async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    await html5QrCode.stop();
  }
  showScanner.value = false
}

const onScanSuccess = async (decodedText: string) => {
  console.log(`✅ Code scanné : ${decodedText}`);
  await stopScanner();
  
  try {
    isVerifying.value = true
    const result = await deliveryService.verifyScan(order.value!.id, decodedText);
    
    // Notification de succès (on peut utiliser un toast si disponible, sinon alert)
    alert("✅ Livraison validée ! Les fonds ont été libérés sur votre compte.");
    await fetchOrder(); // Recharger pour voir le statut 'delivered'
  } catch (error: any) {
    console.error("Erreur lors de la vérification:", error);
    alert(`❌ Erreur : ${error.response?.data?.error || error.message || "Code invalide"}`);
  } finally {
    isVerifying.value = false
  }
}

const onScanFailure = (error: any) => {
  // On ne loggue pas les erreurs de scan continu pour ne pas spammer la console
}

const exportToPDF = () => {
  if (!order.value) return;

  const doc = new jsPDF();
  const themeColor = [37, 99, 235]; // Blue-600

  // Header Title
  doc.setFontSize(22);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('HTFASIL', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('FACTURE DE COMMANDE', 14, 28);

  // Horizontal line
  doc.setDrawColor(230);
  doc.line(14, 32, 190, 32);

  // Order Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(`Commande: ${formatOrderId(order.value.id)}`, 14, 45);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Date: ${formatDate(order.value.created_at)}`, 14, 52);
  doc.text(`Statut: ${getStatusText(order.value.status)}`, 14, 57);

  // Customer Section
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 130, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(`${order.value.user?.name || '-'}`, 130, 52);
  doc.text(`${order.value.user?.email || '-'}`, 130, 57);
  
  // Shipping Address
  doc.setFont('helvetica', 'bold');
  doc.text('ADRESSE DE LIVRAISON', 14, 75);
  doc.setFont('helvetica', 'normal');
  const splitAddress = doc.splitTextToSize(formattedAddress.value, 80);
  doc.text(splitAddress, 14, 82);

  // Table of Items
  const tableData = order.value.items.map(item => [
    item.product?.name || '-',
    item.product?.store?.name || 'Inconnue',
    item.quantity.toString(),
    new Intl.NumberFormat('fr-FR').format(item.price), // Sans HTG
    formatCurrency(item.quantity * item.price)
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Produit', 'Boutique', 'Qté', 'Prix Unit.', 'Total']],
    body: tableData,
    headStyles: { fillColor: themeColor, textColor: 255, halign: 'left' },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: 14, right: 14 },
    theme: 'striped',
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 40 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 35, halign: 'center' }
    },
    didParseCell: (data) => {
      // Pour le statut dans l'entête du document, c'est déjà fait manuellement, 
      // ici on pourrait colorer une cellule du tableau si besoin, 
      // mais le statut général est en haut.
      // Cependant, pour la cohérence, si on veut colorer le texte du statut en haut :
    }
  });

  // Pour colorer le statut en haut du document (car c'est là qu'il se trouve dans OrderDetail)
  const statusColors: Record<string, [number, number, number]> = {
    pending: [133, 77, 14], // Yellow-800
    confirmed: [30, 64, 175], // Blue-800
    processing: [55, 48, 163], // Indigo-800
    shipped: [107, 33, 168], // Purple-800
    delivered: [22, 101, 52], // Green-800
    cancelled: [153, 27, 27] // Red-800
  };
  
  if (statusColors[order.value.status]) {
    const color = statusColors[order.value.status];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
  }
  doc.text(`Statut: ${getStatusText(order.value.status)}`, 14, 57);
  doc.setTextColor(0); // Reset to black
  doc.setFont('helvetica', 'normal');

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`TOTAL FINAL: ${formatCurrency(order.value.total_amount)}`, 14, finalY);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Merci de votre confiance | HTFasil Market', 105, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`Commande_${order.value.id}.pdf`);
};



const formattedAddress = computed(() => {
    if (!order.value || !order.value.shipping_address) return 'Non spécifiée';
    try {
        if (order.value.shipping_address.startsWith('{')) {
            const addr = JSON.parse(order.value.shipping_address);
            return `${addr.street || ''}, ${addr.city || ''}, ${addr.country || ''}`;
        }
        return order.value.shipping_address;
    } catch (e) {
        return order.value.shipping_address;
    }
});

onMounted(() => {
  fetchOrder()
})
</script>
