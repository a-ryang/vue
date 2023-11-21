<script setup>
const props = defineProps(["todoItems"]);

const emit = defineEmits(["remove"]);

function removeTodo(todo, index) {
  emit("remove", todo, index);
}
</script>

<template>
  <ul class="list-disc py-4">
    <li v-for="(item, index) in todoItems" :key="`${item}-${index}`">
      <span class="mr-2">{{ item }}</span>
      <button @click="removeTodo(item, index)" class="text-gray-700">
        삭제
      </button>
    </li>
  </ul>
</template>

<style></style>
