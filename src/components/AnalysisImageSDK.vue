<!-- analysisImageSDK.vue -->
<template>
  <div data-html2canvas-ignore="true">
    <!-- 浮动按钮 -->
    <selectCapture ref="selectCaptureRef" @addImage="addImage"></selectCapture>

    <div class="float-button">
      <NPopover trigger="hover" placement="top">
        <template #trigger>
          <n-button type="primary" @click="openModal">
            智能分析
            <NBadge :value="srcList.length"></NBadge>
          </n-button>
        </template>
        <n-space vertical>
          <n-button @click="startSelection">选择截图</n-button>
          <n-button @click="scrollSeceenshot">滚动截图</n-button>
          <n-button @click="openModal">分析预览</n-button>
        </n-space>
      </NPopover>
    </div>


    <!-- 模态框 -->
    <n-modal v-model:show="isModalVisible" preset="card" title="智能分析" :footer="null" class="analysis-modal">
      <n-scrollbar class="screenshot-scroll" trigger="none">
        <div class="screenshot-container">

          <n-card class="screenshot-item" closable @close="handleDelete(index)" v-for="(src, index) in srcList"
            :key="index" :title="`图${index + 1}`">
            <n-image height="200" width="100%" ref="imageRef" :render-toolbar="renderToolbar" :src="src"
              @click="setCurrentImage(src)" alt="screenshot">
            </n-image>
          </n-card>
        </div>
      </n-scrollbar>
      <n-space justify="center">
        <n-button type="primary" @click="saveScreenshot" :loading="saveLoading">立即分析</n-button>
      </n-space>
    </n-modal>
  </div>
</template>
<script setup>
import { ref, h, watch, computed } from 'vue';
import { NButton, NModal, NSpace, NScrollbar, NCard, NImage, useMessage, NBadge, NPopover } from 'naive-ui';
import html2canvas from 'html2canvas';
import { ClipboardOutline } from "@vicons/ionicons5";
import axios from 'axios';
import selectCapture from './selectCapture.vue'

const message = useMessage()

const imageRef = ref(null);
const isModalVisible = ref(false);
const saveLoading = ref(false);
const srcList = ref([]);
const currentSrc = ref(null);
const croper = ref(null);
const analysisResult = ref(null);
const selectCaptureRef = ref(null);

const badgeValue = computed(() => {
  return srcList.value.length
})

const renderToolbar = ({ nodes }) => {
  return [
    nodes.rotateCounterclockwise,
    nodes.rotateClockwise,
    nodes.resizeToOriginalSize,
    nodes.zoomOut,
    nodes.zoomIn,
    nodes.download,
    h(
      NButton,
      {
        circle: true,
        type: "primary",
        style: { marginLeft: "12px" },
        onClick: async () => {
          await navigator.clipboard.writeText(currentSrc.value);
          message.success("已复制到剪贴板");
        }
      },
      {
        icon: () => h(ClipboardOutline)
      }
    ),
    nodes.close
  ];
};

watch(isModalVisible, () => {
  saveLoading.value = false;
})

const startSelection = () => {
  selectCaptureRef.value.startSelection();
}

const addImage = (src) => {
  srcList.value.push(src);
}

const scrollSeceenshot = async () => {
  const divElement = document.querySelector('body')
  try {
    const canvasEl = await html2canvas(divElement, {
      ignoreElements: (element) => {
        return element.dataset.html2canvasIgnore === 'true';
      },
      useCORS: true,
      allowTaint: true,
    })
    const url = canvasEl.toDataURL('image/png');
    srcList.value.push(url);
    message.success('截图成功');
  } catch (error) {
    console.log(error)
  }
}

const openModal = async () => {
  isModalVisible.value = true;
};

const setCurrentImage = (src) => {
  currentSrc.value = src;
}


const saveScreenshot = () => {
  analysisResult.value = '对对对';
  window.open(`https://galaxy.mobvista.com/#/galaxy/analysisCreate?image=2`)

  // saveLoading.value = true;
  // const formData = new FormData();
  // srcList.value.map(item=> {
  //   const imageBlob = dataURLToBlob(item);
  //   formData.append('file', imageBlob, 'image.png');
  // })
  // axios.post('/uploadImage', formData).then(() =>{
  //   isModalVisible.value = false;
  //   saveLoading.value = false;
  // });
};

function dataURLToBlob(dataurl) {
  const parts = dataurl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

function handleDelete(index) {
  srcList.value.splice(index, 1);
}
</script>

<style>
.float-button {
  position: fixed;
  bottom: 30px;
  right: 10px;
  display: flex;
  flex-direction: column;
}

.analysis-modal {
  width: 800px;
}

.screenshot-scroll {
  height: 600px;

  .screenshot-container {
    max-height: 600px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    padding: 8px;
    gap: 8px;

    .screenshot-item {
      text-align: center;
      width: 360px;

      &:hover {
        box-shadow: 0 0 5px 5px #eee;
      }
    }
  }
}

.screenshot-canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>