<template>
  <n-button @click="startSelection">开始截图</n-button>
  <div
    v-if="isSelecting"
    class="selection-overlay"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <div v-if="isDragging" class="selection-box" :style="selectionBoxStyles"></div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas';
import { ref, computed } from 'vue';
import { NButton } from 'naive-ui';

const emits = defineEmits(['addImage']);

const isSelecting = ref(false);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const endX = ref(0);
const endY = ref(0);

// 开始截图
const startSelection = () => {
  isSelecting.value = true;
};

// 鼠标按下，开始绘制选区
const onMouseDown = (e) => {
  isDragging.value = true;
  startX.value = e.clientX;
  startY.value = e.clientY;
  endX.value = startX.value;
  endY.value = startY.value;
};

// 鼠标移动，更新选区
const onMouseMove = (e) => {
  if (!isDragging.value) return;
  endX.value = e.clientX;
  endY.value = e.clientY;
};

// 鼠标松开，完成选区并截图
const onMouseUp = () => {
  isDragging.value = false;
  isSelecting.value = false;

  // 计算截图区域
  const selectionWidth = Math.abs(endX.value - startX.value);
  const selectionHeight = Math.abs(endY.value - startY.value);
  html2canvas(document.querySelector('body')).then((canvas) => {
    const ctx = canvas.getContext('2d');
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    croppedCanvas.width = selectionWidth;
    croppedCanvas.height = selectionHeight;

    croppedCtx.drawImage(
      canvas,
      startX.value,
      startY.value,
      selectionWidth,
      selectionHeight,
      0,
      0,
      selectionWidth,
      selectionHeight
    );

    const screenshot = croppedCanvas.toDataURL("image/png");
    emits('addImage', screenshot);
  });
};

const selectionBoxStyles = computed(() => {
  const left = Math.min(startX.value, endX.value);
  const top = Math.min(startY.value, endY.value);
  const width = Math.abs(endX.value - startX.value);
  const height = Math.abs(endY.value - startY.value);

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
    border: '2px dashed #007bff'
  };
});
</script>

<style scoped>
.screenshot-container {
  position: relative;
}

.content-to-capture {
  width: 100%;
  padding: 20px;
  border: 1px solid #ccc;
}

.screenshot-preview img {
  max-width: 100%;
  border: 1px solid #ccc;
}

.selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2);
  z-index: 999;
}

.selection-box {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
}
</style>
