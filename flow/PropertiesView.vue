<template>
  <div class="custom-properties-panel" style="box-shadow: 0 0 10px 5px #f0f0f0">
    <div
        style="height: 32px;border-top: 1px solid #dce3e8;border-bottom: 1px solid #dce3e8;background: #f1f3f4;color: #000;line-height: 32px;font-size: 14px;width: 100%;padding-left: 10px;box-sizing: border-box;border-radius: 4px;">
      属性
    </div>


    <div style="height: calc(100% - 28px); overflow-y: auto;">
      <div class="empty" v-if="reactData.selectedElements.length <= 0">
        <div style="flex: 1; display: flex; align-items: center">请选择一个元素</div>
        <div style="margin: 10px">

          <el-button type="primary" size="mini" @click="checkXML">查看XML</el-button>
        </div>
      </div>
      <div class="empty" v-else-if="reactData.selectedElements.length > 1">只能选择一个元素</div>

      <el-form class="form" :model="formData" ref="formRef" :rules="formRules" size="small" style="height: 100%"
               :disabled="check" v-else>
        <el-collapse v-model="activeNames" style="width: 100%">
          <el-collapse-item title="基础属性" name="first">
            <el-form-item label="ID" label-width="80px">
              <el-tooltip
                  placement="top"
                  :content="reactData.element.id"
              >
                <el-input v-model="reactData.element.id" size="small" disabled></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="编码" label-width="80px">
              <el-input size="small" v-model.trim="formData.taskCode" @input="setTaskCode"></el-input>
            </el-form-item>
            <el-form-item label="名称" label-width="80px">
              <el-input v-model.trim="reactData.element.name" @input="changeField($event,'name')" size="small"/>
            </el-form-item>

            <template v-if="isTask || isFlow">
              <template v-if="!isFlow">
                <el-form-item label="待审核菜单" label-width="80px">
                  <el-select
                      v-model="formData.menuId"
                      size="small"
                      popper-class="properties_select"
                      clearable
                      filterable
                      @change="handleSelectChange_Menu($event,'menu')"
                  >
                    <el-option
                        v-for="item in byBillTypeNoList"
                        :key="item.id"
                        :label="`${item.id} - ${item.fname}`"
                        :value="item.id"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="已审核菜单" label-width="80px">
                  <el-select
                      v-model="formData.auditedMenuId"
                      size="small"
                      filterable
                      clearable
                      @change="handleSelectChange_Menu($event,'auditedMenu')"
                      popper-class="properties_select"
                  >
                    <el-option
                        v-for="item in byBillTypeNoList"
                        :key="item.id"
                        :label="`${item.id} - ${item.fname}`"
                        :value="item.id"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="允许取消审核" label-width="80px" class="nowrap">
                  <el-switch v-model="formData.allowCancel" :active-value="'1'" :inactive-value="'2'"
                             @change="changeExtCommonProp($event,'allowCancel')"></el-switch>
                </el-form-item>
                <el-form-item label="允许回退" label-width="80px">
                  <el-switch v-model="formData.allowReject" :active-value="'1'" :inactive-value="'2'"
                             @change="changeExtCommonProp($event,'allowReject')"></el-switch>
                </el-form-item>


              </template>

              <template v-if="isFlow">
                <el-form-item label="条件类型" label-width="80px">
                  <el-select v-model="formData.conditionType" @change="changeConditionType" clearable size="small">
                    <el-option :value="1" label="Experssion">Experssion</el-option>
                    <el-option :value="2" label="Script">Script</el-option>
                  </el-select>
                </el-form-item>
                <el-form-item v-if="formData.conditionType === 1" label="表达式" label-width="80px">
                  <el-input v-model.trim="formData.experssion" type="textarea"
                            @input="event => changeField(event, 'experssion')"/>
                </el-form-item>
                <template v-if="formData.conditionType === 2">
                  <el-form-item label="脚本格式" label-width="80px">
                    <el-input v-model.trim="formData.scriptFormat"
                              @input="event => changeField(event, 'scriptFormat')"/>
                  </el-form-item>
                  <el-form-item label="脚本类型" label-width="80px">
                    <el-select v-model="formData.scriptType" @change="changScriptType">
                      <el-option :value="1" label="内联脚本">内联脚本</el-option>
                      <el-option :value="2" label="外部脚本">外部脚本</el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item v-if="formData.scriptType === 1" label="脚本" label-width="80px">
                    <el-input v-model.trim="formData.inlineScript"
                              @input="event => changeField(event, 'inlineScript')"/>
                  </el-form-item>
                  <el-form-item v-if="formData.scriptType === 2" label="资源" label-width="80px">
                    <el-input v-model.trim="formData.resource" @input="event => changeField(event, 'resource')"/>
                  </el-form-item>
                </template>
                <el-form-item label="是否回环" label-width="80px">
                  <el-checkbox v-model="formData.isCycle" @change="handleChangeIsCycle"></el-checkbox>
                </el-form-item>
              </template>
              <template v-else>
                <el-form-item label="回退节点" label-width="80px">
                  <el-select
                      v-model="formData.rollBackTask"
                      placeholder=""
                      value-key="rollBackTaskId"
                      size="small"
                      popper-class="properties_select"
                      @change="handleSelectChange_RollbackTask($event,'rollBackTask')"
                      clearable
                      multiple
                  >
                    <el-option
                        v-for="item in taskList"
                        :key="item.id"
                        :label="item.name"
                        :value="item"
                    >

                    </el-option>


                  </el-select>
                </el-form-item>
                <el-form-item label="角色" label-width="80px">
                  <el-input v-model="role" @click="showRoleDialog('roleData')">
                    <template #suffix>
                      <el-icon><More @click.stop="showRoleDialog('roleData')"/></el-icon>
                    </template>
                  </el-input>
                  <el-icon class="bottomIcon" @click="handleTextAreaVisible('showTextAreaRole')">
                    <component :is="formData.showTextAreaRole?CaretTop : CaretBottom "></component>
                  </el-icon>
                </el-form-item>
                <el-form-item label-width="80px" v-show="formData.showTextAreaRole">
                  <el-input v-model.trim="formData.candidateGroups"
                            clearable
                            type="textarea"
                            @input="inputChange($event,'candidateGroups')"
                            @clear="clearField('ext-role')">
                  </el-input>
                </el-form-item>

                <el-form-item label="用户" label-width="80px">
                  <el-input v-model="user" @click="showUserDialog('userData')">
                    <template #suffix>
                      <el-icon><More @click.stop="showUserDialog('userData')"/></el-icon>
                    </template>
                  </el-input>
                  <el-icon class="bottomIcon" @click="handleTextAreaVisible('showTextAreaUser')">
                    <component :is="formData.showTextAreaUser?CaretTop : CaretBottom "></component>
                  </el-icon>
                </el-form-item>
                <el-form-item label-width="80px" v-show="formData.showTextAreaUser">
                  <el-input v-model.trim="formData.candidateUsers" clearable
                            type="textarea"
                            @input="inputChange($event,'candidateUsers')"
                            @clear="clearField('ext-user')">
                  </el-input>
                </el-form-item>


                <el-form-item label="备注" label-width="80px">
                  <el-input v-model.trim="reactData.ccc" size="small"/>
                </el-form-item>
                <el-form-item label="附加属性" label-width="80px">
                  <el-input ref="extPropRef" v-model.trim="formData.extProp" @click="showExtPropDialog" size="small"/>
                </el-form-item>
              </template>
            </template>
          </el-collapse-item>
          <el-collapse-item v-if="isTask" title="会签" name="third">
            <el-form-item label="允许会签" label-width="80px">
              <el-switch v-model="formData.allowJq" :active-value="'1'" :inactive-value="'2'"
                         @change="changeExtCommonProp($event,'allowJq')"></el-switch>
            </el-form-item>
            <el-form-item label="类型" label-width="80px">
              <el-select v-model="formData.jqType" @change="changejqType">
                <el-option :value="1" label="普通"></el-option>
                <el-option :value="2" label="仅意见"></el-option>
              </el-select>
            </el-form-item>


            <el-form-item label="用户范围" label-width="80px">
              <el-select v-model="formData.jqUserRange" @change="changejqUserRange">
                <el-option :value="1" label="本单位"></el-option>
                <el-option :value="2" label="本部门"></el-option>
              </el-select>
            </el-form-item>


            <el-form-item label="高级" label-width="80px">
              <el-switch v-model="state.showGaoJi" :active-value="'1'" :inactive-value="'2'"
                         @change="changeShowGaoji"
              ></el-switch>
            </el-form-item>

            <template v-if="state.showGaoJi === '1'">
              <el-form-item label="用户" label-width="80px">
                <el-input v-model="jqUser" @click="showUserDialog('userJqData')">
                  <template #suffix>
                    <el-icon><More @click.stop="showUserDialog('userJqData')"/></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="角色" label-width="80px">
                <el-input v-model="jqRole" @click="showRoleDialog('roleJqData')">
                  <template #suffix>
                    <el-icon><More @click.stop="showRoleDialog('roleJqData')"/></el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="通过率" label-width="80px"
                            prop="jqPercent"
              >
                <el-input ref="JqPercentRef" v-model.number="formData.jqPercent" @input="setJqPercent">
                  <template #suffix>%</template>
                </el-input>
              </el-form-item>
            </template>

          </el-collapse-item>
          <el-collapse-item title="监听器" name="fourth">
            <div style="display: flex; justify-content: space-between; padding-left: 20px">
              <div>执行监听</div>
              <i class="el-icon-plus" style="font-size: 16px; cursor: pointer" @click="addExecutionListener"></i>
            </div>
            <div class="executionListener_wrapper">
              <template v-for="(item,index) in executionListenerList">
                <div
                    class="executionListener_item"
                    @click="clickExecutionListenerItem(item,index)"
                    :class="activeExecutionListenerIndex === index? 'active' : ''"
                >

                  {{ item }}
                  <i class="el-icon-close" style="font-size: 16px; cursor: pointer"
                     @click.stop="removeExecutionListener(index)"></i></div>
              </template>
            </div>
            <template v-if="typeof activeExecutionListenerIndex === 'number'">
              <el-form-item label="监听器类型" label-width="80px">
                <el-select
                    v-model="formData.listenerType"
                    size="small"
                    popper-class="properties_select"
                    @change="handleSelectChange_listenerType"
                >
                  <el-option
                      v-for="item in ListenerTypeArr"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item :label="state.listenerTypeLabel" label-width="80px">
                <el-input v-model="formData.listenerInput" @input="changeField($event,'listenerInput')">
                </el-input>
              </el-form-item>


              <template v-if="formData.listenerType === 'script'">
                <el-form-item label="脚本类型" label-width="80px">
                  <el-select v-model="formData.listenerScriptType" @change="changListenerScriptType">
                    <el-option :value="1" label="内联脚本">内联脚本</el-option>
                    <el-option :value="2" label="外部脚本">外部脚本</el-option>
                  </el-select>
                </el-form-item>

                <el-form-item v-if="formData.listenerScriptType === 1" label="脚本" label-width="80px">
                  <el-input v-model.trim="formData.listenerScript"
                            @input="event => changeField(event, 'listenerScript')"/>
                </el-form-item>
                <el-form-item v-if="formData.listenerScriptType === 2" label="资源" label-width="80px">
                  <el-input v-model.trim="formData.listenerResource"
                            @input="event => changeField(event, 'listenerResource')"/>
                </el-form-item>
              </template>


            </template>

            <el-divider/>

            <template v-if="isTask">
              <div style="display: flex; justify-content: space-between; padding-left: 20px">
                <div>任务监听器</div>
                <i class="el-icon-plus" style="font-size: 16px; cursor: pointer" @click="addTaskListener"></i>
              </div>
              <div class="executionListener_wrapper">
                <template v-for="(item,index) in taskListenerList">
                  <div
                      class="executionListener_item"
                      @click="clickTaskListenerItem(item,index)"
                      :class="activeTaskListenerIndex === index? 'active' : ''"
                  >

                    {{ item.event }} : {{ item.value }}
                    <i class="el-icon-close" style="font-size: 16px; cursor: pointer"
                       @click.stop="removeTaskListener(index)"></i></div>
                </template>
              </div>
              <template v-if="typeof activeTaskListenerIndex === 'number'">
                <el-form-item label="事件类型" label-width="80px">
                  <el-select
                      v-model="formData.taskEventListenerType"
                      size="small"
                      popper-class="properties_select"
                      @change="handleSelectChange_taskEventListenerType"
                  >
                    <el-option
                        v-for="item in taskEventTypeListenerArr"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>


                <el-form-item label="监听器类型" label-width="80px">
                  <el-select
                      v-model="formData.taskListenerType"
                      size="small"
                      popper-class="properties_select"
                      @change="handleSelectChange_taskListenerType"
                  >
                    <el-option
                        v-for="item in ListenerTypeArr"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item :label="state.taskListenerTypeLabel" label-width="80px">
                  <el-input v-model="formData.taskListenerInput" @input="changeField($event,'taskListenerInput')">
                  </el-input>
                </el-form-item>


                <template v-if="formData.taskListenerType === 'script'">
                  <el-form-item label="脚本类型" label-width="80px">
                    <el-select v-model="formData.taskListenerScriptType" @change="changTaskListenerScriptType">
                      <el-option :value="1" label="内联脚本">内联脚本</el-option>
                      <el-option :value="2" label="外部脚本">外部脚本</el-option>
                    </el-select>
                  </el-form-item>

                  <el-form-item v-if="formData.taskListenerScriptType === 1" label="脚本" label-width="80px">
                    <el-input v-model.trim="formData.taskListenerScript"
                              @input="event => changeField(event, 'taskListenerScript')"/>
                  </el-form-item>
                  <el-form-item v-if="formData.taskListenerScriptType === 2" label="资源" label-width="80px">
                    <el-input v-model.trim="formData.taskListenerResource"
                              @input="event => changeField(event, 'taskListenerResource')"/>
                  </el-form-item>
                </template>


              </template>
            </template>


          </el-collapse-item>
          <el-collapse-item v-if="isTask" title="多实例" name="second">
            <el-form-item label="类型" label-width="80px">
              <el-radio-group v-model="formData.multiInstanceType" @change="changeMultiInstanceType">
                <el-radio :label="2">并行</el-radio>
                <el-radio :label="1">串行</el-radio>
                <el-radio :label="3">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
            <!--            <el-form-item label="实例数量" label-width="80px">-->
            <!--              <el-input v-model.trim="formData.loopCardinality" size="small"-->
            <!--                        @input="changeField($event,'loopCardinality')"-->
            <!--                        :disabled="formData.isInstanceDisabled"></el-input>-->
            <!--            </el-form-item>-->
            <el-form-item label="集合变量" label-width="80px">
              <el-input v-model.trim="formData.collection" size="small"
                        @input="changeField($event,'collection')" :disabled="formData.isInstanceDisabled"></el-input>
            </el-form-item>
            <el-form-item label="元素变量" label-width="80px">
              <el-input v-model.trim="formData.elementVariable" size="small"
                        @input="changeField($event,'elementVariable')"
                        :disabled="formData.isInstanceDisabled"></el-input>
            </el-form-item>
            <el-form-item label="完成条件" label-width="80px">
              <el-input v-model.trim="formData.completionCondition" size="small"
                        @input="changeField($event,'completionCondition')"
                        :disabled="formData.isInstanceDisabled"></el-input>
            </el-form-item>
          </el-collapse-item>

        </el-collapse>
        <el-form>
          <div style="margin: 10px">
            <el-button type="primary" size="mini" @click="checkXML">查看XML</el-button>
          </div>
        </el-form>

      </el-form>
    </div>


    <role-dialog
        v-if="roleDialogState.showDialog"
        v-model:dialog-state="roleDialogState"
        @confirm="confirm"
        @close="roleDialogState.showDialog = false"
    ></role-dialog>


    <user-dialog
        v-if="userDialogState.showDialog"
        v-model:dialog-state="userDialogState"
        @confirm="confirm"
        @close="userDialogState.showDialog = false"
    ></user-dialog>

    <xml-dialog v-if="xmlDialogState.showDialog"
                :dialog-state="xmlDialogState"
                @close="xmlDialogState.showDialog = false"
                @clearElement="clearElement"
    >

    </xml-dialog>

    <ext-prop-dialog
        v-if="extPropDialogState.showDialog"
        v-model:dialog-state="extPropDialogState"
        @close="extPropDialogState.showDialog = false"
        @confirm="setExtProp"
    >

    </ext-prop-dialog>

  </div>
