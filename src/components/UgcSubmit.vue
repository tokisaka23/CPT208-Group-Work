<script setup>
import { onMounted, reactive, ref } from 'vue';
import { Button, CellGroup, Field, showFailToast, showSuccessToast } from 'vant';
import { supabase } from '../lib/supabase';

// TODO: 登录模块接入后，替换成真实登录用户的 user.id。
const TEMP_UPLOADER_ID = '00000000-0000-0000-0000-000000000001';
const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const submitting = ref(false);
const submitResult = ref('');
const locating = ref(false);
const locationText = ref('');
const selectedImage = ref(null);
const imagePreviewUrl = ref('');
const fileInputRef = ref(null);

const form = reactive({
  name: '',
  description: '',
  lat: null,
  lng: null,
});

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.lat = null;
  form.lng = null;
  locationText.value = '';
  clearSelectedImage();
  getCurrentLocation();
};

const clearSelectedImage = () => {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }

  selectedImage.value = null;
  imagePreviewUrl.value = '';

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleImageChange = (event) => {
  const [file] = event.target.files || [];

  if (!file) {
    clearSelectedImage();
    return;
  }

  if (!file.type.startsWith('image/')) {
    showFailToast('请选择图片文件');
    event.target.value = '';
    clearSelectedImage();
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    showFailToast(`图片不能超过 ${MAX_IMAGE_SIZE_MB}MB`);
    event.target.value = '';
    clearSelectedImage();
    return;
  }

  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }

  selectedImage.value = file;
  imagePreviewUrl.value = URL.createObjectURL(file);
};

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    showFailToast('当前浏览器不支持定位');
    return;
  }

  locating.value = true;
  locationText.value = '正在获取当前位置...';

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      form.lat = coords.latitude;
      form.lng = coords.longitude;
      locationText.value = '';
      locating.value = false;
      showSuccessToast('定位成功');
    },
    (error) => {
      locating.value = false;
      locationText.value = '定位失败，请检查浏览器位置权限';

      if (error.code === 1) {
        showFailToast('你拒绝了位置权限');
        return;
      }

      if (error.code === 2) {
        showFailToast('暂时无法获取你的位置');
        return;
      }

      if (error.code === 3) {
        showFailToast('定位超时，请重试');
        return;
      }

      showFailToast('定位失败');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};

onMounted(() => {
  getCurrentLocation();
});

const resolveUploaderId = () => TEMP_UPLOADER_ID;

const handleSubmit = async () => {
  if (!form.name.trim()) {
    showFailToast('请输入景点名称');
    return;
  }

  if (!form.description.trim()) {
    showFailToast('请输入景点描述');
    return;
  }

  if (!selectedImage.value) {
    showFailToast('请上传景点图片');
    return;
  }

  if (form.lat === null || form.lng === null) {
    showFailToast('正在等待定位结果');
    return;
  }

  const lat = Number(form.lat);
  const lng = Number(form.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    showFailToast('定位结果无效，请刷新重试');
    return;
  }

  const uploaderId = resolveUploaderId();

  if (!uploaderId) {
    showFailToast('请先登录后再上传');
    return;
  }

  submitting.value = true;
  submitResult.value = '';

  let imageUrl = null;

  if (selectedImage.value) {
    const fileExt = selectedImage.value.name.split('.').pop() || 'jpg';
    const filePath = `ugc/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('ugc-images')
      .upload(filePath, selectedImage.value, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      submitting.value = false;
      submitResult.value = `图片上传失败：${uploadError.message}`;
      showFailToast('图片上传失败');
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('ugc-images')
      .getPublicUrl(filePath);

    imageUrl = publicUrlData.publicUrl;
  }

  const { data, error } = await supabase
    .from('ugc_pois')
    .insert([
      {
        user_id: uploaderId,
        name: form.name.trim(),
        lat,
        lng,
        description: form.description.trim() || null,
        image_url: imageUrl,
      },
    ])
    .select()
    .single();

  submitting.value = false;

  if (error) {
    submitResult.value = `提交失败：${error.message}`;
    showFailToast('提交失败');
    return;
  }

  submitResult.value = `提交成功：${data.name}`;
  showSuccessToast('提交成功');
  resetForm();
};
</script>

<template>
  <section class="ugc-submit">
    <h2 class="title">上传新景点</h2>
    <p class="subtitle">页面加载后会自动获取当前位置，图片上传后面再接。</p>
    <p class="auth-note">当前使用测试上传身份，接入登录模块后会切换成真实用户。</p>

    <CellGroup inset>
      <Field v-model="form.name" label="景点名" placeholder="例如：平江路小众茶馆" />
      <Field
        v-model="form.description"
        label="描述"
        type="textarea"
        rows="3"
        autosize
        placeholder="请填写景点描述"
      />
    </CellGroup>

    <p v-if="locationText" class="location-text">{{ locationText }}</p>

    <div class="image-upload">
      <label class="upload-card" for="ugc-image-input">
        <span class="upload-title">{{ selectedImage ? '更换图片' : '上传图片' }}</span>
        <span class="upload-hint">
          {{ selectedImage ? selectedImage.name : '选择一张景点照片作为预览图（5MB以内）' }}
        </span>
      </label>
      <input
        id="ugc-image-input"
        ref="fileInputRef"
        class="file-input"
        type="file"
        accept="image/*"
        @change="handleImageChange"
      />

      <div v-if="imagePreviewUrl" class="preview-wrap">
        <img :src="imagePreviewUrl" alt="景点预览图" class="image-preview" />
        <Button plain type="default" size="small" @click="clearSelectedImage">
          撤回图片
        </Button>
      </div>
    </div>

    <Button block type="primary" :loading="submitting || locating" @click="handleSubmit">
      提交景点
    </Button>

    <p v-if="submitResult" class="result">{{ submitResult }}</p>
  </section>
</template>

<style scoped>
.ugc-submit {
  padding: 16px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.title {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1f2937;
}

.subtitle {
  margin: 0 0 16px;
  font-size: 13px;
  color: #6b7280;
}

.auth-note {
  margin: 0 0 14px;
  font-size: 12px;
  color: #92400e;
}

.location-text {
  margin: 14px 0 10px;
  font-size: 14px;
  color: #4b5563;
}

.image-upload {
  margin: 0 0 16px;
}

.upload-card {
  display: block;
  padding: 14px 16px;
  border: 1px dashed #93c5fd;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
  cursor: pointer;
}

.upload-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1d4ed8;
}

.upload-hint {
  display: block;
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}

.file-input {
  display: none;
}

.preview-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
}

.image-preview {
  display: block;
  width: 100%;
  max-height: 220px;
  margin-top: 12px;
  object-fit: cover;
  border-radius: 12px;
}

.result {
  margin: 12px 0 0;
  font-size: 14px;
  color: #2563eb;
}
</style>
