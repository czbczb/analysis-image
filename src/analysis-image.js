import App from '../src/App.vue'
import { createPinia } from 'pinia'

import { createApp } from 'vue'

class AnalysisImageSDK {
  constructor(option) {
    if (!AnalysisImageSDK.instance) {
      AnalysisImageSDK.renderDom(option)
      AnalysisImageSDK.instance = this
    }
    return AnalysisImageSDK.instance
  }
  // 渲染vue
  static renderDom(option) {
    const { dom, ...restOpt } = option
    const app = createApp(App, restOpt)
    app.use(createPinia())

    if (dom) {
      app.mount(dom)
    } else {
      // 创建挂载节点
      const outer = document.createElement('div')
      outer.setAttribute('id', 'AnalysisImageSDK')
      document.body.appendChild(outer)
      app.mount('#AnalysisImageSDK')
    }
  }
  // 初始化
  static init(option = {}) {
    if (!this.instance) {
      this.instance = new AnalysisImageSDK(option)
    }
    return this.instance
  }
}

export default AnalysisImageSDK