</template>

<script lang="ts" setup>
import {v4 as uuidv4} from 'uuid';

import {computed, inject, onMounted, reactive, ref, toRefs, watch} from 'vue';
import {toRaw} from '@vue/reactivity';
import {useRouter} from 'vue-router';
import {useStore} from 'vuex';
import utils from '@/utils/utils';
import {CONDITION_EXPRESSION_MAP_NAME, CONDITION_SCRIPT_MAP_NAME, EXT_NAME} from './utils/config';
import RoleDialog from '@/components/global/bpmnCustom/custom-properties-panel/components/roleDialog.vue';
import UserDialog from '@/components/global/bpmnCustom/custom-properties-panel/components/userDialog.vue';
import XmlDialog from '@/components/global/bpmnCustom/custom-properties-panel/components/xmlDialog.vue';
import ExtPropDialog from '@/components/global/bpmnCustom/custom-properties-panel/components/extPropDialog.vue';
import {ElMessage} from 'element-plus';
import { More,CaretTop,CaretBottom } from '@element-plus/icons-vue';


const formRef: any = ref(null);
const extPropRef:any = ref(null)

const byBillTypeNoList: any = inject('byBillTypeNoList');
const currentRow: any = inject('currentRow');
const addFlowStatus: any = inject('addFlowStatus');


