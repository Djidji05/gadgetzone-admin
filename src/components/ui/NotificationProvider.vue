<template>
  <div class="notification-provider">
    <!-- Toasts Container -->
    <div class="fixed top-4 right-4 z-[9999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in uiStore.toasts" 
          :key="toast.id"
          class="pointer-events-auto p-4 rounded-lg shadow-lg border flex items-center justify-between transition-all duration-300 translate-x-0"
          :class="[
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            toast.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          ]"
        >
          <div class="flex items-center gap-3">
            <i 
              class="fas"
              :class="[
                toast.type === 'success' ? 'fa-check-circle text-green-500' :
                toast.type === 'error' ? 'fa-exclamation-circle text-red-500' :
                toast.type === 'warning' ? 'fa-exclamation-triangle text-yellow-500' :
                'fa-info-circle text-blue-500'
              ]"
            ></i>
            <span class="text-sm font-medium">{{ toast.message }}</span>
          </div>
          <button @click="uiStore.removeToast(toast.id)" class="ml-4 text-current opacity-50 hover:opacity-100 transition-opacity">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <div v-if="uiStore.confirmDialog.show" class="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="uiStore.handleConfirm(false)"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
          <div class="p-6">
            <div class="flex items-start gap-4">
              <div 
                class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
                :class="uiStore.confirmDialog.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'"
              >
                <i 
                  class="fas text-xl"
                  :class="uiStore.confirmDialog.type === 'danger' ? 'fa-exclamation-triangle' : 'fa-question-circle'"
                ></i>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ uiStore.confirmDialog.title }}</h3>
                <p class="text-sm text-gray-500">{{ uiStore.confirmDialog.message }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button 
              @click="uiStore.handleConfirm(false)"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {{ uiStore.confirmDialog.cancelText }}
            </button>
            <button 
              @click="uiStore.handleConfirm(true)"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm"
              :class="uiStore.confirmDialog.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
            >
              {{ uiStore.confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Prompt Modal -->
    <Teleport to="body">
      <div v-if="uiStore.promptDialog.show" class="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="uiStore.handlePrompt(null)"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
          <div class="p-6">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600">
                <i class="fas fa-edit text-xl"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-1">{{ uiStore.promptDialog.title }}</h3>
                <p class="text-sm text-gray-500">{{ uiStore.promptDialog.message }}</p>
              </div>
            </div>
            
            <textarea
              v-model="uiStore.promptDialog.value"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-32 text-sm"
              :placeholder="uiStore.promptDialog.placeholder"
              autofocus
            ></textarea>
          </div>
          
          <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button 
              @click="uiStore.handlePrompt(null)"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {{ uiStore.promptDialog.cancelText }}
            </button>
            <button 
              @click="uiStore.handlePrompt(uiStore.promptDialog.value)"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {{ uiStore.promptDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
