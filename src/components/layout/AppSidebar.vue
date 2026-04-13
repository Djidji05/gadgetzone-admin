<template>
  <aside
    :class="[
      'fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-99999 border-r border-gray-200',
      {
        'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
        'lg:w-[90px]': !isExpanded && !isHovered,
        'translate-x-0 w-[290px]': isMobileOpen,
        '-translate-x-full': !isMobileOpen,
        'lg:translate-x-0': true,
      },
    ]"
    @mouseenter="!isExpanded && (isHovered = true)"
    @mouseleave="isHovered = false"
  >
    <div
      :class="[
        'pt-4 pb-2 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
      style="flex-shrink: 0;"
    >
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          :src="settingsStore.logoUrl"
          alt="Logo"
          class="max-h-[80px] w-auto"
        />
        <img
          v-else
          :src="settingsStore.logoIconUrl"
          alt="Logo"
          class="max-h-[75px] max-w-[75px] object-contain"
        />
      </router-link>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar-hover"
      style="height: calc(100vh - 8rem)"
    >
      <nav class="flex-1">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400 dark:text-gray-500',
                !isExpanded && !isHovered
                  ? 'lg:justify-center'
                  : 'justify-start',
              ]"
            >
              <template v-if="isExpanded || isHovered || isMobileOpen">
                {{ menuGroup.title }}
              </template>
              <HorizontalDots v-else />
            </h2>
            <ul class="flex flex-col gap-4">
              <li v-for="(item, index) in menuGroup.items" :key="item.name">
                <button
                  v-if="item.subItems"
                  @click="toggleSubmenu(groupIndex, index)"
                  :class="[
                    'menu-item group w-full',
                    {
                      'menu-item-active': isSubmenuOpenWithRoute(groupIndex, index),
                      'menu-item-inactive': !isSubmenuOpenWithRoute(groupIndex, index),
                    },
                    !isExpanded && !isHovered
                      ? 'lg:justify-center'
                      : 'lg:justify-start',
                  ]"
                >
                  <span
                    :class="[
                      isSubmenuOpenWithRoute(groupIndex, index)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text flex items-center"
                  >
                    {{ item.name }}
                    <span v-if="item.badge && item.badge > 0 && !isSubmenuOpenWithRoute(groupIndex, index)" class="ml-2 font-bold text-red-600 text-[13px]">
                      {{ item.badge > 99 ? '99+' : item.badge }}
                    </span>
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    :class="[
                      'ml-auto w-5 h-5 transition-transform duration-200',
                      {
                        'rotate-180 text-brand-500': isSubmenuOpenWithRoute(
                          groupIndex,
                          index
                        ),
                      },
                    ]"
                  >
                    <ChevronDownIcon />
                  </span>

                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
                  @click="isMobileOpen = false"
                  :class="[
                    'menu-item group',
                    {
                      'menu-item-active': isActive(item.path),
                      'menu-item-inactive': !isActive(item.path),
                    },
                  ]"
                >
                  <span
                    :class="[
                      isActive(item.path)
                        ? 'menu-item-icon-active'
                        : 'menu-item-icon-inactive',
                    ]"
                  >
                    <component :is="item.icon" />
                  </span>
                  <span
                    v-if="isExpanded || isHovered || isMobileOpen"
                    class="menu-item-text flex items-center"
                  >
                    {{ item.name }}
                    <span v-if="item.badge && item.badge > 0" class="ml-2 font-bold text-red-600 text-[13px]">
                      {{ item.badge > 99 ? '99+' : item.badge }}
                    </span>
                  </span>
                </router-link>
                <transition
                  @enter="startTransition"
                  @after-enter="endTransition"
                  @before-leave="startTransition"
                  @after-leave="endTransition"
                >
                  <div
                    v-show="
                      isSubmenuOpenWithRoute(groupIndex, index) &&
                      (isExpanded || isHovered || isMobileOpen)
                    "
                  >
                    <ul class="mt-2 space-y-1 ml-9">
                      <li v-for="subItem in item.subItems" :key="subItem.name">
                        <router-link
                          :to="subItem.path || ''"
                          @click="isMobileOpen = false"
                          :class="[
                            'menu-dropdown-item',
                            {
                              'menu-dropdown-item-active': isActive(subItem.path || ''),
                              'menu-dropdown-item-inactive': !isActive(subItem.path || ''),
                            },
                          ]"
                        >
                          {{ subItem.name }}
                          <span class="flex items-center gap-1 ml-auto">
                            <span v-if="subItem.badge && subItem.badge > 0" class="font-bold text-red-600 text-[13px]">
                              {{ subItem.badge > 99 ? '99+' : subItem.badge }}
                            </span>
                            <span
                              v-if="subItem.pro"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path || ''),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path || ''),
                                },
                              ]"
                            >
                              PRO
                            </span>
                            <span
                              v-if="subItem.new"
                              :class="[
                                'menu-dropdown-badge',
                                {
                                  'menu-dropdown-badge-active': isActive(subItem.path || ''),
                                  'menu-dropdown-badge-inactive': !isActive(subItem.path || ''),
                                },
                              ]"
                            >
                              new
                            </span>
                          </span>
                        </router-link>
                      </li>
                    </ul>
                  </div>
                </transition>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <SidebarWidget v-if="isExpanded || isHovered || isMobileOpen" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useRoute } from "vue-router";

