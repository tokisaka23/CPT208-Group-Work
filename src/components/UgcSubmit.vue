<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { Button, CellGroup, Field, showFailToast, showSuccessToast } from 'vant';
import { useLanguage } from '../i18n';
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabase/clientRuntime';
import { formatUgcSubmitMessage, getUgcSubmitText } from './ugcSubmitI18n.js';

const props = defineProps({
  uploaderId: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submitted']);
const { language } = useLanguage();
const text = computed(() => getUgcSubmitText(language.value));

const MAX_IMAGE_SIZE_MB = 1;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const COMPRESS_THRESHOLD_BYTES = MAX_IMAGE_SIZE_BYTES;
const MAX_IMAGE_DIMENSION = 1600;
const COMPRESS_QUALITY = 0.82;

const form = reactive({
  name: '',
  description: '',
  lat: null,
  lng: null,
});

const submitting = ref(false);
const locating = ref(false);
const locationStatus = ref('');
const locationText = computed(() => (locationStatus.value ? text.value[locationStatus.value] : ''));
const submitResult = ref('');
const selectedImage = ref(null);
const imagePreviewUrl = ref('');
const fileInputRef = ref(null);
const canSubmit = computed(() => Boolean(props.uploaderId));

const cropOpen = ref(false);
const cropImageRef = ref(null);
const cropContainerRef = ref(null);
const cropSourceUrl = ref('');
const cropDragging = ref(false);
const cropSelection = reactive({ x: 0, y: 0, width: 0, height: 0 });
const cropStart = reactive({ x: 0, y: 0 });

function revokePreviewUrl() {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value);
  }
}

function closeCrop() {
  cropOpen.value = false;
  cropDragging.value = false;

  if (cropSourceUrl.value) {
    URL.revokeObjectURL(cropSourceUrl.value);
  }

  cropSourceUrl.value = '';
  cropSelection.x = 0;
  cropSelection.y = 0;
  cropSelection.width = 0;
  cropSelection.height = 0;
}

function clearSelectedImage() {
  revokePreviewUrl();
  selectedImage.value = null;
  imagePreviewUrl.value = '';

  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }

  closeCrop();
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(text.value.imageLoadFailed));
    image.src = url;
  });
}