const props: any = defineProps({
  modeler: {
    type: Object,
    default: () => ({})
  },
  getXmlData: {
    type: Function
  },
  check: {
    type: Boolean,
    default: false
  }
});

const {modeler} = props;
const moddle = modeler.get('moddle');
const modeling = modeler.get('modeling');


const router = useRouter();
const route = router.currentRoute.value;
const store = useStore();
const currentYear = utils.getYear({$route: route, $store: store});
const reactData = reactive({
  selectedElements: [],
  element: {},
  eventType: '',
  taskType: ''
} as any);
const menuTreeColumn = reactive({
  dataUrl: '/api/uaa/menu/tree',
  method: 'GET',
  fselect: 1,
  treeParams: {
    fbilltypeno: 9911,
    year: currentYear
  }
} as any);
const formData: any = reactive({
  menuId: null,
  menuCode: null,
  menuName: null,
  auditedMenuId: null,
  allowCancel: '',
  allowReject: '',
  allowJq: '',
  experssion: '',
  conditionType: '',
  scriptType: 1,
  scriptFormat: '',
  inlineScript: '',
  resource: '',
  roleData: [],
  userData: [],
  userJqData: [],

  loopCardinality: '',
  collection: '',
  elementVariable: '',
  completionCondition: '',

  userCode: '',
  roleCode: '',
  taskCode: '',

  rollBackTask: null,
  rollBackTaskCode: null,
  rollBackTaskName: null,
  rollBackTaskId: null,

  extProp: '',
  multiInstanceType: '',

  isInstanceDisabled: true,

  candidateGroups: '',
  candidateUsers: '',

  showTextAreaUser: false,
  showTextAreaRole: false,

  listenerType: '',
  listenerInput: '',
  listenerScriptType: '',
  listenerScript: '',
  listenerResource: '',

  taskListenerType: '',
  taskListenerInput: '',
  taskListenerScriptType: '',
  taskListenerScript: '',
  taskListenerResource: '',

  taskEventListenerType: '',

  jqType: '',
  jqPercent: '',

  jqUserRange: '',

  isCycle: false

});

const formRules: any = reactive({
  'jqPercent': [
    {type: 'number', message: '', trigger: 'change',},
    {pattern: /([1-9]?\d|100)$/}
  ]
});

const state: any = reactive({
  preveSelection: {},
  roleDialogState: {
    showDialog: false
  },
  userDialogState: {
    showDialog: false
  },
  xmlDialogState: {
    showDialog: false
  },
  extPropDialogState: {
    showDialog: false
  },
  taskList: [],
  activeNames: 'first',

  executionListenerList: [],

  ListenerTypeArr: [
    {value: 'class', label: 'Java 类'},
    {value: 'expression', label: '表达式'},
    {value: 'delegateExpression', label: '代理表达式'},
    {value: 'script', label: '脚本'}
  ],

  taskEventTypeListenerArr: [
    {value: 'create', label: '创建'},
    {value: 'assignment', label: '赋值'},
    {value: 'complete', label: '完成'},
    {value: 'delete', label: '删除'},
    {value: 'update', label: '修改'},
    {value: 'timeout', label: '超时'}
  ],

  activeExecutionListenerIndex: '',
  listenerTypeLabel: '',

  activeTaskListenerIndex: '',
  taskListenerTypeLabel: '',
  taskListenerList: [],


  showGaoJi: '2'

});

let {
  preveSelection,
  roleDialogState,
  userDialogState,
  xmlDialogState,
  extPropDialogState,
  taskList,
  activeNames,
  executionListenerList,
  ListenerTypeArr,
  activeExecutionListenerIndex,
  activeTaskListenerIndex,
  taskListenerList,
  taskEventTypeListenerArr
} = toRefs(state);


const init = () => {
  const modeler = props.modeler;
  // setEvent()
  modeler.on('element.click', (e?: any) => {
    elementClick(e);
  });
  modeler.on('selection.changed', (e?: any) => {
    selectionChanged(e);
  });
  modeler.on('element.changed', (e?: any) => {
    elementChanged(e);
  });
  modeler.on('element.marker.update', (e?: any) => {
    // elementMarkerUpdate(e);
  });
  modeler.on('directEditing.cancel', (e?: any) => {
    directEditingCancel(e);
  });
  modeler.on('shape.added', (e?: any) => {
    shapeAdded(e);
  });
  modeler.on('connection.added', (e?: any) => {
    connectionAdded(e);
  });
  modeler.on('import.parse.start', (e?: any) => {
  });
  modeler.on('import.parse.complete', (e?: any) => {
    importParseComplete(e);

  });
  modeler.on('shape.removed', (e?: any) => {
    clearElement();

  });
  // modeler.on('element.dblclick', (e?: any) => {
  //   console.log('element.dblclick',e);
  // });
};

watch(() => reactData.element.name, (n) => {
  if (!n) return;
  changeField(n, 'name');
}, {deep: true});

/***
 * eventBus
 */

const elementClick = (e: any) => {
  let mapObj: any = {
    'script': 'script',
    'expression': 'expression',
    'delegateExpression': 'delegateExpression',
    'class': 'Java Class'
  };
  let extensionElements = [...getBusinessObject().extensionElements?.values || []];
  let executionListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:ExecutionListener') || [];
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];


  state.executionListenerList = executionListenerArr?.map((v: any) => Object.keys(v).map(y => mapObj[y]).filter(Boolean)).flat() || [];

  state.taskListenerList = taskListenerArr?.map(v => {
    return {
      'event': v.event,
      value: Object.keys(v).map(y => mapObj[y]).filter(Boolean).pop()
    };
  }) || [];

};

const selectionChanged = (e: any) => {
  let {newSelection: {[0]: newSelection}} = e;
  // console.log(newSelection);
  if (e.newSelection.length === 0) {
    reactData.element = state.preveSelection || {};
    return;
  }
  reactData.selectedElements = e.newSelection;
  reactData.element = state.preveSelection = newSelection;
  index = (modeler.get('elementRegistry').filter((v: any) => v.type.includes('Task')).filter((v: any) => v.businessObject?.name?.includes('新任务'))?.map((v: any) => Number(getBusinessObject(v).name.slice(3)))?.sort((a: any, b: any) => a - b)?.pop() || 0) + 1;
  state.taskList = modeler.get('elementRegistry').filter((v: any) => v.type.includes('Task')).filter((v: any) => v.id !== reactData.element.id).map((v: any) => {
    let businessObject = getBusinessObject(v);
    let values = businessObject?.extensionElements?.values[0]?.values || [];
    let cur = values?.find((v: any) => v.name === 'ext-commonProp');
    if (!cur) return;
    let extCommonProp = JSON.parse(cur.value);
    return {
      ...v,
      rollBackTaskId: v.id,
      rollBackTaskCode: extCommonProp.taskCode || '',
      rollBackTaskName: v.name || businessObject.name,
      name: businessObject.name
    };
  });
  let {type} = newSelection;
  state.activeExecutionListenerIndex = '';
  state.activeTaskListenerIndex = '';
  setDefaultProperties();
};
const elementChanged = (e: any) => {
  let {type} = e.element;
  if (type.includes('Task')) {
    let {loopCharacteristics = undefined} = getBusinessObject();
    if (!loopCharacteristics) {
      formData.multiInstanceType = 3;
      return;
    }
    formData.isInstanceDisabled = false;
    formData.multiInstanceType = loopCharacteristics.isSequential ? 1 : 2;
  }

};

const elementMarkerUpdate = (e: any) => {
  if (!e.element) return;
  let businessObject = e.element.businessObject;
  if (businessObject) return reactData.element = businessObject;
  // updateForm(e)
};

