<template>
  <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <h2 class="mb-6 text-title-md2 font-bold text-black dark:text-white">Support</h2>
      
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-title-md font-bold">42</h4>
              <span class="text-sm">Tickets ouverts</span>
            </div>
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
              <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-title-md font-bold">2.5h</h4>
              <span class="text-sm">Temps de réponse moyen</span>
            </div>
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
              <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-title-md font-bold">95%</h4>
              <span class="text-sm">Satisfaction client</span>
            </div>
            <div class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2">
              <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div class="px-4 py-6 md:px-6 xl:px-7.5">
          <h4 class="text-xl font-bold">Tickets récents</h4>
        </div>
        <div class="p-6">
          <p class="text-center text-gray-500">Aucun ticket pour le moment</p>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
</script>
