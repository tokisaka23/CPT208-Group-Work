<script setup>
import { Button, Picker, Popup } from 'vant';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import ScenicMapDialog from './ScenicMapDialog.vue';
import { listSuzhouPois, resolveSuzhouPoi } from '../../data/poiMapData';
import { getGroupSharedMapsByGroupIds, getVisibleSharedMaps } from '../../services/maps/sharedMapService';

const props = defineProps({
  currentUser: { type: Object, default: null },
  friends: { type: Array, default: () => [] },
  groups: { type: Array, default: () => [] },
});

const visibleShares = ref([]);
const groupSessions = ref([]);
const pickerVisible = ref(false);
const pickerGroupId = ref('');
const viewerVisible = ref(false);
const activeViewerPoi = ref(null);
const activeViewerGroup = ref(null);

const poiOptions = computed(() => listSuzhouPois().map((item) => ({ text: item.name, value: item.id })));
const groupSessionMap = computed(() => Object.fromEntries(groupSessions.value.map((item) => [item.groupId, item])));
const groupPoiDrafts = ref({});

const groupsWithSession = computed(() => (props.groups || []).map((group) => {
  const session = groupSessionMap.value[group.id] || null;
  return {
    ...group,
    sharedSession: session,
    draftDestinationId: groupPoiDrafts.value[group.id] || session?.destinationId || 'pingjiangroad',
  };
}));

function refreshData() {
  visibleShares.value = getVisibleSharedMaps({
    currentUser: props.currentUser,
    friends: props.friends,
    groups: props.groups,
  });
  groupSessions.value = getGroupSharedMapsByGroupIds((props.groups || []).map((item) => item.id));
}

function openPoiPicker(groupId) {
  pickerGroupId.value = groupId;
  pickerVisible.value = true;
}

function handleConfirmPoi({ selectedOptions }) {
  const selectedOption = selectedOptions?.[0];
  if (!selectedOption?.value || !pickerGroupId.value) {
    pickerVisible.value = false;
    return;
  }

  groupPoiDrafts.value = {
    ...groupPoiDrafts.value,
    [pickerGroupId.value]: selectedOption.value,
  };
  pickerVisible.value = false;
}

function openGroupMap(group, destinationId = '') {
  const session = groupSessionMap.value[group.id] || null;
  const poi = resolveSuzhouPoi(destinationId || session?.destinationId || groupPoiDrafts.value[group.id] || 'pingjiangroad');

  if (!poi) {
    return;
  }

  activeViewerPoi.value = poi;
  activeViewerGroup.value = group;
  viewerVisible.value = true;
}

function openShareRecord(record) {
  const poi = resolveSuzhouPoi(record.destinationId);
  const group = (props.groups || []).find((item) => item.id === record.groupId) || null;

  if (!poi) {
    return;
  }

  activeViewerPoi.value = poi;
  activeViewerGroup.value = record.shareType === 'group' ? group : null;
  viewerVisible.value = true;
}

onMounted(() => {
  refreshData();
  window.addEventListener('shared-maps-updated', refreshData);
});

onUnmounted(() => {
  window.removeEventListener('shared-maps-updated', refreshData);
});
</script>