const directEditingCancel = (e: any) => {
  let {active: {element}} = e;
  let {name} = element.businessObject;
  reactData.element.name = name;
  // updateForm(e);
};
let index = 1;
const shapeAdded = (e: any) => {
  let {type} = e.element;
  setTimeout(() => {
    if (e.element.id.length < 30) {
      props.modeler.get('modeling').updateProperties(e.element, {
        id: generateUuidv4(e.element.id)
      });
    }
  });
  if (type === 'bpmn:Task') {
    const bpmnReplace = props.modeler.get('bpmnReplace');
    setTimeout(() => {
      props.modeler.get('modeling').updateProperties(e.element, {
        name: '新任务' + index++
      });
      bpmnReplace.replaceElement(e.element, {
        type: 'bpmn:UserTask'
      });
      formData.allowCancel = '1';
      formData.allowReject = '1';
      formData.jqType = 1;
      // formData.jqPercent = 100;
      changeExtCommonProp('1', 'allowCancel');
      changeExtCommonProp('1', 'allowReject');
      changeExtCommonProp(1, 'jqType');
      // changeExtCommonProp(100, 'jqPercent');
    });
  }
  if (type === 'bpmn:EndEvent') {
    setTimeout(() => {
      props.modeler.get('modeling').updateProperties(e.element, {
        name: '结束'
      });
    });
  }
};

const connectionAdded = (e: any) => {
  setTimeout(() => {
    modeling.updateProperties(e.element, {
      id: generateUuidv4(e.element.id)
    });
  });
};

const importParseComplete = (e: any) => {
  for (const k in e.elementsById) {
    let {id = '', $type = ''} = e.elementsById[k] || {};
    if ($type === 'bpmn:Process') {
      e.elementsById[k].id = generateUuidv4(id);
      e.elementsById[k].isExecutable = true;
      setTimeout(() => {
        let process = modeler.get('elementRegistry').getAll().filter((v: any) => v.type === 'bpmn:Process').pop();
        let value: any = {
          'ext-workflow': JSON.stringify(currentRow.value)
        };
        setProperties({
          element: process,
          isSetExtensionElements: true,
          value
        });
      });

    }
  }
};


/***
 * 回显数据
 */
function setDefaultProperties() {
  try {
    const element = reactData.element;
    if (!element) return;
    const {type, businessObject} = element;
    let values = businessObject?.extensionElements?.values?.[0]?.values || [];
    let condition = businessObject.conditionExpression;
    let loopCharacteristics = businessObject.loopCharacteristics;
    for (let key in formData) {
      if (key) {
        formData[key] = null;
      }
    }
    for (let item of values) {
      if (item.name) {
        // formData[item.name] = item.value;
      }
      if (EXT_NAME[item.name]) {
        if (item.value) {
          let data: any;
          try {
            data = JSON.parse(JSON.parse(JSON.stringify(item.value)));

          } catch (e) {
            data = JSON.parse(JSON.stringify(item.value));
          }
          if (Array.isArray(data)) {
            formData[EXT_NAME[item.name]] = data;
            // formData[EXT_USER_ROLE_NAME[item.name]] = data?.map((v: any) => v[`${item.name.split('-')[1]}Id`]).toString();
          }

        }


      }
      if (item.name === 'ext-commonProp') {
        let value = JSON.parse(item.value);
        for (const key in value) {
          formData[key] = value[key];
        }
      }
      if (item.name === 'ext-rollback-task') {
        formData.rollBackTask = JSON.parse(item.value);
      }
      if (item.name === 'isCycle') {
        formData[item.name] = item.value == 1;
      }

    }
    if (condition) {
      let mapName = 'language' in condition ? CONDITION_SCRIPT_MAP_NAME : CONDITION_EXPRESSION_MAP_NAME;
      for (const key in condition) {
        formData[mapName[key]] = condition[key];
      }
      formData.conditionType = 'language' in condition ? 2 : 1;
      formData.scriptType = 'resource' in condition ? 2 : 1;
    }
    if (loopCharacteristics) {
      // formData.multiInstanceType = 'isSequential' in loopCharacteristics ? 2 : 1;
      formData.multiInstanceType = loopCharacteristics.isSequential ? 1 : 2;
      let {elementVariable, collection, completionCondition, loopCardinality} = loopCharacteristics;
      formData.elementVariable = elementVariable;
      formData.collection = collection;
      formData.completionCondition = completionCondition?.body;
      formData.loopCardinality = loopCardinality?.body;
    } else {
      formData.multiInstanceType = 3;
      formData.isInstanceDisabled = true;
    }


    // if (!businessObject.extensionElements) {
    //   const moddle = props.modeler.get('moddle')
    //   businessObject.extensionElements = moddle.create('bpmn:ExtensionElements',{ values: [] })
    // }
    const {name} = businessObject;
    if (verifyIsEvent(type)) {
      if (businessObject?.eventDefinitions) {
        let {length = 0} = businessObject?.eventDefinitions;
        reactData.eventType = length !== 0 ? businessObject.eventDefinitions[0]['$type'] : '';
      }

    } else if (verifyIsTask(type)) {
      reactData.taskType = type;
    }
    element['name'] = name;

  } catch (e) {
    console.log(e);
  }
}

const verifyIsEvent = (type?: any) => {
  return type?.includes('Event');
};

const verifyIsTask = (type?: any) => {
  return type?.includes('Task');
};
const verifyIsFlow = (type?: any) => {
  return type?.includes('Flow');
};

/**
 * 改变控件触发的事件
 * @param { Object } input的Event
 * @param { String } 要修改的属性的名称
 */

const changeField = (event?: any, type?: any) => {
  let value: any;
  if (typeof event === 'object') {
    value = event.value;
  }
  if (typeof event === 'string') {
    value = event;
  }
  formData[type] = value;
  let properties = {} as any;
  properties[type] = value;

  updateProperties(properties, type);
};

const inputChange = (event: any, type: any) => {
  let map: any = {
    'candidateGroups': 'roleData',
    'candidateUsers': 'userData'
  };
  let extType = 'ext-' + map[type].replace('Data', '');
  changeField(event, type);
  formData[map[type]] = [];
  getExtensionElementsList(reactData.element, [extType]);
};

const clearField = (type: string) => {
  // changeField('', type);
  formData[EXT_NAME[type]] = [];
  getExtensionElementsList(reactData.element, [type]);
};


const changeEventType = (event?: any) => {
  const value = event.target.value;
  const bpmnReplace = props.modeler.get('bpmnReplace');
  reactData.eventType = value;
  bpmnReplace.replaceElement(reactData.element, {
    type: reactData.element.businessObject.$type,
    eventDefinitionType: value
  });
};

const changeTaskType = (event?: any) => {
  console.log(event);
  const value = event.target.value;
  const bpmnReplace = props.modeler.get('bpmnReplace');
  bpmnReplace.replaceElement(reactData.element, {
    type: value
  });
};

/***
 * 更新 bpmn
 *
 */
const setName = ({value}: any, type: any) => {
  setProperties({
    isSetExtensionElements: false,
    value: {
      'name': value[type]
    }
  });
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      taskName: value[type]
    }
  });
};
const setTaskCode = (value: any) => {
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      taskCode: value
    }
  });
};

const JqPercentRef: any = ref(null);

const setJqPercent = (value: any) => {
  let bol = /^\d+$/.test(value) && value <= 100;
  if (!bol) {
    ElMessage.warning('请输入[0-100]的数字');
  }
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      jqPercent: bol ? value : ''
    }
  });
};


const setExperssion = ({value}: any, type: any) => {
  let conditionExpression = getExpression(moddle, 'bpmn:FormalExpression', {
    body: value[type]
  });
  conditionExpression.body = value[type];
  setUpdateProperties(modeling, 'conditionExpression', conditionExpression);
};
const setScriptFormat = ({value}: any, type: any) => {
  let conditionExpression = getExpression(moddle, 'bpmn:FormalExpression', {
    language: value[type]
  });

  conditionExpression.language = value[type];
  setUpdateProperties(modeling, 'conditionExpression', conditionExpression);
};

const setInlineScript = ({value}: any, type: any) => {
  let conditionExpression = getExpression(moddle, 'bpmn:FormalExpression', {
    language: '',
    body: value[type]
  });
  conditionExpression.body = value[type];
  setUpdateProperties(modeling, 'conditionExpression', conditionExpression);


};
const setResource = ({value}: any, type: any) => {
  let conditionExpression = getExpression(moddle, 'bpmn:FormalExpression', {
    language: '',
    resource: value[type]
  });
  conditionExpression.resource = value[type];
  setUpdateProperties(modeling, 'conditionExpression', conditionExpression);
};


