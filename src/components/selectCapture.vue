<template>
  <div
    v-if="isSelecting"
    class="selection-overlay"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <div v-if="isDragging" class="selection-box" :style="selectionBoxStyles">
      <!-- 拖动手柄 -->
      <div class="resize-handle top-left" @mousedown.stop="onHandleMouseDown('top-left')"></div>
      <div class="resize-handle top-right" @mousedown.stop="onHandleMouseDown('top-right')"></div>
      <div class="resize-handle bottom-left" @mousedown.stop="onHandleMouseDown('bottom-left')"></div>
      <div class="resize-handle bottom-right" @mousedown.stop="onHandleMouseDown('bottom-right')"></div>
      <n-space @mouseup.stop class="confirm-btns" v-if="isUp">
        <n-button @click.stop="cancelSelection" size="small" type="error">
          <n-icon><Close></Close></n-icon>
        </n-button>
        <n-button @click.stop="confirmSelection" size="small" type="primary">
        <n-icon><Checkmark></Checkmark></n-icon>
      </n-button>
    </n-space>
    </div>
  </div>
</template>

<script setup>
import html2canvas from 'html2canvas';
import { ref, computed } from 'vue';
import { NButton, NIcon, NSpace } from 'naive-ui';
import { Checkmark, Close } from '@vicons/ionicons5'

const emits = defineEmits(['addImage']);

const isSelecting = ref(false);
const isDragging = ref(false);
const screenshot = ref('');
const isUp = ref(false);

const resizing = ref(false);
const resizeDirection = ref('');

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
  if(isUp.value) return
  isUp.value = false;
  isDragging.value = true;
  startX.value = e.clientX;
  startY.value = e.clientY;
  endX.value = startX.value;
  endY.value = startY.value;
};

// 鼠标移动，更新选区
const onMouseMove = (e) => {
  if (isUp.value && !resizing.value) return;
  if (resizing.value) {
    // 根据拖动方向调整大小
    resizeSelection(e.clientX, e.clientY);
  } else {
    // 更新选择区域大小
    endX.value = e.clientX;
    endY.value = e.clientY;
  }
};

// 鼠标松开，完成选区并截图
const onMouseUp = () => {
  isUp.value = true;
  // 计算截图区域
  const selectionWidth = Math.abs(endX.value - startX.value);
  const selectionHeight = Math.abs(endY.value - startY.value);
  const el = document.querySelector('body')
  html2canvas(el).then((canvas) => {
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

    screenshot.value = croppedCanvas.toDataURL("image/png");
    resizing.value = false;
  });
};

const confirmSelection = () => {
    emits('addImage', screenshot.value);
    resetCapture();
}

const cancelSelection = () => {
  resetCapture();
};

const resetCapture = () => {
  isSelecting.value = false;
  isDragging.value = false;
  isUp.value = false;
  screenshot.value = '';
}

// 处理拖动手柄的鼠标按下
const onHandleMouseDown = (direction) => {
  resizeDirection.value = direction;
  resizing.value = true;
};

// 根据拖动方向更新选择区域大小
const resizeSelection = (mouseX, mouseY) => {
  switch (resizeDirection.value) {
    case 'top-left':
      startX.value = mouseX;
      startY.value = mouseY;
      break;
    case 'top-right':
      endX.value = mouseX;
      startY.value = mouseY;
      break;
    case 'bottom-left':
      startX.value = mouseX;
      endY.value = mouseY;
      break;
    case 'bottom-right':
      endX.value = mouseX;
      endY.value = mouseY;
      break;
  }
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

defineExpose({
  startSelection
})
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
  position: fixed;
  background: rgba(255, 255, 255, 0.4);
}
.confirm-btns {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

/* 拖动手柄样式 */
.resize-handle {
  width: 10px;
  height: 10px;
  background-color: #007bff;
  position: absolute;
  z-index: 10;
}

.top-left {
  top: -5px;
  left: -5px;
  cursor: nwse-resize;
}

.top-right {
  top: -5px;
  right: -5px;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: -5px;
  right: -5px;
  cursor: nwse-resize;
}
</style>