<template>
  <section class="shared-map-panel">
    <div class="shared-map-panel__head">
      <div>
        <p class="shared-map-panel__eyebrow">Shared Maps</p>
        <h3>共享地图</h3>
        <p>群组里的共享地图会保留同一份目的地、路线模式和标注点位，群成员打开后可以继续一起编辑。</p>
      </div>
    </div>

    <section class="shared-map-panel__block">
      <div class="shared-map-panel__block-head">
        <h4>群组共享地图</h4>
        <span>{{ groups.length }} 个群组</span>
      </div>

      <div v-if="groupsWithSession.length" class="shared-map-panel__group-list">
        <article v-for="group in groupsWithSession" :key="group.id" class="group-map-card">
          <div class="group-map-card__head">
            <div>
              <span>{{ group.members?.length || 0 }} 人</span>
              <h5>{{ group.name }}</h5>
            </div>
            <strong>{{ group.sharedSession?.destinationName || '未创建' }}</strong>
          </div>

          <p class="group-map-card__desc">
            {{ group.sharedSession ? '群成员会看到同一张共享地图，也可以继续添加或删除点位。' : '先选择一个苏州景点或园林，再进入这个群组的共享地图。' }}
          </p>

          <div class="group-map-card__meta">
            <span>当前目的地</span>
            <strong>{{ resolveSuzhouPoi(group.draftDestinationId)?.name || '平江路' }}</strong>
          </div>

          <div class="group-map-card__actions">
            <Button size="small" round plain @click="openPoiPicker(group.id)">选择目的地</Button>
            <Button size="small" round type="primary" @click="openGroupMap(group, group.draftDestinationId)">
              {{ group.sharedSession ? '进入共享地图' : '创建共享地图' }}
            </Button>
          </div>
        </article>
      </div>

      <div v-else class="shared-map-panel__empty">还没有群组，先创建群组后再使用共享地图。</div>
    </section>

    <section class="shared-map-panel__block">
      <div class="shared-map-panel__block-head">
        <h4>最近共享记录</h4>
        <span>{{ visibleShares.length }} 条</span>
      </div>

      <div v-if="visibleShares.length" class="shared-map-panel__share-list">
        <article v-for="item in visibleShares" :key="item.id" class="shared-map-card">
          <div class="shared-map-card__head">
            <div>
              <span>{{ item.shareType === 'group' ? `群组 · ${item.groupName}` : `好友 · ${item.friendName || '定向分享'}` }}</span>
              <h4>{{ item.destinationName }}</h4>
            </div>
            <strong>{{ item.mode === 'driving' ? '车行' : '步行' }}</strong>
          </div>
          <p>{{ item.ownerName }} 分享的地图{{ item.note ? `：${item.note}` : '。' }}</p>
          <Button size="small" round plain type="primary" @click="openShareRecord(item)">打开地图</Button>
        </article>
      </div>

      <div v-else class="shared-map-panel__empty">当前还没有共享记录。</div>
    </section>

    <Popup :show="pickerVisible" round position="bottom" @update:show="pickerVisible = $event">
      <Picker :columns="poiOptions" @confirm="handleConfirmPoi" @cancel="pickerVisible = false" />
    </Popup>

    <ScenicMapDialog
      :show="viewerVisible"
      :poi="activeViewerPoi"
      :title="activeViewerGroup ? `${activeViewerGroup.name} · 共享地图` : activeViewerPoi?.name || '共享地图'"
      :shared-scope="activeViewerGroup ? 'group' : 'solo'"
      :shared-group="activeViewerGroup"
      :current-user="currentUser"
      :friends="friends"
      @update:show="viewerVisible = $event"
    />
  </section>
</template>

<style scoped>
.shared-map-panel{display:grid;gap:14px;padding:18px;border-radius:22px;background:#fff;box-shadow:0 10px 28px rgba(31,58,44,.08)}.shared-map-panel__head h3,.shared-map-card__head h4,.shared-map-panel__head p,.shared-map-card p,.group-map-card__head h5{margin:0}.shared-map-panel__eyebrow{margin:0 0 6px;color:#7b897f;font-size:12px;letter-spacing:.14em;text-transform:uppercase}.shared-map-panel__head p{margin-top:8px;color:#5f6e65;line-height:1.6}.shared-map-panel__block{display:grid;gap:12px}.shared-map-panel__block-head,.shared-map-card__head,.group-map-card__head,.group-map-card__meta{display:flex;justify-content:space-between;gap:12px}.shared-map-panel__block-head h4{margin:0}.shared-map-panel__block-head span,.shared-map-card__head span,.group-map-card__head span,.group-map-card__meta span{color:#74837a;font-size:12px}.shared-map-panel__group-list,.shared-map-panel__share-list{display:grid;gap:12px}.group-map-card,.shared-map-card{display:grid;gap:10px;padding:14px;border-radius:18px;background:#f7faf8}.group-map-card__desc,.shared-map-card p{color:#52635a;line-height:1.6}.group-map-card__actions{display:flex;gap:8px;flex-wrap:wrap}.group-map-card__meta strong,.group-map-card__head strong{color:#8c5532}.shared-map-panel__empty{padding:14px;border-radius:16px;background:#f7faf8;color:#74837a}
</style>
