<script setup>
const { image, name, occupation } = defineProps([
  "image",
  "name",
  "occupation",
]);
</script>

<template>
  <NCard title="Card with Cover">
    <template #corver>
      <img :src="image" />
    </template>
    <h3>{{ name }}</h3>
    <p v-for="(job, index) in occupation" :key="job">
      {{ job }}<span v-if="index < occupation.length - 1">,&nbsp</span>
    </p>
  </NCard>
</template>

<style scoped>
w .n-card {
  width: 200px;
  margin: 10px 20px;
}
.n-card img {
  height: 250px;
}

p {
  font-size: 10px;
}

.jobs {
  display: flex;
  flex-wrap: wrap;
}
</style>
