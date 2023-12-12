<script setup lang="ts">
import { ref } from 'vue'

interface Child {
  id: string
  title: string
}

interface Parent {
  id: string
  title: string
  items: Child[]
}

const parents = ref<Parent[]>([
  {
    id: '1',
    title: 'Parent 1',
    items: [
      { id: '101', title: 'Child 1.1' },
      { id: '102', title: 'Child 1.2' },
      { id: '102', title: 'Child 1.3' }
    ]
  },
  {
    id: '2',
    title: 'Parent 2',
    items: []
  },
  {
    id: '3',
    title: 'Parent 3',
    items: []
  }
])

function handleAddParent() {
  parents.value.push({
    id: crypto.randomUUID(),
    title: 'new Parent',
    items: []
  })
}

function handleAddChild(parent: Parent) {
  const foundParent = parents.value.find((p) => p.id === parent.id)
  if (!foundParent) return

  foundParent.items.push({ id: crypto.randomUUID(), title: 'new child' })
}

// 드래그 중인 child와 그 위치 정보를 저장하는 변수
let draggedChild: Child | null = null // 드래그 중인 자식
let originalPrentIndex: number | null = null // 드래그 시작한 부모의 인덱스
let originalChildIndex: number | null = null // 드래그 시작한 자식의 인덱스
let placeholderPosition: { parentIndex: number; childIndex: number } | null = null // 드래그 중인 자식의 잠재적인 새 위치

/**
 * 드래그 시작시 호출되는 함수
 * 자식을 드래그하기 시작할때 호출됨
 */
function handleDragStart(parentIndex: number, childIndex: number) {
  // 드래그 중인 자식과 자식의 위치 정보를 저장
  draggedChild = parents.value[parentIndex].items[childIndex]
  originalPrentIndex = parentIndex
  originalChildIndex = childIndex
  placeholderPosition = { parentIndex, childIndex }
}

/** 드래그 중인 자식이 새로운 위치 위에 있을 때마다 호출 */
function handleDragOver(targetParentIndex: number, targetChildIndex: number) {
  // 드래그 중인 자식이 없거나 시작 위치 정보가 없다면 리턴
  if (!draggedChild || originalPrentIndex === null || originalChildIndex === null) return

  // 드래그 중인 자식이 같은 위치에 있으면 위치 업데이트 X
  if (
    placeholderPosition &&
    placeholderPosition.parentIndex === targetParentIndex &&
    placeholderPosition.childIndex === targetChildIndex
  ) {
    return
  }

  // 드래그 중인 자식의 잠재적인 새 위치 업데이트
  placeholderPosition = { parentIndex: targetParentIndex, childIndex: targetChildIndex }

  // 다른 부모로 이동하는 경우 처리
  if (originalPrentIndex !== targetParentIndex) {
    // 원래 부모에서 자식 제거
    const originalChilds = [...parents.value[originalPrentIndex].items]
    originalChilds.splice(originalChildIndex, 1)
    parents.value[originalPrentIndex].items = originalChilds

    // 새 부모에 자식 추가
    const targetChilds = [...parents.value[targetParentIndex].items]
    targetChilds.splice(targetChildIndex, 0, draggedChild)
    parents.value[targetParentIndex].items = targetChilds

    // 드래그 중인 자식의 원래 위치 정보를 업데이트
    originalPrentIndex = targetParentIndex
    originalChildIndex = targetChildIndex
    return
  }

  // 같은 부모 내에서 이동하는 경우 처리
  const newChilds = [...parents.value[targetParentIndex].items]
  newChilds.splice(originalChildIndex, 1) // 원래 위치에서 자식 제거
  newChilds.splice(targetChildIndex, 0, draggedChild) // 새 위치에 자식 삽입
  parents.value[targetParentIndex].items = newChilds

  // 드래그 중인 자식의 원래 위치 정보를 업데이트
  originalChildIndex = targetChildIndex
}

/**
 * 드롭 영역에 자식을 놓았을 때 호출되는 함수
 * 자식을 새 위치에 놓았을 때 이 함수가 호출
 */
