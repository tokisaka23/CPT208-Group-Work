import { resolveLocalized } from '../i18n/index.js';

const ugcSubmitTextSource = {
  title: {
    zh: '上传新景点',
    en: 'Upload a New Place',
    ja: '新しいスポットを投稿',
    ko: '새 장소 업로드',
  },
  subtitle: {
    zh: '页面加载后会自动获取当前位置，提交后写入 `ugc_pois`。',
    en: 'Your current location is captured after the page loads and saved to `ugc_pois` after submission.',
    ja: 'ページ読み込み後に現在地を取得し、送信後に `ugc_pois` へ保存します。',
    ko: '페이지가 로드되면 현재 위치를 가져오고 제출 후 `ugc_pois`에 저장합니다.',
  },
  authNote: {
    zh: '当前未登录，无法提交景点。',
    en: 'You are not signed in, so this place cannot be submitted.',
    ja: 'ログインしていないため、スポットを投稿できません。',
    ko: '로그인하지 않아 장소를 제출할 수 없습니다.',
  },
  nameLabel: {
    zh: '景点名',
    en: 'Place Name',
    ja: 'スポット名',
    ko: '장소명',
  },
  namePlaceholder: {
    zh: '例如：平江路小众茶馆',
    en: 'Example: A quiet teahouse on Pingjiang Road',
    ja: '例：平江路の小さな茶館',
    ko: '예: 평강로의 조용한 찻집',
  },
  descriptionLabel: {
    zh: '描述',
    en: 'Description',
    ja: '説明',
    ko: '설명',
  },
  descriptionPlaceholder: {
    zh: '请填写景点描述',
    en: 'Describe this place',
    ja: 'スポットの説明を入力してください',
    ko: '장소 설명을 입력하세요',
  },
  replaceImage: {
    zh: '更换图片',
    en: 'Replace Image',
    ja: '画像を変更',
    ko: '이미지 변경',
  },
  uploadImage: {
    zh: '上传图片',
    en: 'Upload Image',
    ja: '画像をアップロード',
    ko: '이미지 업로드',
  },
  uploadHint: {
    zh: '选择一张景点照片作为预览图（1MB以内，超过将自动压缩）',
    en: 'Choose one place photo for the preview. Keep it under 1 MB; larger images will be compressed automatically.',
    ja: 'プレビュー用のスポット写真を 1 枚選択してください。1MB を超える場合は自動圧縮します。',
    ko: '미리보기용 장소 사진 한 장을 선택하세요. 1MB를 넘으면 자동으로 압축됩니다.',
  },
  previewAlt: {
    zh: '景点预览图',
    en: 'Place preview image',
    ja: 'スポットのプレビュー画像',
    ko: '장소 미리보기 이미지',
  },
  cropImageAlt: {
    zh: '裁剪图片',
    en: 'Image to crop',
    ja: 'トリミングする画像',
    ko: '자를 이미지',
  },
  cropButton: {
    zh: '框选裁剪',
    en: 'Crop Selection',
    ja: '範囲を選んでトリミング',
    ko: '영역 선택 후 자르기',
  },
  removeImage: {
    zh: '撤回图片',
    en: 'Remove Image',
    ja: '画像を取り消す',
    ko: '이미지 제거',
  },
  submitButton: {
    zh: '提交景点',
    en: 'Submit Place',
    ja: 'スポットを投稿',
    ko: '장소 제출',
  },
  cropTip: {
    zh: '在图片上拖动鼠标框选要保留的区域。',
    en: 'Drag across the image to select the area you want to keep.',
    ja: '画像上でドラッグして残したい範囲を選択してください。',
    ko: '이미지 위에서 드래그해 남길 영역을 선택하세요.',
  },
  cancel: {
    zh: '取消',
    en: 'Cancel',
    ja: 'キャンセル',
    ko: '취소',
  },
  applyCrop: {
    zh: '应用裁剪',
    en: 'Apply Crop',
    ja: 'トリミングを適用',
    ko: '자르기 적용',
  },
  imageLoadFailed: {
    zh: '图片读取失败',
    en: 'Failed to read the image',
    ja: '画像の読み込みに失敗しました',
    ko: '이미지를 읽지 못했습니다',
  },
  browserNoCompress: {
    zh: '当前浏览器不支持图片压缩',
    en: 'This browser does not support image compression',
    ja: 'このブラウザは画像圧縮に対応していません',
    ko: '현재 브라우저는 이미지 압축을 지원하지 않습니다',
  },
  compressFailed: {
    zh: '图片压缩失败',
    en: 'Image compression failed',
    ja: '画像の圧縮に失敗しました',
    ko: '이미지 압축에 실패했습니다',
  },
  selectImageFirst: {
    zh: '请先选择图片',
    en: 'Choose an image first',
    ja: '先に画像を選択してください',
    ko: '먼저 이미지를 선택하세요',
  },
  selectCropArea: {
    zh: '请先框选裁剪范围',
    en: 'Select a crop area first',
    ja: '先にトリミング範囲を選択してください',
    ko: '먼저 자를 영역을 선택하세요',
  },
  browserNoCrop: {
    zh: '当前浏览器不支持图片裁剪',
    en: 'This browser does not support image cropping',
    ja: 'このブラウザは画像トリミングに対応していません',
    ko: '현재 브라우저는 이미지 자르기를 지원하지 않습니다',
  },
  cropFailed: {
    zh: '裁剪失败，请重试',
    en: 'Cropping failed. Please try again.',
    ja: 'トリミングに失敗しました。もう一度お試しください。',
    ko: '자르기에 실패했습니다. 다시 시도하세요.',
  },
  croppedTooLarge: {
    zh: '裁剪后的图片仍超过 1MB，请重新框选',
    en: 'The cropped image is still over 1 MB. Please select a smaller area.',
    ja: 'トリミング後の画像がまだ 1MB を超えています。範囲を選び直してください。',
    ko: '자른 이미지가 여전히 1MB를 초과합니다. 영역을 다시 선택하세요.',
  },
  cropApplied: {
    zh: '已应用裁剪',
    en: 'Crop applied',
    ja: 'トリミングを適用しました',
    ko: '자르기가 적용되었습니다',
  },
  chooseImageFile: {
    zh: '请选择图片文件',
    en: 'Choose an image file',
    ja: '画像ファイルを選択してください',
    ko: '이미지 파일을 선택하세요',
  },
  compressed: {
    zh: '图片已自动压缩',
    en: 'Image compressed automatically',
    ja: '画像を自動圧縮しました',
    ko: '이미지가 자동으로 압축되었습니다',
  },
  compressedStillTooLarge: {
    zh: '图片压缩后仍超过 1MB，请换一张图片',
    en: 'The image is still over 1 MB after compression. Choose another image.',
    ja: '圧縮後も画像が 1MB を超えています。別の画像を選択してください。',
    ko: '압축 후에도 이미지가 1MB를 초과합니다. 다른 이미지를 선택하세요.',
  },
  geolocationUnsupported: {
    zh: '当前浏览器不支持定位',
    en: 'This browser does not support geolocation',
    ja: 'このブラウザは位置情報に対応していません',
    ko: '현재 브라우저는 위치 정보를 지원하지 않습니다',
  },
  locating: {
    zh: '正在获取当前位置...',
    en: 'Getting your current location...',
    ja: '現在地を取得しています...',
    ko: '현재 위치를 가져오는 중...',
  },
  locationSuccess: {
    zh: '定位成功',
    en: 'Location found',
    ja: '位置情報を取得しました',
    ko: '위치 확인 완료',
  },
  locationFailedPermission: {
    zh: '定位失败，请检查浏览器位置权限',
    en: 'Location failed. Please check your browser location permission.',
    ja: '位置情報の取得に失敗しました。ブラウザの位置情報権限を確認してください。',
    ko: '위치 확인에 실패했습니다. 브라우저 위치 권한을 확인하세요.',
  },
  locationDenied: {
    zh: '你拒绝了位置权限',
    en: 'You denied location permission',
    ja: '位置情報の許可が拒否されました',
    ko: '위치 권한을 거부했습니다',
  },
  locationUnavailable: {
    zh: '暂时无法获取你的位置',
    en: 'Your location is temporarily unavailable',
    ja: '現在地を一時的に取得できません',
    ko: '현재 위치를 일시적으로 가져올 수 없습니다',
  },
  locationTimeout: {
    zh: '定位超时，请重试',
    en: 'Location timed out. Please try again.',
    ja: '位置情報の取得がタイムアウトしました。もう一度お試しください。',
    ko: '위치 확인 시간이 초과되었습니다. 다시 시도하세요.',
  },
  locationFailed: {
    zh: '定位失败',
    en: 'Location failed',
    ja: '位置情報の取得に失敗しました',
    ko: '위치 확인 실패',
  },
  supabaseMissing: {
    zh: '未检测到 Supabase 配置，请检查 .env.local',
    en: 'Supabase configuration was not found. Check .env.local.',
    ja: 'Supabase 設定が見つかりません。.env.local を確認してください。',
    ko: 'Supabase 설정을 찾을 수 없습니다. .env.local을 확인하세요.',
  },
  loginRequired: {
    zh: '请先登录后再上传',
    en: 'Please sign in before uploading',
    ja: 'アップロード前にログインしてください',
    ko: '업로드하기 전에 로그인하세요',
  },
  nameRequired: {
    zh: '请输入景点名称',
    en: 'Enter the place name',
    ja: 'スポット名を入力してください',
    ko: '장소명을 입력하세요',
  },
  descriptionRequired: {
    zh: '请输入景点描述',
    en: 'Enter the place description',
    ja: 'スポットの説明を入力してください',
    ko: '장소 설명을 입력하세요',
  },
  imageRequired: {
    zh: '请上传景点图片',
    en: 'Upload a place image',
    ja: 'スポット画像をアップロードしてください',
    ko: '장소 이미지를 업로드하세요',
  },
  waitingLocation: {
    zh: '正在等待定位结果',
    en: 'Waiting for the location result',
    ja: '位置情報の結果を待っています',
    ko: '위치 결과를 기다리는 중입니다',
  },
  invalidLocation: {
    zh: '定位结果无效，请刷新重试',
    en: 'The location result is invalid. Refresh and try again.',
    ja: '位置情報の結果が無効です。更新してもう一度お試しください。',
    ko: '위치 결과가 올바르지 않습니다. 새로고침 후 다시 시도하세요.',
  },
  uploadFailedResult: {
    zh: '图片上传失败: {message}',
    en: 'Image upload failed: {message}',
    ja: '画像アップロードに失敗しました: {message}',
    ko: '이미지 업로드 실패: {message}',
  },
  uploadFailed: {
    zh: '图片上传失败',
    en: 'Image upload failed',
    ja: '画像アップロードに失敗しました',
    ko: '이미지 업로드 실패',
  },
  submitFailedResult: {
    zh: '提交失败: {message}',
    en: 'Submission failed: {message}',
    ja: '送信に失敗しました: {message}',
    ko: '제출 실패: {message}',
  },
  submitFailed: {
    zh: '提交失败',
    en: 'Submission failed',
    ja: '送信に失敗しました',
    ko: '제출 실패',
  },
  submitSuccessResult: {
    zh: '提交成功: {name}',
    en: 'Submitted: {name}',
    ja: '送信しました: {name}',
    ko: '제출 완료: {name}',
  },
  submitSuccess: {
    zh: '提交成功',
    en: 'Submitted successfully',
    ja: '送信しました',
    ko: '제출 완료',
  },
};

export function getUgcSubmitText(language) {
  return resolveLocalized(ugcSubmitTextSource, language);
}

export function formatUgcSubmitMessage(template, values = {}) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value ?? '')),
    template,
  );
}
