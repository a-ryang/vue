<script setup lang="ts">
import { ref } from 'vue'

interface Child {
  id: string
  title: string
}

interface Parent {
  id: string
  title: string
  childs: Child[]
}

const parents = ref<Parent[]>([
  {
    id: '1',
    title: 'Parent 1',
    childs: [
      { id: '101', title: 'Child 1.1' },
      { id: '102', title: 'Child 1.2' },
      { id: '102', title: 'Child 1.3' }
    ]
  },
  {
    id: '2',
    title: 'Parent 2',
    childs: []
  },
  {
    id: '3',
    title: 'Parent 3',
    childs: []
  }
])

function handleAddParent() {
  parents.value.push({
    id: crypto.randomUUID(),
    title: 'new Parent',
    childs: []
  })
}

function handleAddChild(parent: Parent) {
  const foundParent = parents.value.find((p) => p.id === parent.id)
  if (!foundParent) return

  foundParent.childs.push({ id: crypto.randomUUID(), title: 'new child' })
}
</script>

<template>
  <main>
    <div class="container">
      <ul class="parent-list">
        <li v-for="p of parents" :key="p.id">
          <section class="parent">
            <header>
              <h1>{{ p.title }}</h1>
            </header>
            <div>
              <ul class="child-list">
                <li v-for="c of p.childs" :key="c.id">
                  <section class="child">
                    <header>
                      <h1>{{ c.title }}</h1>
                    </header>
                    <div>child content</div>
                  </section>
                </li>
              </ul>
            </div>
          </section>
        </li>
      </ul>
    </div>
  </main>
  <Teleport to="body">
    <div class="float">
      <button class="a-btn" @click="handleAddParent">add parent</button>
    </div>
  </Teleport>
</template>

<style scoped>
main {
  min-height: 100vh;
  padding: 3rem;
  background-color: #1864ab;
}

.container {
  padding: 1rem;
  border-radius: 1rem;
  background-color: white;
}

.container * {
  list-style: none;
}

.parent-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.parent {
  padding: 1rem;
  background-color: var(--gray-50);
  border: 1px solid var(--gray-400);
  border-radius: 10px;
}

.parent h1 {
  font-size: 1.25rem;
}

.child-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.child {
  padding: 1rem;
  background-color: white;
  border: 1px solid var(--gray-400);
  border-radius: 10px;
}

.child header {
  cursor: grab;
}

.child h1 {
  font-size: 1rem;
}

.float {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
}

.a-btn {
  background-color: white;
}
</style>