const setLoopCardinality = ({value}: any, type: any) => {
  setProperties({
    name: 'loopCharacteristics',
    key: 'loopCardinality',
    createBpmnType: 2,
    isExtensionElements: false,
    value: {
      body: value[type]
    }
  });
};

const setCollection = ({value}: any, type: any) => {

  setProperties({
    name: 'loopCharacteristics',
    key: 'collection',
    isCreate: false,
    isExtensionElements: false,
    value: value[type]
  });
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      multiCollection: value[type]
    }
  });
};
const setElementVariable = ({value}: any, type: any) => {
  setProperties({
    name: 'loopCharacteristics',
    key: 'elementVariable',
    isCreate: false,
    isExtensionElements: false,
    value: value[type]
  });
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      multiElementVariable: value[type]
    }
  });
};

const setCompletionCondition = ({value}: any, type: any) => {
  setProperties({
    name: 'loopCharacteristics',
    key: 'completionCondition',
    createBpmnType: 2,
    isExtensionElements: false,
    value: {
      body: value[type]
    }
  });
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      multiCompletionCondition: value[type]
    }
  });
};

const setUserCode = ({value}: any, type: any) => {
  formData.userData = [];
  let params: any = {
    name: 'ext-user',
    value: value[type]
  };
  setExtensionProperties(params);
};
const setRoleCode = ({value}: any, type: any) => {
  formData.roleData = [];
  let params: any = {
    name: 'ext-role',
    value: value[type]
  };
  setExtensionProperties(params);
};
const setExtProp = (data: any, type: any) => {
  formData[type] = data;
  // let params: any = {
  //   name: 'ext-prop',
  //   value: data
  // };
  // setExtensionProperties(params);

  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      'extProp': data
    }
  });
};


const setCandidateGroups = ({value}: any, type: any) => {
  setProperties({
    isSetExtensionElements: false,
    isExtensionElements: false,
    value: {
      'candidateGroups': value[type]
    }
  });
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      candidateGroups: value[type]
    }
  });

};
const setCandidateUsers = ({value}: any, type: any) => {
  setProperties({
    isSetExtensionElements: false,
    isExtensionElements: false,
    value: {
      'candidateUsers': value[type]
    }
  });
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      candidateUsers: value[type]
    }
  });
  if (!formData.userChecked) return;
  formData.userData = [];
  getExtensionElementsList(reactData.element, ['ext-user']);
};

const setListenerInput = ({value}: any, type: any) => {
  let val = value[type];
  if (formData.listenerType === 'script') {
    let index = state.activeExecutionListenerIndex;
    let extensionElements = getBusinessObject().extensionElements.values;
    let executionListenerArr = extensionElements.filter((v: any) => v.$type === 'camunda:ExecutionListener');
    extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
    executionListenerArr[index].script.scriptFormat = val;
    extensionElements.push(...executionListenerArr);
    return;
  }
  setCurrentExecutionListener(state.activeExecutionListenerIndex, {
    key: formData.listenerType,
    value: val
  });
};

const setListenerScript = ({value}: any, type: any) => {
  let val = value[type];
  let index = state.activeExecutionListenerIndex;
  let extensionElements = getBusinessObject().extensionElements.values;
  let executionListenerArr = extensionElements.filter((v: any) => v.$type === 'camunda:ExecutionListener');
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
  executionListenerArr[index].script.value = val;
  extensionElements.push(...executionListenerArr);
};

const setListenerResource = ({value}: any, type: any) => {
  let val = value[type];
  let index = state.activeExecutionListenerIndex;
  let extensionElements = getBusinessObject().extensionElements.values;
  let executionListenerArr = extensionElements.filter((v: any) => v.$type === 'camunda:ExecutionListener');
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
  executionListenerArr[index].script.resource = val;
  extensionElements.push(...executionListenerArr);
};

const setTaskListenerInput = ({value}: any, type: any) => {
  let val = value[type];
  if (formData.taskListenerType === 'script') {
    let index = state.activeTaskListenerIndex;
    let extensionElements = getBusinessObject().extensionElements.values;
    let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
    extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:TaskListener');
    taskListenerArr[index].script.scriptFormat = val;
    extensionElements.push(...taskListenerArr);
    return;
  }
  setCurrentTaskListener({
    key: formData.taskListenerType,
    value: val
  });
};


const setTaskListenerScript = ({value}: any, type: any) => {
  let val = value[type];
  let index = state.activeTaskListenerIndex;
  let extensionElements = getBusinessObject().extensionElements.values;
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:TaskListener');
  taskListenerArr[index].script.value = val;
  extensionElements.push(...taskListenerArr);
};

const setTaskListenerResource = ({value}: any, type: any) => {
  let val = value[type];
  let index = state.activeTaskListenerIndex;
  let extensionElements = getBusinessObject().extensionElements.values;
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:TaskListener');
  taskListenerArr[index].script.resource = val;
  extensionElements.push(...taskListenerArr);
};


let typeObj: any = {
  experssion: setExperssion,
  name: setName,
  scriptFormat: setScriptFormat,
  inlineScript: setInlineScript,
  resource: setResource,


  candidateGroups: setCandidateGroups,
  candidateUsers: setCandidateUsers,

  loopCardinality: setLoopCardinality,
  collection: setCollection,
  elementVariable: setElementVariable,
  completionCondition: setCompletionCondition,

  userCode: setUserCode,
  roleCode: setRoleCode,

  listenerInput: setListenerInput,
  listenerScript: setListenerScript,
  listenerResource: setListenerResource,

  taskListenerInput: setTaskListenerInput,
  taskListenerScript: setTaskListenerScript,
  taskListenerResource: setTaskListenerResource
};

const getExperience = (typeObj: any, type: any, experience: any) => {
  return (type in typeObj) ? typeObj[type](experience, type) : experience;
};

const getExpression = (moddle: any, type: any, params: any) => {
  return reactData.element.businessObject.conditionExpression || moddle.create(type, params);
};


const confirm = (data: any, type: any) => {
  try {
    let candidateMap: any = {
      'roleData': 'candidateGroups',
      'userData': 'candidateUsers'
    };
    let nameMap: any = {
      'roleData': 'ext-role',
      'userData': 'ext-user',
      'userJqData': 'ext-jq-user',
      'roleJqData': 'ext-jq-role'
    };
    let codeTypeMap: any = {
      'roleData': 'roleId',
      'userData': 'userId',
      'userJqData': 'userId',
      'roleJqData': 'roleId'
    };
    formData[type] = data;
    formData[candidateMap[type]] = data?.map((v: any) => v[codeTypeMap[type]])?.toString();
    if (data.length === 0) {
      getExtensionElementsList(reactData.element, [nameMap[type]]);
      return;
    }
    setProperties({
      value: {
        [nameMap[type]]: JSON.stringify(data)
      }
    });
    if (candidateMap[type])
      setTimeout(() => {
        changeField(formData[candidateMap[type]], candidateMap[type]);
      });


  } catch (e) {
    console.log(e);
  }
};


/** 下拉框事件 **/

let selectMap: any = {
  menu: byBillTypeNoList,
  rollBackTask: taskList

};

const handleSelectChange_Menu = (val: any, type: any) => {
  let cur = byBillTypeNoList.value.filter((v: any) => v?.id == val)?.pop();
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      [`${type}Id`]: cur?.id || '',
      [`${type}Code`]: cur?.id || '',
      [`${type}Name`]: cur?.name || ''
    }
  });


};


const handleSelectChange_RollbackTask = (val: any, type: any) => {
  let value = val.map((v: any) => {
    return {
      rollBackTaskId: v.rollBackTaskId,
      rollBackTaskCode: v.rollBackTaskCode,
      rollBackTaskName: v.rollBackTaskName
    };
  });

  if (!val.length) {
    getExtensionElementsList(reactData.element, ['ext-rollback-task']);
    return;
  }
  setProperties({
    value: {
      'ext-rollback-task': stringify(value)
    }
  });

};


const handleSelectChange_listenerType = (val: any) => {
  state.executionListenerList[state.activeExecutionListenerIndex] = val;
  formData.listenerInput = '';
  if (val === 'script') {
    formData.listenerScriptType = '';
    formData.listenerScript = '';
    formData.listenerResource = '';
    let script = moddle.create('camunda:Script', {});
    setCurrentExecutionListener(state.activeExecutionListenerIndex, {key: 'script', value: script});
    return;
  }
  setCurrentExecutionListener(state.activeExecutionListenerIndex, {key: val});
};

