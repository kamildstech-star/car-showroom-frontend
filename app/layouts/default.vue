<template>
  <div class="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased">
    <AppHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
