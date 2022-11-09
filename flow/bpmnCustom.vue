<template>
  <div class="bpmn-custom h100" id="bpmnModelerParent">
    <div id="bpmnModeler" class="h100"></div>
    <!--    <div class="properties-panel-parent h100" id="propertiesPanel" style="width: 370px"></div>-->
    <template v-if="isShowPanel">
      <properties-view class="h100"
                       v-if="propertiesModeler"
                       :modeler="propertiesModeler"
                       :check="check"
                       :getXmlData="getXmlData">

      </properties-view>
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, onMounted, watch, onUnmounted, reactive} from 'vue';
// import { uniqueId } from 'xe-utils';

// import BpmnModeler from 'bpmn-js/lib/Viewer';

import BpmnModeler from 'camunda-bpmn-js/lib/camunda-platform/Modeler';
import {xmlStr} from './xmlData';
import customTranslate from './customTranslate/customTranslate';
// import customPalette from './palette'
import {ElMessage} from 'element-plus';

var customTranslateModule = {
  translate: ['value', customTranslate]
};

// 进度
const PROGRESS = {
  COMPLATE: '#1879ff', //已完成
  INPROGRESS: '#67c23a', //进行中
  AUDITED: '#18b9ff' //进行中
};

import PropertiesView from './custom-properties-panel/index';

let bpmnModelerVm: any = null;
export default defineComponent({
  name: 'bpmnCustom',
  components: {
    PropertiesView
  },
  inheritAttrs: false,
  props: {
    check: {
      type: Boolean,
      default: false
    },
    isShowPanel: {
      type: Boolean,
      default: true
    },
    taskInfos: Array,
    taskEleStatus: Array,
    xmlData: String,
    otherOptions: Object
  },
  setup: (props: any, {attrs, emit}) => {
    let propertiesModeler: any = ref(null as any);
    const createNewDiagram = async () => {
      try {
        await bpmnModelerVm.importXML(props.xmlData || xmlStr);
        propertiesModeler.value = bpmnModelerVm;
        props.check && setTimeout(setColor, 300);
        // propertiesModeler.value.get('canvas').zoom('fit-viewport', 'auto')
        // console.log('==propertiesModeler.value==', propertiesModeler.value)


      } catch (err) {
        console.log('==error:', err);
      }
    };

    async function getXmlData() {
      return new Promise(async (resolve, reject) => {
        try {
          const {xml} = await bpmnModelerVm.saveXML({format: true});
          resolve(xml);
        } catch (err) {
          reject(err);
        }
      });
    }

    onMounted(() => {
      initBpmn();
      setTimeout(() => {
        propertiesModeler.value.get('canvas').zoom('fit-viewport', 'auto');
      }, 100);
    });


    const setColor = () => {
      let elementRegistry = bpmnModelerVm.get('elementRegistry');
      let modeling = bpmnModelerVm.get('modeling');
      elementRegistry.forEach((e: any) => {
        props.taskEleStatus?.forEach((t: any) => {
          if (e.id === t.eleId) {
            if (t.eleStatus === '1') {
              // modeling.setColor([e], {stroke: PROGRESS['INPROGRESS'], fill: ''});
            }
            if (t.eleStatus === '2') {
              modeling.setColor([e], {stroke: PROGRESS['AUDITED'], fill: ''});
            }
            if (t.eleStatus === '3') {
              modeling.setColor([e], {stroke: PROGRESS['COMPLATE'], fill: ''});
            }
            if (t.eleStatus === '4') {
              modeling.setColor([e], {stroke: PROGRESS['INPROGRESS'], fill: ''});
            }

          }
        });
      });
    };

    watch(() => props.xmlData, createNewDiagram);

    watch(() => props.check, () => {
      propertiesModeler.value = null;
      bpmnModelerVm.destroy();
      setTimeout(() => {
        initBpmn();
      }, 100);
    });

    const initBpmn = () => {
      bpmnModelerVm = new BpmnModeler({
        container: '#bpmnModeler',
        keyboard: props.check ? {} : {bindTo: window},
        additionalModules: props.check ?
            [
              customTranslateModule,
              {
                // 禁用左侧默认工具栏
                paletteProvider: ['value', ''],// 去不干净，还是默认生成空白 dom
                // zoomScroll: ['value', ''], // 禁用滚轮滚动
                bendpoints: ['value', ''],// 禁止拖动线
                contextPadProvider: ['value', ''],// 禁止点击节点出现contextPad
                labelEditingProvider: ['value', ''],// 禁止双击节点出现label编辑框
                move: ['value', ''],//禁用单个图形拖动,

                ...props.otherOptions
                // overlays: ['value', ''],
                // keyboardMove: ['value', ''],
                // moveCanvas: ['value', ''],
                // alignElements: ['value', ''],
                // bpmnAutoPlace: ['value', ''],
                // autoScroll: ['value', ''],
                // bpmnAutoResize: ['value', ''],
                // bpmnAutoResizeProvider: ['value', ''],
                // bendpointSnapping: ['value', ''],
                // bendpointMovePreview: ['value', '']
              }
            ]
            :
            [customTranslateModule]
      });
      createNewDiagram();
    };

    onUnmounted(() => {
      bpmnModelerVm.destroy();
      document.querySelector('#helper-svg')?.remove();
    });
    return {
      propertiesModeler,
      getXmlData
    };
  }
});
</script>


<style>
@import 'camunda-bpmn-js/dist/assets/camunda-platform-modeler.css';

.bpp-properties-panel [type=text], .bpp-properties-panel [contenteditable], .bpp-properties-panel textarea, .bpp-properties-panel select {
  box-sizing: border-box;
}

#bpmnModeler a.bjs-powered-by {
  display: none !important;
}


.bpmn-icon-intermediate-event-none,
.bpmn-icon-subprocess-expanded,
.bpmn-icon-data-store,
.bpmn-icon-participant,
.bpmn-icon-data-object,
.bpmn-icon-intermediate-event-catch-message,
.bpmn-icon-intermediate-event-throw-message,
.bpmn-icon-intermediate-event-catch-timer,
.bpmn-icon-intermediate-event-throw-escalation,
.bpmn-icon-intermediate-event-catch-condition,
.bpmn-icon-intermediate-event-catch-link,
.bpmn-icon-intermediate-event-throw-link,
.bpmn-icon-intermediate-event-throw-compensation,
.bpmn-icon-intermediate-event-catch-signal,
.bpmn-icon-intermediate-event-throw-signal,
.bpmn-icon-gateway-parallel,
.bpmn-icon-gateway-complex,
.bpmn-icon-gateway-eventbased,
.bpmn-icon-send,
.bpmn-icon-receive,
.bpmn-icon-manual,
.bpmn-icon-business-rule,
.bpmn-icon-service,
.bpmn-icon-script,
.bpmn-icon-call-activity {
  display: none !important;
}

.djs-palette.two-column.open {
  width: 46px !important;
}

.djs-popup-body :not(:nth-child(1)) {
//display: none !important;
}


</style>
<style scoped lang="scss">
.bpmn-custom {
  position: relative;
}

.h100 {
  height: 100%;
}

.properties-panel-parent {
  position: absolute;
  right: 0;
  top: 0;
}

:deep .djs-minimap {
  display: none;
}


</style>
