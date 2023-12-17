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
    id: crypto.randomUUID(),
    title: 'Parent 1',
    childs: [
      { id: crypto.randomUUID(), title: 'Child 1.1' },
      { id: crypto.randomUUID(), title: 'Child 1.2' },
      { id: crypto.randomUUID(), title: 'Child 1.3' }
    ]
  },
  {
    id: crypto.randomUUID(),
    title: 'Parent 2',
    childs: []
  },
  {
    id: crypto.randomUUID(),
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

// dnd -------------------------------------------------------------------
const draggingContext = ref<{ draggingParentId: string; draggingChildId: string } | null>(null)

function handleDrag(parentId: string, childId: string) {
  draggingContext.value = { draggingParentId: parentId, draggingChildId: childId }
}

function handleDragStart(e: DragEvent) {
  if (!e.dataTransfer) return
  e.dataTransfer.effectAllowed = 'move' // 드래그 중일때 커서의 모양을 move로 지정
}

function handleDragOver(dragOverParentId: string, dragOverChildId?: string) {
  if (!draggingContext.value) return

  const { draggingParentId, draggingChildId } = draggingContext.value

  // 같은 parent 내에서 이동하는 경우
  if (draggingParentId === dragOverParentId) {
    reorderChild({
      parentId: draggingParentId,
      draggingChildId,
      targetChildId: dragOverChildId!
    })
    return
  }

  // 다른 parent로 이동하는 경우
  moveToAnotherParent({
    oldParentId: draggingParentId,
    newParentId: dragOverParentId,
    draggingChildId
  })
}

interface ReorderChild {
  parentId: string
  draggingChildId: string
  targetChildId: string
}

function reorderChild({ parentId, draggingChildId, targetChildId }: ReorderChild) {
  const parent = parents.value.find((p) => p.id === parentId)
  if (!parent) return

  const draggingChildIndex = parent.childs.findIndex((c) => c.id === draggingChildId)
  const targetChildIndex = parent.childs.findIndex((c) => c.id === targetChildId)

  // 찾을 수 없다면(-1) 종료
  if (draggingChildIndex < 0 || targetChildIndex < 0) return
  // 같은 위치 드래그라면 종료
  if (draggingChildIndex === targetChildIndex) return

  // 드래그중인 child를 새로운 위치로 재정렬
  const [draggingChild] = parent.childs.splice(draggingChildIndex, 1)
  parent.childs.splice(targetChildIndex, 0, draggingChild)
}

interface MoveToAnotherParent {
  oldParentId: string
  newParentId: string
  draggingChildId: string
}

function moveToAnotherParent({ oldParentId, newParentId, draggingChildId }: MoveToAnotherParent) {
  const oldParent = parents.value.find((p) => p.id === oldParentId)
  const newParent = parents.value.find((p) => p.id === newParentId)
  if (!oldParent || !newParent) return

  const oldParentChilds = oldParent.childs
  const draggingChildIndex = oldParentChilds.findIndex((c) => c.id === draggingChildId)

  if (draggingChildIndex < 0) return

  const [draggingChild] = oldParentChilds.splice(draggingChildIndex, 1)
  newParent.childs.push(draggingChild)

  // 드래그 중인 parent id 업데이트
  if (draggingContext.value) {
    draggingContext.value.draggingParentId = newParentId
  }
}

function handleDragEnd() {
  draggingContext.value = null
}

// 클릭후 드래그 하지 않고 마우스를 바로 놓았을때
function handleMouseUp() {
  draggingContext.value = null
}

function isDraggable(childId: string) {
  return draggingContext.value?.draggingChildId === childId
}
</script>

<template>
  <main>
    <div class="container">
      <!-- 부모 리스트 -->
      <ul class="parent-list">
        <li
          v-for="p in parents"
          :key="p.id"
          class="parent"
          @dragover.prevent="handleDragOver(p.id)"
        >
          <section>
            <header>
              <h1>{{ p.title }}</h1>
            </header>
            <div>
              <ul class="child-list">
                <li
                  v-for="c in p.childs"
                  :key="c.id"
                  :id="`drag-${c.id}`"
                  class="child"
                  :class="{ dragging: isDraggable(c.id) }"
                  :draggable="isDraggable(c.id)"
                  @dragstart="handleDragStart"
                  @dragover.prevent="handleDragOver(p.id, c.id)"
                  @dragend="handleDragEnd"
                  @mouseup="handleMouseUp"
                >
                  <section>
                    <header @mousedown="handleDrag(p.id, c.id)">
                      <h1>{{ c.title }}</h1>
                    </header>
                    <div>child content</div>
                  </section>
                </li>
              </ul>
            </div>

            <footer>
              <button class="a-btn" @click="handleAddChild(p)">add child</button>
            </footer>
          </section>
        </li>
      </ul>
    </div>
  </main>
  <Teleport to="body">
    <div class="float">
      <button class="a-btn a-btn:lg" @click="handleAddParent">add parent</button>
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

.parent > * {
  padding: 1rem;
  background-color: var(--gray-50);
  border: 1px solid var(--gray-400);
  border-radius: 10px;
}

.parent h1 {
  font-size: 1.25rem;
}

.parent footer {
  margin-top: 1rem;
}

.dragging * {
  pointer-events: none; /* drag중인 요소의 자식 요소들 drag enter, drag leave 이벤트 끄기 */
}

.dragging {
  opacity: 0.4;
}

.child-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.child > * {
  padding: 1rem;
  background-color: white;
  border: 1px solid var(--gray-400);
  border-radius: 10px;
}

.child header {
  cursor: move;
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