const handleSelectChange_taskEventListenerType = (val: any) => {
  let index = state.activeTaskListenerIndex;
  let extensionElements = getBusinessObject().extensionElements.values;
  state.taskListenerList[index].event = val;
  setTimeout(() => {
    let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
    taskListenerArr[index].event = val;
    getBusinessObject().extensionElements.values = extensionElements.filter((v: any) => v.$type !== 'camunda:TaskListener');
    getBusinessObject().extensionElements.values.push(...taskListenerArr);
  });
};


const handleSelectChange_taskListenerType = (val: any) => {
  let map: any = {
    'script': 'script',
    'expression': 'expression',
    'delegateExpression': 'delegateExpression',
    'class': 'Java Class'
  };
  state.taskListenerList[state.activeTaskListenerIndex].value = map[val];
  formData.taskListenerInput = '';
  if (val === 'script') {
    formData.taskListenerScriptType = '';
    formData.taskListenerScript = '';
    formData.taskListenerResource = '';
    let script = moddle.create('camunda:Script', {});
    setCurrentTaskListener({key: 'script', value: script});
    return;
  }
  setCurrentTaskListener({key: val});
};

const changeExtCommonProp = (val: any, type: any) => {
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {[type]: val}
  });
};

const changeShowGaoji = (val: any) => {
    if (val === '2') {
      formData.userJqData = [];
      formData.roleJqData = [];
      formData.jqPercent = '';
      getExtensionElementsList(reactData.element, ['ext-jq-user', 'ext-jq-role']);
      setExtCommonProp(reactData.element, {
        name: 'ext-commonProp',
        value: {
          jqPercent: ''
        }
      });
    }
};


/***
 *  下拉框 change 事件
 */
const changeConditionType = (value: any) => {
  let element = moddle.create('bpmn:FormalExpression', {
    language: ''
  });
  if (value == 1) delete element.language;

  modeling.updateProperties(toRaw(reactData.element), {
    conditionExpression: value ? toRaw(element) : null
  });


  clearFormData({
    experssion: '',
    scriptFormat: '',
    inlineScript: '',
    resource: '',
    scriptType: ''
  });
};

const changScriptType = (value: any) => {
  let {conditionExpression} = getBusinessObject(reactData.element);
  if (value === 2) {
    conditionExpression.resource = '';
  }
  if (value == 1) delete conditionExpression.resource;
  conditionExpression.body = '';
  modeling.updateProperties(toRaw(reactData.element), {
    conditionExpression
  });

  clearFormData({
    inlineScript: '',
    resource: ''
  });
};


const changListenerScriptType = (val: any) => {
  let index = state.activeExecutionListenerIndex;
  formData.listenerScript = '';
  formData.listenerResource = '';
  let extensionElements = getBusinessObject().extensionElements.values;
  let executionListenerArr = extensionElements.filter((v: any) => v.$type !== 'camunda:Properties');
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
  if (val === 1) {
    'resource' in executionListenerArr[index].script && (executionListenerArr[index].script.resource = null);
  } else {
    'value' in executionListenerArr[index].script && (executionListenerArr[index].script.value = null);
    executionListenerArr[index].script.resource = '';
  }

  extensionElements.push(...executionListenerArr);

};

const changTaskListenerScriptType = (val: any) => {
  let index = state.activeTaskListenerIndex;
  formData.taskListenerScript = '';
  formData.taskListenerResource = '';
  let extensionElements = getBusinessObject().extensionElements.values;
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:TaskListener');
  if (val === 1) {
    'resource' in taskListenerArr[index].script && (taskListenerArr[index].script.resource = null);
  } else {
    'value' in taskListenerArr[index].script && (taskListenerArr[index].script.value = null);
    taskListenerArr[index].script.resource = '';
  }

  extensionElements.push(...taskListenerArr);

};

const changeMultiInstanceType = (val: any) => {
  formData.isInstanceDisabled = val === 3;

  let extensionElementsArr = getBusinessObject().extensionElements.values;
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      multiIsSequential: val
    }
  });

  if (val === 3) {
    formData.loopCardinality = '';
    formData.collection = '';
    formData.elementVariable = '';
    formData.completionCondition = '';

    getBusinessObject().extensionElements.values = extensionElementsArr.filter((v: any) => v.$type !== 'camunda:ExecutionListener');

    modeling.updateProperties(toRaw(reactData.element), {
      loopCharacteristics: null
    });


    setExtCommonProp(reactData.element, {
      name: 'ext-commonProp',
      value: {
        multiElementVariable: ''
      }
    });
    setExtCommonProp(reactData.element, {
      name: 'ext-commonProp',
      value: {
        multiCompletionCondition: ''
      }
    });
    setExtCommonProp(reactData.element, {
      name: 'ext-commonProp',
      value: {
        multiCollection: ''
      }
    });
    return;
  }
  let loopCharacteristics = getBusinessObject(reactData.element).loopCharacteristics || moddle.create('bpmn:MultiInstanceLoopCharacteristics');
  loopCharacteristics.isSequential = val === 1;
  val === 2 && (delete loopCharacteristics.isSequential);
  modeling.updateProperties(toRaw(reactData.element), {
    loopCharacteristics
  });
  let cur = extensionElementsArr.filter((v: any) => v.$type === 'camunda:ExecutionListener');
  if (cur.length === 1) return;
  let executionListener = moddle.create('camunda:ExecutionListener', {
    class: 'com.xincai.workflowCamunda.listener.StartExecutionListener',
    event: 'start'
  });
  extensionElementsArr.push(
      executionListener
  );

};


const clearFormData = (obj: any) => {
  for (const key in obj) {
    formData[key] = null;
  }
};

const changejqType = (item: any) => {
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      jqType: item
    }
  });
};

const changejqUserRange = (item: any) => {
  setExtCommonProp(reactData.element, {
    name: 'ext-commonProp',
    value: {
      jqUserRange: item
    }
  });
};


const handleChangeIsCycle = (bol: any) => {
  let val = bol ? 1 : 2;
  let params: any = {
    name: 'isCycle',
    value: val
  };
  setExtensionProperties(params);
};


const handleClear = (e) => {
  console.log(e);
};


/**
 * 更新元素属性
 * @param { Object } 要更新的属性, 例如 { name: '' }
 */
const updateProperties = (value?: any, type?: any) => {
  // const modeling = props.modeler.get('modeling');
  // const moddle = props.modeler.get('moddle');
  getExperience(typeObj, type, {value});
};

const isEvent: any = computed(() => {
  return verifyIsEvent(reactData.element?.type);
});
const isTask: any = computed(() => {
  return verifyIsTask(reactData.element?.type);
});
const isFlow: any = computed(() => {
  return verifyIsFlow(reactData.element?.type);
});


const showRoleDialog = (type: any) => {
  state.roleDialogState.roleData = formData[type];
  state.roleDialogState.type = type;
  state.roleDialogState.showDialog = true;
};
const showUserDialog = (type: any) => {
  state.userDialogState.userData = formData[type];
  state.userDialogState.type = type;
  state.userDialogState.showDialog = true;
};


const setEvent = () => {
  let moddle = props.modeler.get('moddle');
  const modeling = props.modeler.get('modeling');
  let elementRegistry = props.modeler.get('elementRegistry');
  let cur = elementRegistry.get(reactData.element?.id);
  let eventBus = props.modeler.get('eventBus');
  let eventKeys = Object.keys(modeling._eventBus._listeners);

  eventKeys.forEach(v => {
    eventBus.on(v, (e) => {
      if (!e || e.element?.type === 'bpmn:Process') return;
      console.log(v, e);
    });
  });


};


const checkXML = async () => {
  let data = await props.getXmlData();

  // let task = modeler.get('elementRegistry').filter(v => v.type.includes('Task'));

  state.xmlDialogState.xml = data;
  state.xmlDialogState.showDialog = true;
};


const role = computed(() => {
  return formData.roleData?.map((v: any) => v.roleName).toString() || '';
});
const user = computed(() => {
  return formData.userData?.map((v: any) => v.userName).toString() || '';
});
const jqUser = computed(() => {
  return formData.userJqData?.map((v: any) => v.userName).toString() || '';
});
const jqRole = computed(() => {
  return formData.roleJqData?.map((v: any) => v.roleName).toString() || '';
});


watch(() => formData.listenerType, () => {
  state.listenerTypeLabel = state.ListenerTypeArr.filter((v: any) => v.value === formData.listenerType).pop()?.label;
  if (state.listenerTypeLabel === '脚本') {
    state.listenerTypeLabel = '脚本格式';
  }
});