function handleDropItem(targetParentIndex: number) {
  // 드래그 중인 자식 없거나 시작 위치 정보가 없는 경우 함수를 종료
  if (!draggedChild || originalPrentIndex === null || originalChildIndex === null) {
    return
  }

  // 같은 부모 내에서의 이동이 아닌 경우, 원래 부모에서 자식 제거
  if (originalPrentIndex !== targetParentIndex) {
    parents.value[originalPrentIndex].items.splice(originalChildIndex, 1)
  }

  // 새 위치에 자식 삽입
  const newChildIndex =
    placeholderPosition && placeholderPosition.childIndex !== null
      ? placeholderPosition.childIndex
      : parents.value[targetParentIndex].items.length
  parents.value[targetParentIndex].items.splice(newChildIndex, 0, draggedChild)

  // 같은 부모 내에서의 이동인 경우, 원래 위치에서 자식 제거
  if (originalPrentIndex === targetParentIndex) {
    parents.value[targetParentIndex].items.splice(
      originalChildIndex < newChildIndex ? originalChildIndex : originalChildIndex + 1,
      1
    )
  }

  // 드래그 데이터 초기화
  clearDragState()
}

/**
 * 부모 내에서 자식을 드롭했을 때 호출되는 함수
 * 같은 부모 내에서 자식을 새 위치에 놓았을 때 이 함수가 호출됨
 */
function handleDropChildInsideParent(targetParentIndex: number, targetChildIndex: number) {
  // 드래그 중인 자식이 있고, 같은 부모 내에서의 이동이면
  if (draggedChild && originalPrentIndex === targetParentIndex) {
    parents.value[targetParentIndex].items.splice(originalChildIndex!, 1) // 원래 위치에서 자식을 제거
    parents.value[targetParentIndex].items.splice(targetChildIndex, 0, draggedChild) // 새 위치에 자식을 삽입
    clearDragState()
  }
}

/**
 * 드래그 데이터를 초기화하는 함수
 * 드래그 작업이 끝난 후에 호출되어 모든 드래그 관련 데이터를 초기화
 */
function clearDragState() {
  draggedChild = null
  originalPrentIndex = null
  originalChildIndex = null
  placeholderPosition = null
}

/**
 * 현재 위치가 드래그 중인 자식의 잠재적인 새 위치인지 확인하는 함수
 */
function isPlaceholder(parentIndex: number, childIndex: number) {
  // placeholderPosition이 유효하고, 현재 위치가 잠재적인 새 위치와 일치하면 true를 반환
  return (
    placeholderPosition &&
    placeholderPosition.parentIndex === parentIndex &&
    placeholderPosition.childIndex === childIndex
  )
}
</script>

<template>
  <main class="wrap">
    <div class="action-list">
      <button type="button" class="a-btn" @click="handleAddParent">Add Parent</button>
    </div>

    <ul class="parent-list">
      <li
        v-for="(parent, parentIndex) in parents"
        :key="parent.id"
        class="parent"
        @drop="handleDropItem(parentIndex)"
        @dragover.prevent
      >
        <h3>{{ parent.title }}</h3>
        <ul class="child-list">
          <li
            v-for="(item, childIndex) in parent.items"
            :key="item.id"
            draggable="true"
            class="child"
            :class="{ placeholder: isPlaceholder(parentIndex, childIndex) }"
            @dragstart="handleDragStart(parentIndex, childIndex)"
            @dragover.prevent="handleDragOver(parentIndex, childIndex)"
            @drop="handleDropChildInsideParent(parentIndex, childIndex)"
          >
            <h4>{{ item.title }}</h4>
          </li>
        </ul>

        <div class="action-list">
          <button type="button" class="a-btn" @click="handleAddChild(parent)">Add Child</button>
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.wrap {
  min-height: 100vh;
  padding: 5rem;
}

.action-list {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.parent-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.parent {
  padding: 1rem;
  background-color: #f9f9fa;
  border-radius: 0.75rem;
  border: 1px solid #dee2e6;
  list-style: none;
}

.child {
}

.placeholder {
  background-color: #f0f0f0;
  border-radius: 0.5rem;
  border: 1px solid #ced4da;
}
</style>
