<script setup lang="ts">
import { ref } from 'vue'

/**
 * 기본적으로는 브라우저는 HTML 요소에 뭔가를 드롭했을 때 아무 일도 일어나지 않도록 합니다.
 * 특정 요소가 드롭 지역 혹은 droppable로 만들기 위해서는 해당 요소가
 * ondragover (en-US)와 ondrop (en-US) 이벤트 핸들러 속성을 가져야합니다.
 */

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
      { id: '103', title: 'Child 1.3' }
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

// dnd -------------------------------------------------------------------
const currentDragTarget = ref<{ pId: string; cId: string } | null>(null)

function handleDrag(pId: string, cId: string) {
  currentDragTarget.value = { pId, cId }
}

function handleDragStart(e: DragEvent) {
  if (!e.dataTransfer || !(e.target instanceof HTMLElement)) return
  e.dataTransfer.effectAllowed = 'move' // 드래그 작업에 허용되는 효과를 지정
}

function handleDragOver(targetParentId: string, targetCId?: string) {
  if (!currentDragTarget.value) return

  const { pId: draggedParentId, cId: draggedCId } = currentDragTarget.value

  // 드래그 중인 child가 다른 부모 요소 위에 있는 경우
  if (draggedParentId !== targetParentId) {
    moveChildToDifferentParent(draggedParentId, targetParentId, draggedCId)
  } else if (targetCId) {
    // 같은 부모 내에서 다른 위치로 이동하는 경우
    reorderChildWithinParent(draggedParentId, draggedCId, targetCId)
  }
}

function moveChildToDifferentParent(
  draggedParentId: string,
  targetParentId: string,
  draggedCId: string
) {
  // 다른 부모로 이동하는 로직 구현
  const draggedParent = parents.value.find((p) => p.id === draggedParentId)
  const targetParent = parents.value.find((p) => p.id === targetParentId)

  if (!draggedParent || !targetParent) return

  const draggedChildIdx = draggedParent.childs.findIndex((c) => c.id === draggedCId)
  if (draggedChildIdx === -1) return

  // 드래그 중인 child를 원래 부모에서 제거하고 새로운 부모에 추가
  const [draggedChild] = draggedParent.childs.splice(draggedChildIdx, 1)
  targetParent.childs.push(draggedChild)

  if (currentDragTarget.value) {
    currentDragTarget.value.pId = targetParent.id
  }
}

function reorderChildWithinParent(parentId: string, draggedCId: string, targetCId: string) {
  // 같은 부모 내에서 재정렬
  const parent = parents.value.find((p) => p.id === parentId)
  if (!parent) return

  const draggedIndex = parent.childs.findIndex((c) => c.id === draggedCId)
  const targetIndex = parent.childs.findIndex((c) => c.id === targetCId)

  if (draggedIndex < 0 || targetIndex < 0 || draggedIndex === targetIndex) return

  // 드래그 중인 child를 새로운 위치로 이동
  const [draggedChild] = parent.childs.splice(draggedIndex, 1)
  parent.childs.splice(targetIndex, 0, draggedChild)
}

function handleDragEnd() {
  if (!currentDragTarget.value) return
  currentDragTarget.value = null
}

// 클릭후 드래그 하지 않고 마우스를 바로 놓았을때
function handleMouseUp() {
  currentDragTarget.value = null
}

function isDraggable(cId: string) {
  return currentDragTarget.value?.cId === cId
}
</script>

<template>
  <main>
    <div class="container">
      <!-- 부모 리스트 -->
      <ul class="parent-list">
        <li
          v-for="p of parents"
          :key="p.id"
          class="parent"
          @dragover.prevent="handleDragOver(p.id)"
          @drop.prevent="handleDragEnd"
        >
          <section>
            <header>
              <h1>{{ p.title }}</h1>
            </header>
            <div>
              <ul class="child-list">
                <li
                  v-for="c of p.childs"
                  :key="c.id"
                  :id="`drag-${c.id}`"
                  class="child"
                  :class="{ dragging: isDraggable(c.id) }"
                  :draggable="isDraggable(c.id)"
                  @dragstart="handleDragStart"
                  @dragover.prevent="handleDragOver(p.id, c.id)"
                  @mouseup="handleMouseUp"
                  @dragend="handleDragEnd"
                >
                  <section>
                    <header @mousedown="handleDrag(p.id, c.id)" @touch="handleDrag(p.id, c.id)">
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