watch(() => formData.taskListenerType, () => {
  state.taskListenerTypeLabel = state.ListenerTypeArr.filter((v: any) => v.value === formData.taskListenerType).pop()?.label;
  if (state.listenerTypeLabel === '脚本') {
    state.taskListenerTypeLabel = '脚本格式';
  }
});

watch(() => [formData.userJqData, formData.roleJqData, formData.jqPercent], () => {
  console.log(formData.userJqData, formData.roleJqData, formData.jqPercent);
  if (formData.userJqData?.length || formData.roleJqData?.length || formData.jqPercent) {
    state.showGaoJi = '1';
  }
  if (!formData.userJqData?.length && !formData.roleJqData?.length && !formData.jqPercent) {
    state.showGaoJi = '2';
  }

}, {
  deep: true
});


const showExtPropDialog = () => {
  state.extPropDialogState.data = formData?.extProp || '';
  state.extPropDialogState.showDialog = true;
  extPropRef.value.blur()
};

const handleTextAreaVisible = (type: any) => {
  formData[type] = !formData[type];
};

/** 监听器开始 **/

const getExecutionListenerArr = computed(() => {
  let extensionElements = getBusinessObject().extensionElements?.values || [];
  let executionListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:ExecutionListener') || [];
  return [...executionListenerArr];
});
// const setExecutionListenerArr = () => {
//   let extensionElements = getBusinessObject().extensionElements?.values || [];
//   getBusinessObject().extensionElements.values = extensionElements.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
//   getBusinessObject().extensionElements.values.push(...getExecutionListenerArr.value);
// };
const getCurrentExecutionListener = computed(() => {
  let index = state.activeExecutionListenerIndex;
  return {...getExecutionListenerArr.value[index]};
});

const addExecutionListener = () => {
  state.executionListenerList.push('Java Class');
  state.activeExecutionListenerIndex = state.executionListenerList.length - 1;
  getBusinessObject().extensionElements = getBusinessObject().extensionElements || moddle.create('bpmn:ExtensionElements', {values: []});
  let executionListener = moddle.create('camunda:ExecutionListener', {
    class: '',
    event: 'take'
  });
  getBusinessObject().extensionElements.values.push(executionListener);
  // modeling.updateProperties(toRaw(reactData.element), {
  //   extensionElements
  // });
  formData.listenerType = 'class';
  formData.listenerInput = '';
  formData.listenerScriptType = '';
  formData.listenerScript = '';
  formData.listenerResource = '';
};

const removeExecutionListener = (index: any) => {
  let executionListenerArr = getExecutionListenerArr.value;
  getBusinessObject().extensionElements.values = getBusinessObject().extensionElements.values.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
  state.executionListenerList.splice(index, 1);
  executionListenerArr.splice(index, 1);
  state.activeExecutionListenerIndex = '';
  getBusinessObject().extensionElements.values.push(...executionListenerArr);
};


const setCurrentExecutionListener = (index: any, {key, value = ''}: any) => {
  let extensionElements = getBusinessObject()?.extensionElements?.values || [];
  let executionListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:ExecutionListener') || [];
  extensionElements = extensionElements?.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
  delete executionListenerArr[index]?.class;
  delete executionListenerArr[index]?.expression;
  delete executionListenerArr[index]?.delegateExpression;
  executionListenerArr[index][key] = value;

  extensionElements.push(...executionListenerArr);
};

const clickExecutionListenerItem = (item: any, index: any) => {
  let map: any = {
    'Java Class': 'class',
    'expression': 'expression',
    'delegateExpression': 'delegateExpression',
    'script': 'script'
  };
  let scriptMap: any = {
    scriptFormat: 'listenerInput',
    value: 'listenerScript',
    resource: 'listenerResource'
  };
  state.activeExecutionListenerIndex = index;
  formData.listenerType = map[item];
  let extensionElements = getBusinessObject().extensionElements?.values || [];
  let executionListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:ExecutionListener') || [];
  let current = executionListenerArr[index];
  if ('script' in current) {
    let cur = current.script;
    formData.listenerScriptType = 'value' in cur ? 1 : 'resource' in cur ? 2 : '';
    for (const k in cur) {
      if (scriptMap[k]) {
        cur[k] = cur[k] ? cur[k] : '';
        formData[scriptMap[k]] = cur[k];
      }
    }
  } else {
    formData.listenerInput = current[map[item]] || '';
  }


};

/** 监听器结束 **/


/** 任务监听器开始 **/

const getTaskListenerArr = computed(() => {
  let extensionElements = getBusinessObject().extensionElements?.values || [];
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  return [...taskListenerArr];
});
// const setExecutionListenerArr = () => {
//   let extensionElements = getBusinessObject().extensionElements?.values || [];
//   getBusinessObject().extensionElements.values = extensionElements.filter((v: any) => v.$type !== 'camunda:ExecutionListener');
//   getBusinessObject().extensionElements.values.push(...getTaskListenerArr.value);
// };
const getCurrentTaskListener = computed(() => {
  let index = state.activeTaskListenerIndex;
  return getTaskListenerArr.value[index];
});

const addTaskListener = () => {
  state.taskListenerList.push({
    event: 'create',
    value: 'Java Class'
  });
  state.activeTaskListenerIndex = state.taskListenerList.length - 1;
  getBusinessObject().extensionElements = getBusinessObject().extensionElements || moddle.create('bpmn:ExtensionElements', {values: []});
  let taskListener = moddle.create('camunda:TaskListener', {
    class: '',
    event: 'create',
    id: generateUuidv4()
  });
  getBusinessObject().extensionElements.values.push(taskListener);
  // modeling.updateProperties(toRaw(reactData.element), {
  //   extensionElements
  // });
  formData.taskEventListenerType = 'create';
  formData.taskListenerType = 'class';
  formData.taskListenerInput = '';
  formData.taskListenerScriptType = '';
  formData.taskListenerScript = '';
  formData.taskListenerResource = '';
};

const removeTaskListener = (index: any) => {
  let extensionElements = getBusinessObject().extensionElements?.values || [];
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  getBusinessObject().extensionElements.values = getBusinessObject().extensionElements.values.filter((v: any) => v.$type !== 'camunda:TaskListener');
  state.taskListenerList.splice(index, 1);
  taskListenerArr.splice(index, 1);
  state.activeTaskListenerIndex = '';
  getBusinessObject().extensionElements.values.push(...taskListenerArr);
};


const setCurrentTaskListener = ({key, value = ''}: any) => {
  let index = state.activeTaskListenerIndex;
  let extensionElements = getBusinessObject().extensionElements.values;
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  extensionElements = extensionElements.filter((v: any) => v.$type !== 'camunda:TaskListener');
  delete taskListenerArr[index]?.class;
  delete taskListenerArr[index]?.expression;
  delete taskListenerArr[index]?.delegateExpression;
  taskListenerArr[index][key] = value;

  extensionElements.push(...taskListenerArr);
};

const clickTaskListenerItem = (item: any, index: any) => {
  let {event, value} = item;
  let map: any = {
    'Java Class': 'class',
    'expression': 'expression',
    'delegateExpression': 'delegateExpression',
    'script': 'script'
  };
  let scriptMap: any = {
    scriptFormat: 'taskListenerInput',
    value: 'taskListenerScript',
    resource: 'taskListenerResource'
  };
  state.activeTaskListenerIndex = index;
  formData.taskListenerType = map[value];
  formData.taskEventListenerType = event;
  let extensionElements = getBusinessObject().extensionElements?.values || [];
  let taskListenerArr = extensionElements?.filter((v: any) => v.$type === 'camunda:TaskListener') || [];
  let current = taskListenerArr[index];
  if ('script' in current) {
    let cur = current.script;
    formData.taskListenerScriptType = 'value' in cur ? 1 : 'resource' in cur ? 2 : '';
    for (const k in cur) {
      if (scriptMap[k]) {
        cur[k] = cur[k] ? cur[k] : '';
        formData[scriptMap[k]] = cur[k];
      }
    }
  } else {
    formData.taskListenerInput = current[map[value]] || '';
  }


};

/** 任务监听器结束 **/


const clearElement = () => {
  reactData.element = {};
  state.preveSelection = {};
  reactData.selectedElements = [];
};


onMounted(() => {
  init();
  // setTimeout(() => {
  //   modeler.get('canvas').zoom('fit-viewport', 'auto');
  // });
  setTimeout(() => {
    if (addFlowStatus.value === 'copy') {
      modeler.get('elementRegistry').getAll().forEach((v: any) => {
        modeling.updateProperties(v, {
          id: generateUuidv4('1', false)
        });
      });
    }
    // console.log(modeler.get('elementRegistry').getAll());
  }, 300);

});