// Types pour les menu items
interface MenuItem {
  name: string;
  path?: string;
  subItems?: MenuItem[];
  icon?: Component; // Changed to accept Vue components
  new?: boolean;
  pro?: boolean;
  badge?: number;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

// Icônes disponibles
import GridIcon from '@/icons/GridIcon.vue';
import UserCircleIcon from '@/icons/UserCircleIcon.vue';
import TableIcon from '@/icons/TableIcon.vue';
import PageIcon from '@/icons/PageIcon.vue';
import PieChartIcon from '@/icons/PieChartIcon.vue';
import BoxCubeIcon from '@/icons/BoxCubeIcon.vue';
import CreditCardIcon from '@/icons/CreditCardIcon.vue';
import PlugInIcon from '@/icons/PlugInIcon.vue';
import HorizontalDots from '@/icons/HorizontalDots.vue';
import ChevronDownIcon from '@/icons/ChevronDownIcon.vue';
import ChatIcon from "@/icons/ChatIcon.vue";
import SettingsIcon from "@/icons/SettingsIcon.vue";
import { Activity as ActivityIcon } from 'lucide-vue-next';
import { useSidebar } from "@/composables/useSidebar";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import { vendorService, statsService } from "@/services/api";
import { ref, onMounted, onUnmounted } from "vue";
import SidebarWidget from "./SidebarWidget.vue";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

const notificationStats = ref({
  pendingOrdersCount: 0,
  unreadMessagesCount: 0,
  newClientsCount: 0,
  newProductsCount: 0,
  pendingStoresCount: 0,
});

const fetchNotificationStats = async () => {
  const role = authStore.userRole || authStore.user?.role;
  
  try {
    if (role === 'seller') {
      const data = await vendorService.getSummary();
      notificationStats.value = data;
    } else {
      const data = await statsService.getNotificationsCount();
      notificationStats.value = data;
    }
  } catch (error) {
    console.error('Error fetching notification stats:', error);
  }
};

let statsInterval: any = null;

onMounted(() => {
  fetchNotificationStats();
  statsInterval = setInterval(fetchNotificationStats, 60000);
});

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval);
});

