<template>
  <SiteHeader />
  <main class="siteMain">
    <slot />
  </main>
  <SiteFooter />
</template>

<style>
.siteMain {
  flex: 1;
}
</style>
