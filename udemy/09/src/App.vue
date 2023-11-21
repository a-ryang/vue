<script setup>
import PokemonCrads from "./components/PokemonCrads.vue";
</script>

<template>
  <main>
    <h1>Hero</h1>
    <Suspense>
      <template #default><PokemonCrads /></template>
      <template #fallback>
        <div>
          <p>loading...</p>
        </div>
      </template>
    </Suspense>
  </main>
</template>

<style scoped></style>