const allMenuGroups: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      {
        icon: GridIcon,
        name: "Tableau de bord",
        subItems: [{ name: "Tableau de bord", path: "/" }],
      },
      {
        icon: ChatIcon,
        name: "Messages", // Sera renommé dynamiquement dans menuGroups
        path: "/messages",
      },
      {
        icon: UserCircleIcon,
        name: "Clients",
        path: "/clients"
      },
      {
        icon: BoxCubeIcon,
        name: "Produits",
        subItems: [
          { name: "Tous les produits", path: "/liste-produits" },
          { name: "Ajouter un produit", path: "/ajouter-produit" },
          { name: "Marques", path: "/produits/marques" },
          { name: "Catégories", path: "/categories" },
        ],
      },
      {
        icon: BoxCubeIcon,
        name: "Commandes",
        subItems: [
          { name: "Toutes les commandes", path: "/liste-commandes" },
          { name: "En cours", path: "/commandes-en-cours" },
          { name: "Livrées", path: "/commandes-livrees" },
          { name: "Annulées", path: "/commandes-annulees" },
        ],
      },
      {
        icon: CreditCardIcon,
        name: "Finances",
        subItems: [
          { name: "Vue d'ensemble", path: "/finance" },
          { name: "Paiements & Retraits", path: "/paiements" },
        ],
      },
      {
        icon: BoxCubeIcon,
        name: "Vendeurs",
        subItems: [
          { name: "Candidatures", path: "/vendors/applications" },
          { name: "Ma Boutique", path: "/vendors/settings" },
        ],
      },
    ],
  },
  {
    title: "Marketing & Contenu",
    items: [
      {
        icon: PieChartIcon,
        name: "Marketing",
        subItems: [
          { name: "Newsletter", path: "/marketing/newsletter" },
          { name: "Ambassadeurs", path: "/marketing/ambassadeurs" },
          { name: "Promotions", path: "/marketing/promos" },
          { name: "Campagnes", path: "/marketing/campagnes" },
          { name: "Boosts", path: "/marketing/boosts" },
        ],
      },
      {
        icon: PageIcon,
        name: "Blog",
        path: "/marketing/blog",
      },
      {
        icon: PageIcon,
        name: "Pages Statiques",
        path: "/parametres/pages",
      },
      {
        icon: PageIcon,
        name: "Académie Vendeurs",
        path: "/academy",
      },
      {
        icon: BoxCubeIcon,
        name: "Bannières & Slider",
        path: "/personalization",
      }
    ],
  },
  {
    title: "Système",
    items: [
      {
        icon: UserCircleIcon,
        name: "Utilisateurs",
        subItems: [
          { name: "Liste utilisateurs", path: "/utilisateurs/liste" },
          { name: "Rôles & Permissions", path: "/utilisateurs/roles" },
        ],
      },
      {
        icon: SettingsIcon,
        name: "Paramètres",
        subItems: [
          { name: "Général", path: "/parametres/general" },
          { name: "Sécurité", path: "/parametres/securite" },
          { name: "Email", path: "/parametres/email" },
          { name: "Paiements", path: "/parametres/paiements" },
          { name: "Commissions", path: "/parametres/commissions" },
          { name: "Documentation API", path: "/parametres/api" },
        ],
      },
      {
        icon: ActivityIcon,
        name: "SEO & Santé",
        path: "/seo",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: UserCircleIcon,
        name: "Support",
        subItems: [
          { name: "FAQ", path: "/support/faq" },
          { name: "Tickets", path: "/support/tickets" },
          { name: "Litiges", path: "/support/disputes" },
          { name: "Documentation", path: "/support/documentation" },
          { name: "Modération Avis", path: "/support/reviews" },
        ],
      },
      {
        icon: PieChartIcon,
        name: "Analytics",
        path: "/analytics",
      },
    ],
  },
];

const nameToKey: Record<string, string> = {
  "Menu": "menu",
  "Tableau de bord": "dashboard",
  "Messages": "messages",
  "Clients": "customers",
  "Produits": "products",
  "Tous les produits": "allProducts",
  "Ajouter un produit": "addProduct",
  "Marques": "brands",
  "Catégories": "categories",
  "Commandes": "orders",
  "Toutes les commandes": "allOrders",
  "En cours": "pending",
  "Livrées": "delivered",
  "Annulées": "cancelled",
  "Finances": "finance",
  "Vue d'ensemble": "overview",
  "Paiements & Retraits": "payouts",
  "Vendeurs": "vendors",
  "Candidatures": "applications",
  "Ma Boutique": "myStore",
  "Marketing & Contenu": "marketingContent",
  "Marketing": "marketing",
  "Newsletter": "newsletter",
  "Ambassadeurs": "ambassadors",
  "Promotions": "promotions",
  "Campagnes": "campaigns",
  "Blog": "blog",
  "Pages Statiques": "staticPages",
  "Académie Vendeurs": "sellerAcademy",
  "Bannières & Slider": "bannersSlider",
  "Système": "system",
  "Utilisateurs": "users",
  "Liste utilisateurs": "userList",
  "Rôles & Permissions": "rolesPermissions",
  "Paramètres": "settings",
  "Général": "general",
  "Sécurité": "security",
  "Email": "email",
  "Paiements": "payments",
  "Commissions": "commissions",
  "Documentation API": "apiDocs",
  "SEO & Santé": "seoHealth",
  "Support": "support",
  "FAQ": "faq",
  "Tickets": "tickets",
  "Litiges": "disputes",
  "Documentation": "documentation",
  "Modération Avis": "reviews",
  "Analytics": "analytics",
};

