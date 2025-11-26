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
        'pt-8 pb-4 flex',
        !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start',
      ]"
      style="flex-shrink: 0;"
    >
      <router-link to="/">
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="dark:hidden"
          :src="logoLight"
          alt="Logo"
          width="180"
          height="48"
        />
        <img
          v-if="isExpanded || isHovered || isMobileOpen"
          class="hidden dark:block"
          :src="logoDark"
          alt="Logo"
          width="180"
          height="48"
        />
        <img
          v-else
          :src="logoIcon"
          alt="Logo"
          width="40"
          height="40"
        />
      </router-link>
    </div>
    <div
      class="flex flex-col overflow-y-auto duration-300 ease-linear custom-scrollbar"
      style="height: calc(100vh - 8rem)"
    >
      <nav class="flex-1">
        <div class="flex flex-col gap-4">
          <div v-for="(menuGroup, groupIndex) in menuGroups" :key="groupIndex">
            <h2
              :class="[
                'mb-4 text-xs uppercase flex leading-[20px] text-gray-400',
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
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
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
                  />
                </button>
                <router-link
                  v-else-if="item.path"
                  :to="item.path"
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
                    class="menu-item-text"
                    >{{ item.name }}</span
                  >
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
const logoLight = '/images/logo/logo.png';
const logoDark = '/images/logo/logo-dark.svg';  // Utilisation du SVG existant
const logoIcon = '/images/logo/logo-icon.svg';  // Utilisation du SVG existant
import { useRoute } from "vue-router";

// Types pour les menu items
interface MenuItem {
  name: string;
  path?: string;
  subItems?: MenuItem[];
  icon?: Component; // Changed to accept Vue components
  new?: boolean;
  pro?: boolean;
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
import SidebarWidget from "./SidebarWidget.vue";
import { useSidebar } from "@/composables/useSidebar";

const route = useRoute();

const { isExpanded, isMobileOpen, isHovered, openSubmenu } = useSidebar();

const menuGroups: MenuGroup[] = [
  {
    title: "Menu",
    items: [
      {
        icon: GridIcon,
        name: "Tableau de bord",
        subItems: [{ name: "Tableau de bord", path: "/" }],
      },
      {
        icon: UserCircleIcon,
        name: "Clients",
        path: "/admin/clients"
      },
      {
        icon: BoxCubeIcon,
        name: "Produits",
        subItems: [
          { name: "Ajouter un produit", path: "/admin/products/create" },
          { name: "Liste des produits", path: "/admin/products" },
        ],
      },
      {
        icon: BoxCubeIcon,
        name: "Commandes",
        subItems: [
          { name: "Liste commandes", path: "/admin/orders" },
          { name: "En cours", path: "/admin/orders" },
          { name: "Livrées", path: "/admin/orders" },
          { name: "Annulées", path: "/admin/orders" },
        ],
      },
      {
        icon: CreditCardIcon,
        name: "Paiements",
        path: "/paiements"
      },
      {
        name: "Rapports",
        icon: TableIcon,
        path: "/admin/rapports",
      },
      {
        name: "Personnalisation",
        icon: PageIcon,
        path: "/admin/personnalisation",
      },
    ],
  },
  {
    title: "Others",
    items: [
      {
        icon: PieChartIcon,
        name: "Analytics",
        path: "/analytics",
      },
      {
        icon: BoxCubeIcon,
        name: "Ui Elements",
        subItems: [
          { name: "Alerts", path: "/alerts", pro: false },
          { name: "Avatars", path: "/avatars", pro: false },
          { name: "Badge", path: "/badge", pro: false },
          { name: "Buttons", path: "/buttons", pro: false },
          { name: "Images", path: "/images", pro: false },
          { name: "Videos", path: "/videos", pro: false },
        ],
      },
      {
        icon: PlugInIcon,
        name: "Authentication",
        subItems: [
          { name: "Signin", path: "/signin", pro: false },
          { name: "Signup", path: "/signup", pro: false },
        ],
      },
      // ... Add other menu items here
    ],
  },
];

const isActive = (path: string): boolean => {
  return route.path === path;
};

const toggleSubmenu = (groupIndex: number, itemIndex: number) => {
  const key = `${groupIndex}-${itemIndex}`;
  openSubmenu.value = openSubmenu.value === key ? null : key;
};

const isAnySubmenuRouteActive = computed(() => {
  return menuGroups.some((group) =>
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
      menuGroups[groupIndex].items[itemIndex].subItems?.some((subItem) =>
        isActive(subItem.path!)
      ))
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