async function compressImage(file) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(sourceUrl);
    let targetWidth = image.naturalWidth;
    let targetHeight = image.naturalHeight;

    if (targetWidth > MAX_IMAGE_DIMENSION || targetHeight > MAX_IMAGE_DIMENSION) {
      const ratio = Math.min(MAX_IMAGE_DIMENSION / targetWidth, MAX_IMAGE_DIMENSION / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error(text.value.browserNoCompress);
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', COMPRESS_QUALITY));
    if (!blob) {
      throw new Error(text.value.compressFailed);
    }

    return new File([blob], `compressed-${Date.now()}.jpg`, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function getPointerPosition(event) {
  const container = cropContainerRef.value;
  if (!container) {
    return { x: 0, y: 0 };
  }

  const rect = container.getBoundingClientRect();
  return {
    x: Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
    y: Math.min(Math.max(event.clientY - rect.top, 0), rect.height),
  };
}

function startCrop(event) {
  const point = getPointerPosition(event);
  cropDragging.value = true;
  cropStart.x = point.x;
  cropStart.y = point.y;
  cropSelection.x = point.x;
  cropSelection.y = point.y;
  cropSelection.width = 0;
  cropSelection.height = 0;
}

function updateCrop(event) {
  if (!cropDragging.value) {
    return;
  }

  const point = getPointerPosition(event);
  cropSelection.x = Math.min(cropStart.x, point.x);
  cropSelection.y = Math.min(cropStart.y, point.y);
  cropSelection.width = Math.abs(point.x - cropStart.x);
  cropSelection.height = Math.abs(point.y - cropStart.y);
}

function endCrop() {
  cropDragging.value = false;
}

function openCropper() {
  if (!selectedImage.value) {
    showFailToast(text.value.selectImageFirst);
    return;
  }

  closeCrop();
  cropSourceUrl.value = URL.createObjectURL(selectedImage.value);
  cropOpen.value = true;
}

async function applyCrop() {
  if (!cropImageRef.value || !selectedImage.value) {
    return;
  }

  if (cropSelection.width < 8 || cropSelection.height < 8) {
    showFailToast(text.value.selectCropArea);
    return;
  }

  const image = cropImageRef.value;
  const imageRect = image.getBoundingClientRect();
  const scaleX = image.naturalWidth / imageRect.width;
  const scaleY = image.naturalHeight / imageRect.height;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropSelection.width * scaleX);
  canvas.height = Math.round(cropSelection.height * scaleY);

  const context = canvas.getContext('2d');
  if (!context) {
    showFailToast(text.value.browserNoCrop);
    return;
  }

  context.drawImage(
    image,
    Math.round(cropSelection.x * scaleX),
    Math.round(cropSelection.y * scaleY),
    Math.round(cropSelection.width * scaleX),
    Math.round(cropSelection.height * scaleY),
    0,
    0,
    canvas.width,
    canvas.height
  );

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
  if (!blob) {
    showFailToast(text.value.cropFailed);
    return;
  }

  const croppedFile = new File([blob], `cropped-${Date.now()}.jpg`, { type: 'image/jpeg' });
  if (croppedFile.size > MAX_IMAGE_SIZE_BYTES) {
    showFailToast(text.value.croppedTooLarge);
    return;
  }

  revokePreviewUrl();
  selectedImage.value = croppedFile;
  imagePreviewUrl.value = URL.createObjectURL(croppedFile);
  closeCrop();
  showSuccessToast(text.value.cropApplied);
}

function handleImageChange(event) {
  void (async () => {
    const [file] = event.target.files || [];

    if (!file) {
      clearSelectedImage();
      return;
    }

    if (!file.type.startsWith('image/')) {
      showFailToast(text.value.chooseImageFile);
      event.target.value = '';
      clearSelectedImage();
      return;
    }

    let nextFile = file;

    if (file.size > COMPRESS_THRESHOLD_BYTES) {
      try {
        nextFile = await compressImage(file);
        showSuccessToast(text.value.compressed);
      } catch (error) {
        showFailToast(error.message || text.value.compressFailed);
        event.target.value = '';
        clearSelectedImage();
        return;
      }
    }

    if (nextFile.size > MAX_IMAGE_SIZE_BYTES) {
      showFailToast(text.value.compressedStillTooLarge);
      event.target.value = '';
      clearSelectedImage();
      return;
    }

    revokePreviewUrl();
    selectedImage.value = nextFile;
    imagePreviewUrl.value = URL.createObjectURL(nextFile);
  })();
}

function getCurrentLocation() {
  if (!navigator.geolocation) {
    showFailToast(text.value.geolocationUnsupported);
    return;
  }

  locating.value = true;
  locationStatus.value = 'locating';

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      form.lat = coords.latitude;
      form.lng = coords.longitude;
      locating.value = false;
      locationStatus.value = '';
      showSuccessToast(text.value.locationSuccess);
    },
    (error) => {
      locating.value = false;
      locationStatus.value = 'locationFailedPermission';

      if (error.code === 1) {
        showFailToast(text.value.locationDenied);
        return;
      }

      if (error.code === 2) {
        showFailToast(text.value.locationUnavailable);
        return;
      }

      if (error.code === 3) {
        showFailToast(text.value.locationTimeout);
        return;
      }

      showFailToast(text.value.locationFailed);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

function resetForm() {
  form.name = '';
  form.description = '';
  form.lat = null;
  form.lng = null;
  submitResult.value = '';
  locationStatus.value = '';
  clearSelectedImage();
  getCurrentLocation();
}

async function handleSubmit() {
  if (!isSupabaseConfigured()) {
    showFailToast(text.value.supabaseMissing);
    return;
  }

  if (!canSubmit.value) {
    showFailToast(text.value.loginRequired);
    return;
  }

  if (!form.name.trim()) {
    showFailToast(text.value.nameRequired);
    return;
  }

  if (!form.description.trim()) {
    showFailToast(text.value.descriptionRequired);
    return;
  }

  if (!selectedImage.value) {
    showFailToast(text.value.imageRequired);
    return;
  }

  if (form.lat === null || form.lng === null) {
    showFailToast(text.value.waitingLocation);
    return;
  }

  const lat = Number(form.lat);
  const lng = Number(form.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    showFailToast(text.value.invalidLocation);
    return;
  }

  submitting.value = true;
  submitResult.value = '';
  const supabase = getSupabaseClient();
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
    submitResult.value = formatUgcSubmitMessage(text.value.uploadFailedResult, { message: uploadError.message });
    showFailToast(text.value.uploadFailed);
    return;
  }

  const { data: publicUrlData } = supabase.storage.from('ugc-images').getPublicUrl(filePath);
  const imageUrl = publicUrlData.publicUrl;

  const { data, error } = await supabase
    .from('ugc_pois')
    .insert([
      {
        user_id: props.uploaderId,
        name: form.name.trim(),
        lat,
        lng,
        description: form.description.trim(),
        image_url: imageUrl,
      },
    ])
    .select()
    .single();

  submitting.value = false;

  if (error) {
    submitResult.value = formatUgcSubmitMessage(text.value.submitFailedResult, { message: error.message });
    showFailToast(text.value.submitFailed);
    return;
  }

  submitResult.value = formatUgcSubmitMessage(text.value.submitSuccessResult, { name: data.name });
  showSuccessToast(text.value.submitSuccess);
  emit('submitted', data);
  resetForm();
}

onMounted(() => {
  getCurrentLocation();
});

onBeforeUnmount(() => {
  revokePreviewUrl();
  closeCrop();
});
</script>

<template>
  <section class="ugc-submit">
    <h2 class="title">{{ text.title }}</h2>
    <p class="subtitle">{{ text.subtitle }}</p>
    <p v-if="!canSubmit" class="auth-note">{{ text.authNote }}</p>

    <CellGroup inset>
      <Field v-model="form.name" :label="text.nameLabel" :placeholder="text.namePlaceholder" />
      <Field
        v-model="form.description"
        :label="text.descriptionLabel"
        type="textarea"
        rows="3"
        autosize
        :placeholder="text.descriptionPlaceholder"
      />
    </CellGroup>

    <p v-if="locationText" class="location-text">{{ locationText }}</p>

    <div class="image-upload">
      <label class="upload-card" for="ugc-image-input">
        <span class="upload-title">{{ selectedImage ? text.replaceImage : text.uploadImage }}</span>
        <span class="upload-hint">
          {{ selectedImage ? selectedImage.name : text.uploadHint }}
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
        <img :src="imagePreviewUrl" :alt="text.previewAlt" class="image-preview" />
        <div class="preview-actions">
          <Button plain type="primary" size="small" @click="openCropper">{{ text.cropButton }}</Button>
          <Button plain type="default" size="small" @click="clearSelectedImage">{{ text.removeImage }}</Button>
        </div>
      </div>
    </div>

    <Button block type="primary" :loading="submitting || locating" :disabled="!canSubmit" @click="handleSubmit">
      {{ text.submitButton }}
    </Button>

    <p v-if="submitResult" class="result">{{ submitResult }}</p>

    <div v-if="cropOpen" class="crop-mask" @pointerup="endCrop">
      <div class="crop-dialog">
        <div
          ref="cropContainerRef"
          class="crop-stage"
          @pointerdown.prevent="startCrop"
          @pointermove.prevent="updateCrop"
          @pointerleave="endCrop"
        >
          <img ref="cropImageRef" :src="cropSourceUrl" :alt="text.cropImageAlt" class="crop-image" draggable="false" />
          <div
            v-if="cropSelection.width > 0 && cropSelection.height > 0"
            class="crop-box"
            :style="{
              left: `${cropSelection.x}px`,
              top: `${cropSelection.y}px`,
              width: `${cropSelection.width}px`,
              height: `${cropSelection.height}px`,
            }"
          />
        </div>
        <p class="crop-tip">{{ text.cropTip }}</p>
        <div class="crop-actions">
          <Button plain type="default" @click="closeCrop">{{ text.cancel }}</Button>
          <Button type="primary" @click="applyCrop">{{ text.applyCrop }}</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ugc-submit {
  padding: 16px;
  background: #fff;
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
  max-height: 260px;
  object-fit: contain;
  background: #f8fafc;
  border-radius: 12px;
}

.preview-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.result {
  margin: 12px 0 0;
  font-size: 14px;
  color: #2563eb;
}

.crop-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.55);
}

.crop-dialog {
  width: min(720px, 100%);
  padding: 16px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24);
}

.crop-stage {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  background: #0f172a;
  touch-action: none;
}

.crop-image {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  user-select: none;
}

.crop-box {
  position: absolute;
  border: 2px solid #38bdf8;
  background: rgba(56, 189, 248, 0.18);
  box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.35);
}

.crop-tip {
  margin: 12px 0 0;
  font-size: 13px;
  color: #475569;
}

.crop-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}
</style>
