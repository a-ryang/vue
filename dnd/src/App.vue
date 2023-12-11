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

// 드래그 중인 항목과 그 위치 정보를 저장하는 변수
let draggedItem: Child | null = null // 드래그 중인 항목
let originalChapterIndex: number | null = null // 드래그 시작한 챕터의 인덱스
let originalItemIndex: number | null = null // 드래그 시작한 항목의 인덱스
let placeholderPosition: { chapterIndex: number; itemIndex: number } | null = null // 드래그 중인 항목의 잠재적인 새 위치

/**
 * 드래그 시작시 호출되는 함수
 * 항목을 드래그하기 시작할때 호출됨
 */
function handleDragStart(chapterIndex: number, itemIndex: number) {
  // 드래그 중인 항목과 그 위치 정보를 저장
  draggedItem = parents.value[chapterIndex].items[itemIndex]
  originalChapterIndex = chapterIndex
  originalItemIndex = itemIndex
  placeholderPosition = { chapterIndex, itemIndex }
}

/** 드래그 중인 항목이 새로운 위치 위에 있을 때마다 호출 */
function handleDragOver(targetChapterIndex: number, targetItemIndex: number) {
  // 드래그 중인 항목이 없거나 시작 위치 정보가 없다면 리턴
  if (!draggedItem || originalChapterIndex === null || originalItemIndex === null) return

  // 드래그 중인 항목이 같은 위치에 있으면 위치 업데이트 X
  if (
    placeholderPosition &&
    placeholderPosition.chapterIndex === targetChapterIndex &&
    placeholderPosition.itemIndex === targetItemIndex
  ) {
    return
  }

  // 드래그 중인 항목의 잠재적인 새 위치 업데이트
  placeholderPosition = { chapterIndex: targetChapterIndex, itemIndex: targetItemIndex }

  // 다른 챕터로 이동하는 경우 처리
  if (originalChapterIndex !== targetChapterIndex) {
    // 원래 챕터에서 항목 제거
    let originalItems = [...parents.value[originalChapterIndex].items]
    originalItems.splice(originalItemIndex, 1)
    parents.value[originalChapterIndex].items = originalItems

    // 새 챕터에 항목 추가
    let targetItems = [...parents.value[targetChapterIndex].items]
    targetItems.splice(targetItemIndex, 0, draggedItem)
    parents.value[targetChapterIndex].items = targetItems

    // 드래그 중인 항목의 원래 위치 정보를 업데이트
    originalChapterIndex = targetChapterIndex
    originalItemIndex = targetItemIndex
    return
  }

  // 같은 챕터 내에서 이동하는 경우 처리
  let newItems = [...parents.value[targetChapterIndex].items]
  newItems.splice(originalItemIndex, 1) // 원래 위치에서 항목 제거
  newItems.splice(targetItemIndex, 0, draggedItem) // 새 위치에 항목 삽입
  parents.value[targetChapterIndex].items = newItems

  // 드래그 중인 항목의 원래 위치 정보를 업데이트
  originalItemIndex = targetItemIndex
}

/**
 * 드롭 영역에 항목을 놓았을 때 호출되는 함수
 * 항목을 새 위치에 놓았을 때 이 함수가 호출
 */
function handleDropItem(targetChapterIndex: number) {
  // 드래그 중인 항목이 없거나 시작 위치 정보가 없는 경우 함수를 종료
  if (!draggedItem || originalChapterIndex === null || originalItemIndex === null) {
    return
  }

  // 같은 챕터 내에서의 이동이 아닌 경우, 원래 챕터에서 항목 제거
  if (originalChapterIndex !== targetChapterIndex) {
    parents.value[originalChapterIndex].items.splice(originalItemIndex, 1)
  }

  // 새 위치에 항목 삽입
  const newItemIndex =
    placeholderPosition && placeholderPosition.itemIndex !== null
      ? placeholderPosition.itemIndex
      : parents.value[targetChapterIndex].items.length
  parents.value[targetChapterIndex].items.splice(newItemIndex, 0, draggedItem)

  // 같은 챕터 내에서의 이동인 경우, 원래 위치에서 항목 제거
  if (originalChapterIndex === targetChapterIndex) {
    parents.value[targetChapterIndex].items.splice(
      originalItemIndex < newItemIndex ? originalItemIndex : originalItemIndex + 1,
      1
    )
  }

  // 드래그 데이터 초기화
  clearDragState()
}

/**
 * 챕터 내에서 항목을 드롭했을 때 호출되는 함수
 * 같은 챕터 내에서 항목을 새 위치에 놓았을 때 이 함수가 호출됨
 */
function handleDropItemInsideChapter(targetChapterIndex: number, targetItemIndex: number) {
  // 드래그 중인 항목이 있고, 같은 챕터 내에서의 이동이면
  if (draggedItem && originalChapterIndex === targetChapterIndex) {
    parents.value[targetChapterIndex].items.splice(originalItemIndex!, 1) // 원래 위치에서 항목을 제거
    parents.value[targetChapterIndex].items.splice(targetItemIndex, 0, draggedItem) // 새 위치에 항목을 삽입
    clearDragState()
  }
}

/**
 * 드래그 데이터를 초기화하는 함수
 * 드래그 작업이 끝난 후에 호출되어 모든 드래그 관련 데이터를 초기화
 */
function clearDragState() {
  draggedItem = null
  originalChapterIndex = null
  originalItemIndex = null
  placeholderPosition = null
}

/**
 * 현재 위치가 드래그 중인 항목의 잠재적인 새 위치인지 확인하는 함수
 */
function isPlaceholder(chapterIndex: number, itemIndex: number) {
  // placeholderPosition이 유효하고, 현재 위치가 잠재적인 새 위치와 일치하면 true를 반환
  return (
    placeholderPosition &&
    placeholderPosition.chapterIndex === chapterIndex &&
    placeholderPosition.itemIndex === itemIndex
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
            v-for="(item, itemIndex) in parent.items"
            :key="item.id"
            draggable="true"
            class="child"
            :class="{ placeholder: isPlaceholder(parentIndex, itemIndex) }"
            @dragstart="handleDragStart(parentIndex, itemIndex)"
            @dragover.prevent="handleDragOver(parentIndex, itemIndex)"
            @drop="handleDropItemInsideChapter(parentIndex, itemIndex)"
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