const menuGroups = computed(() => {
  const role = authStore.userRole || authStore.user?.role;
  
  // Filter groups
  const filteredGroups = allMenuGroups.filter(group => {
    // System group is for Admins only
    if (group.title === 'Système' && role !== 'admin') {
      return false;
    }
    // Marketing group is for Admins only (for now)
    if (group.title === 'Marketing & Contenu' && role === 'seller') {
      return false;
    }
    return true;
  });

  return filteredGroups.map(group => {
    // Translate group title
    const groupKey = nameToKey[group.title] || group.title.toLowerCase();
    const translatedTitle = t(`nav.${groupKey}`);

    const translatedItems = group.items.map(item => {
      // Special case for Sellers: Rename "Messages" to "Litiges"
      if (item.name === 'Messages' && role === 'seller') {
        const itemKey = nameToKey['Litiges'] || 'disputes';
        return { 
          ...item, 
          name: t(`nav.${itemKey}`), 
          path: '/messages?view=disputes',
          badge: notificationStats.value.unreadMessagesCount
        };
      }
      
      // Special case for Sellers: Add badge to "Commandes"
      if (item.name === 'Commandes' && role === 'seller') {
        const itemKey = nameToKey['Commandes'] || 'orders';
        return {
          ...item,
          name: t(`nav.${itemKey}`),
          badge: notificationStats.value.pendingOrdersCount
        };
      }
      
      // Badges for admin
      if (role !== 'seller') {
        if (item.name === 'Clients' || item.name === 'Utilisateurs') {
          item.badge = notificationStats.value.newClientsCount;
        } else if (item.name === 'Messages') {
          item.badge = notificationStats.value.unreadMessagesCount;
        }
      }
      
      const itemKey = nameToKey[item.name] || item.name.toLowerCase();
      const translatedName = t(`nav.${itemKey}`);

      const translatedSubItems = item.subItems?.map(sub => {
        const subKey = nameToKey[sub.name] || sub.name.toLowerCase().replace(/ & /g, '').replace(/ /g, '');
        let subItemBadge = sub.badge;
        
        if (role !== 'seller') {
          if (sub.name === 'Litiges') {
            subItemBadge = notificationStats.value.pendingDisputesCount;
          } else if (sub.name === 'Modération Avis') {
            subItemBadge = notificationStats.value.pendingReviewsCount;
          } else if (sub.name === 'En cours') {
            subItemBadge = notificationStats.value.pendingOrdersCount;
          } else if (sub.name === 'Livrées') {
            subItemBadge = notificationStats.value.recentDeliveredOrdersCount;
          } else if (sub.name === 'Annulées') {
            subItemBadge = notificationStats.value.recentCancelledOrdersCount;
          } else if (sub.name === 'Tous les produits') {
            subItemBadge = notificationStats.value.newProductsCount;
          } else if (sub.name === 'Candidatures') {
            subItemBadge = notificationStats.value.pendingStoresCount;
          }
        }
        
        return {
          ...sub,
          name: t(`nav.${subKey}`),
          badge: subItemBadge
        };
      });

      const totalSubItemBadges = translatedSubItems?.reduce((sum, sub) => sum + (sub.badge || 0), 0) || 0;

      return {
        ...item,
        name: translatedName,
        subItems: translatedSubItems,
        badge: (item.badge || 0) + totalSubItemBadges
      };
    });

    return {
      ...group,
      title: translatedTitle,
      items: translatedItems
    };
  });
});

const isActive = (path: string): boolean => {
  return route.path === path;
};

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.value.some((group) =>
    group.items.some(
      (item) =>
        item.subItems && item.subItems.some((subItem) => isActive(subItem.path!))
    )
  );
});

const isSubmenuOpenWithRoute = (groupIndex: number, itemIndex: number): boolean => {
  const key = `${groupIndex}-${itemIndex}`;
  return (
    Boolean(openSubmenu.value === key) ||
    (isAnySubmenuRouteActive.value &&
      menuGroups.value[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path!)
      )) || false
  );
};

const startTransition = (el: Element) => {
  (el as HTMLElement).style.height = "auto";
  const height = (el as HTMLElement).scrollHeight;
  (el as HTMLElement).style.height = "0px";
  (el as HTMLElement).offsetHeight; // force reflow
  (el as HTMLElement).style.height = height + "px";
};

const endTransition = (el: Element) => {
  (el as HTMLElement).style.height = "";
};
</script>
