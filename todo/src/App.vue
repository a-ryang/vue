<script setup>
import { ref } from "vue";

import TodoHero from "@/components/TodoHero.vue";
import TodoInput from "@/components/TodoInput.vue";
import TodoList from "@/components/TodoList.vue";

const todoItems = ref([]);

function fetchTodoList() {
  const result = [];

  for (let i = 0; i < localStorage.length; i++) {
    const todoItem = localStorage.key(i);
    result.push(todoItem);
  }

  return result;
}

todoItems.value = fetchTodoList();

function handleAddTodo(todo) {
  todoItems.value.push(todo);
  localStorage.setItem(todo, todo);
}

function handleRemoveTodo(todo, index) {
  todoItems.value.splice(index, 1);
  localStorage.removeItem(todo);
}
</script>

<template>
  <div class="flex flex-col items-center container mx-auto min-h-screen">
    <TodoHero />
    <TodoInput @add="handleAddTodo" />
    <TodoList :todoItems="todoItems" @remove="handleRemoveTodo" />
  </div>
</template>

<style scoped></style>
