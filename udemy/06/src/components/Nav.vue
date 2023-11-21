<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="wrap">
    <RouterLink active-class="active" to="/">Home</RouterLink>
    <RouterLink active-class="active" to="/about">About</RouterLink>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  gap: 1rem;
}
.active {
  font-weight: 900;
  color: rgb(153, 104, 14);
}
</style>