/** bpmn相关方法 **/
function getBusinessObject(element?: any) {
  element = element ? toRaw(element) : toRaw(reactData.element);
  return (element && element.businessObject) || element;
}

/* 此方法会直接操作bpmn, nameArr为扩展属性的name, 传入可删除name对应的扩展  */
function getExtensionElementsList(element: any, nameArr?: any) {
  const extensionElements = getBusinessObject(element).get('extensionElements');
  if (!extensionElements) {
    return [];
  }
  const values = extensionElements.get('values');
  if (!values || !values.length) {
    return [];
  }
  let values1 = values[0].values;
  if (nameArr.length) {
    values[0].values = values1.filter((item: any) => !nameArr.includes(item.name));
  }

  return values;
}

function setExtCommonProp(element: any, params: any, nameArr?: any) {
  params.value = stringify(params.value);
  const elementRegistry = modeler.get('elementRegistry');
  element = element ? element : elementRegistry.get(reactData.element.id);
  const extensionElements = getBusinessObject(element).get('extensionElements') || moddle.create('bpmn:ExtensionElements', {values: []});
  let properties = extensionElements.get('values')?.filter((v: any) => v.$type === 'camunda:Properties').pop() || moddle.create('camunda:Properties', {values: []});
  let property;
  let values = properties?.get('values');
  if (values && values.length) {
    let current = values.find((v: any) => v?.name === params.name);
    let currentValue = JSON.parse(current.value);
    params = JSON.parse(params.value);
    for (const key in params) {
      if (!params[key]) {
        delete params[key];
      }
      currentValue[key] = params[key];
    }
    current.value = stringify(currentValue);
  } else {
    property = moddle.create('camunda:Property', params);
    values.push(property);
    extensionElements.values.push(properties);
    modeling.updateProperties(toRaw(reactData.element), {
      extensionElements: toRaw(extensionElements)
    });
  }
}


const setUpdateProperties = (modeling: any, expressionName: any, expression: any) => {
  modeling.updateProperties(toRaw(reactData.element), {
    [expressionName]: toRaw(expression)
  });
};


/***
 *  设置 扩展属性
 */
const setExtensionProperties = (params: any) => {
  let extensionElements = reactData.element.businessObject.extensionElements || moddle.create('bpmn:ExtensionElements', {values: []});
  let Properties = extensionElements.get('values')?.[0] || moddle.create('camunda:Properties', {values: []});
  let Property = moddle.create('camunda:Property', params);
  let curItem = Properties.get('values').find((item: any) => item.name === params.name);
  if (curItem) {
    curItem.value = params.value;
  } else {
    Properties.get('values').push(Property);
  }
  extensionElements.values = [toRaw(Properties)];

  modeling.updateProperties(toRaw(reactData.element), {
    extensionElements: toRaw(extensionElements)
  });
};

/***
 * 设置属性
 * @param arg
 * isExtensionElements 是否为扩展属性
 * isSetExtensionElements  是否设置的是扩展属性
 * isCreateExtensionElements  是否需要创建扩展属性
 * createBpmnType 创建bpmn的类型
 * name 更新节点对应的businessObject的属性(key)
 * key 添加的key
 */
const setProperties = (...arg: any) => {
  let {
    value,
    element = {},
    isExtensionElements = true,
    isSetExtensionElements = true,
    isCreateExtensionElements = false,
    createBpmnType = 1,
    name,
    key,
    isCreate = true
  } = arg[0];
  let createBpmnTypeMap: any = {
    1: 'bpmn:ExtensionElements',
    2: 'bpmn:FormalExpression'
  };
  element = Object.keys(element).length ? element : reactData.element;
  let businessObject = getBusinessObject(element);

  try {
    // 设置扩展属性
    if (isSetExtensionElements) {
      let params: any = {};
      for (let key in value) {
        params.name = key;
        params.value = value[key];
      }
      if (isExtensionElements) {
        let extensionElements;
        if (isCreateExtensionElements) {
          extensionElements = moddle.create('bpmn:ExtensionElements', {values: []});
        } else {
          extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements', {values: []});
        }
        let properties = extensionElements.get('values')?.[0] || moddle.create('camunda:Properties', {values: []});

        let property = moddle.create('camunda:Property', params);
        let curItem = properties.get('values').find((item: any) => item.name === params.name);
        if (curItem) {
          curItem.value = params.value;
        } else {
          properties.get('values').push(property);
        }
        extensionElements.values = [toRaw(properties)];

        modeling.updateProperties(toRaw(element), {
          extensionElements: toRaw(extensionElements)
        });
      } else {
        const elementRegistry = modeler.get('elementRegistry');
        let cur = elementRegistry.get(element.id);
        let updateObj = cur.businessObject[name];
        updateObj[key] = isCreate ? moddle.create(createBpmnTypeMap[createBpmnType], value) : value;
        modeling.updateProperties(toRaw(element), {
          [name]: updateObj
        });
      }
    } else {  //设置基础属性
      modeling.updateProperties(toRaw(element), {
        ...value
      });

    }

  } catch (e) {
    console.log(e);
  }
};


function stringify(value: any) {
  return JSON.stringify(value);
}

function generateUuidv4(str?: any, notCheck: Boolean = true) {
  let uid = 'a' + uuidv4().replace(/-/g, '');
  if (!str) return uid;
  if (!notCheck) return uid;
  if (str.length < 30) {
    return uid;
  } else {
    return str;
  }
}
</script>


<style scoped lang="scss">
.custom-properties-panel {
  position: absolute;
  right: 0px;
  top: 0;
  width: 300px;
  background-color: rgba(251, 251, 251, 0.9);
  border-color: rgba(0, 0, 0, 0.09);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  //padding: 20px;
}

.empty {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-weight: 700;
}

.element-item {
  padding: 10px;
  margin-top: 5px;
  border: 1px solid;
  border-color: darkorange;
  border-radius: 8px;
}

.element-item:first-child {
  margin-top: 0;
}

.custom-properties-panel input,
.custom-properties-panel textarea {
  padding: 4px 11px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  background-color: #fff;
  background-image: none;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;
  outline: none;
}

.custom-properties-panel input:focus,
.custom-properties-panel button:focus,
.custom-properties-panel textarea:focus,
.custom-properties-panel [contenteditable]:focus {
  border-color: rgb(239, 112, 96);
  box-shadow: 0 0 1px 2px rgb(239, 112, 96, 0.2);
}

.custom-properties-panel label {
  font-weight: bold;
}

.custom-properties-panel label:after {
  //content: ': ';
}

.custom-properties-panel button + button {
  margin-left: 10px;
}

:deep .form {


}

:deep .el-collapse-item__content {
  padding: 0px 20px 0 0;
}

:deep .el-collapse-item__header {
  font-size: 14px;
  height: 35px;
  padding-left: 10px;
  font-weight: bold;
}


:deep .el-form-item__label {
  font-size: 12px;
}

:deep .el-form-item--small.el-form-item {
  margin-bottom: 5px;

  .el-input{
    .el-input__wrapper{
      max-width: 168px;
    }
  }
  .el-textarea {
    .el-textarea__inner{
      max-width: 182px;
    }
  }

}

:deep .list-tree-container {
  width: 230px;

  .edit-list-tree {
    .vxe-input {
      //width: 230px;
    }
  }
}

:deep .custom-properties-header {
  height: 32px;
  border-top: 1px solid #dce3e8;
  border-bottom: 1px solid #dce3e8;
  background: #f1f3f4;
  color: #000;
  line-height: 32px;
  font-size: 14px;
  width: 100%;
  padding-left: 10px;
  box-sizing: border-box;
  border-radius: 4px;
}

:deep .el-radio {
  margin-right: 10px;
}

.bottomIcon {
  cursor: pointer;
  position: absolute;
  top: 5px;
  right: -8px;
}

.nowrap .el-form-item__label {
  white-space: nowrap;
}

.executionListener_wrapper {
  margin: 5px 0 10px 25px;
  width: 90%;
  height: 150px;
  border: 2px solid #f0f0f0;
  overflow-y: auto;

}

.active {
  background-color: #9ac4fc;
}
</style>

<style lang="scss">
.properties_select {
  .el-select-dropdown__item {
    padding: 0 10px;
  }

}

.executionListener_item {
  display: flex;
  justify-content: space-between;
  padding: 2px 20px 2px 10px;
  height: 20px;
  align-items: center
}
</style>