<template>
  <div class="flex">
    <input
      type="text"
      placeholder="할 일을 입력하세요"
      v-model="inputValue"
      class="mr-4 pl-3 h-9 border border-gray-200 rounded-md" />
    <button
      @click="handleAdd"
      class="flex items-center justify-center px-3 py-2 h-9 rounded-md bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white">
      추가
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["add"]);

const inputValue = ref("");

function handleAdd() {
  const todo = inputValue.value;
  emit("add", todo);
  clearInput();
}

function clearInput() {
  inputValue.value = "";
}
</script>

<style lang="scss" scoped></style>
