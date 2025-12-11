<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
    <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">FAQ - Questions Fréquentes</h2>
    
    <div class="space-y-4">
      <div v-for="(faq, index) in faqs" :key="index" class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <button @click="toggleFaq(index)" class="flex w-full items-center justify-between text-left">
          <h3 class="text-lg font-medium text-black dark:text-white">{{ faq.question }}</h3>
          <svg :class="['w-5 h-5 transition-transform', openFaq === index ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div v-show="openFaq === index" class="mt-4 text-gray-600 dark:text-gray-400">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const openFaq = ref<number | null>(null);

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index;
};

const faqs = ref([
  {
    question: 'Comment ajouter un nouveau produit ?',
    answer: 'Allez dans Produits > Ajouter un produit, remplissez le formulaire avec les informations du produit (nom, prix, description, images) et cliquez sur Enregistrer.'
  },
  {
    question: 'Comment gérer les commandes ?',
    answer: 'Accédez à la section Commandes pour voir toutes les commandes. Vous pouvez filtrer par statut (en cours, livrées, annulées) et mettre à jour le statut de chaque commande.'
  },
  {
    question: 'Comment configurer les méthodes de paiement ?',
    answer: 'Allez dans Paramètres > Paiements pour configurer vos méthodes de paiement (Stripe, PayPal, etc.).'
  },
  {
    question: 'Comment créer un compte utilisateur ?',
    answer: 'Dans Utilisateurs > Liste utilisateurs, cliquez sur "Nouvel utilisateur" et remplissez le formulaire avec les informations requises.'
  },
  {
    question: 'Comment exporter les rapports ?',
    answer: 'Dans la section Rapports, utilisez le bouton "Exporter" en haut à droite pour télécharger vos rapports au format PDF ou Excel.'
  }
]);
</script>
