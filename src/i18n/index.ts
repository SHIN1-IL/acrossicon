import {
  ColorTheme,
  Locale,
  LogoLayout,
  LogoShape,
} from '@/types';

type Dict = Record<string, string>;

const ko: Dict = {
  'app.subtitle': '로고 · 상품 · 홈 이미지',
  'header.settings': '설정',
  'header.language': '언어',

  'mode.logo': '로고',
  'mode.product': '상품 배너',
  'mode.home': '홈/배너',

  'form.apiMissing': 'API Key가 아직 등록되지 않았습니다.',
  'form.apiMissingLink': '설정',
  'form.apiMissingSuffix': '에서 OpenAI 또는 Google API Key를 입력해 주세요.',
  'form.brand': '브랜드 / 서비스명',
  'form.brandPlaceholder': '예: AcrossIcon (입력 시 이미지에 반영)',
  'form.layout': '구성',
  'form.shape': '형태',
  'form.shapeSizeHint': '형태에 맞춰 해상도를 {size}로 맞춰 두었습니다. (설정에서 변경 가능)',
  'form.keywords': '스타일 키워드',
  'form.requirements': '요구사항 프롬프트',
  'form.requirementsPlaceholder':
    '예: 원형 배지, 남색 배경, 빛 번짐 없이, 아이콘은 단순 기하학…',
  'form.requirementsHint': '입력한 요구사항은 생성 프롬프트에 반드시 반영됩니다.',
  'form.colorTheme': '컬러 테마',
  'form.customColor': '커스텀 컬러 설명',
  'form.customColorPlaceholder': '예: 인디고 + 소프트 코랄 포인트',
  'form.variation': '프롬프트 변형',
  'form.variationHint': '후보마다 구도·형태를 살짝 다르게 생성',
  'form.promptPreview': '합성 프롬프트 미리보기',
  'form.promptVariants': '({n}개 변형)',
  'form.generate': '생성하기',
  'form.generateLogo': '로고 생성',
  'form.generateProduct': '상품 배너 생성',
  'form.generateHome': '홈 이미지 생성',
  'form.generating': '생성 중…',
  'form.costHint': '예상 비용 {cost} · 생성 전 확인',
  'form.variationOn': ' · 변형 ON',
  'form.count': '생성 개수',
  'form.countUnit': '{n}장',
  'form.size': '해상도',
  'size.1024x1024': '1024²',
  'size.1024x1536': '1024×1536',
  'size.1536x1024': '1536×1024',
  'size.2048x1152': '2048×1152',
  'form.googleSizeHint': 'Google Imagen은 선택한 비율에 가깝게 생성됩니다.',
  'form.wideHeroHint': '와이드 히어로는 OpenAI gpt-image-2를 사용합니다.',

  'form.productName': '상품명',
  'form.productNamePlaceholder': '예: Pro Plan (입력 시 이미지에 반영)',
  'form.productHeadline': '한 줄 카피',
  'form.productHeadlinePlaceholder': '예: 지금 바로 시작하세요 (입력 시 이미지에 반영)',
  'form.productPoints': '강조 포인트',
  'form.productPointsPlaceholder': '예: 무료 체험, 빠른 설정 (입력 시 이미지에 반영)',

  'form.homeSource': '시작 방식',
  'form.homeSourceGenerate': '새로 생성',
  'form.homeSourceUpload': '이미지로 수정',
  'form.imageSource': '시작 방식',
  'form.imageSourceGenerate': '새로 생성',
  'form.imageSourceUpload': '이미지로 수정',
  'form.homeTitle': '히어로 제목 (선택)',
  'form.homeTitlePlaceholder': '예: 비즈니스를 더 빠르게',
  'form.homeSubtitle': '보조 문구 (선택)',
  'form.homeSubtitlePlaceholder': '예: 5분 만에 시작하는 AI 워크플로',
  'form.textPlacement': '문구 위치',
  'placement.left': '왼쪽',
  'placement.right': '오른쪽',
  'placement.center': '중앙',
  'placement.none': '자동(최적)',
  'form.reinterpret': '재해석 강도',
  'reinterpret.light': '약하게',
  'reinterpret.medium': '보통',
  'reinterpret.strong': '강하게',
  'form.upload': '참고 이미지 업로드',
  'form.uploadHint':
    '첨부한 이미지를 참고해 수정·재해석합니다. 라이선스가 허용된 이미지만 사용하세요.',
  'form.licenseConfirm': '상업적 이용·개작이 허용된 무료/라이선스 이미지임을 확인합니다.',
  'form.uploadSelected': '선택됨: {name}',
  'form.uploadClear': '제거',
  'form.openaiOnlyUpload': '이미지로 수정은 OpenAI Provider에서만 지원됩니다.',

  'layout.icon': '로고만',
  'layout.iconHint': '아이콘/심볼만',
  'layout.icon_text': '로고+글씨',
  'layout.icon_textHint': '심볼과 브랜드명',
  'layout.wordmark': '글씨만',
  'layout.wordmarkHint': '워드마크 중심',

  'shape.square': '정사각',
  'shape.squareHint': '앱 아이콘형',
  'shape.circle': '원형',
  'shape.circleHint': '원형 배지',
  'shape.horizontal': '가로형',
  'shape.horizontalHint': '와이드 로고',
  'shape.vertical': '세로형',
  'shape.verticalHint': '스택 배치',
  'shape.hexagon': '육각형',
  'shape.hexagonHint': '기하학 크레스트',
  'shape.free': '자유형',
  'shape.freeHint': '형태 제한 없음',

  'tag.Fintech': '핀테크',
  'tag.Minimalist': '미니멀',
  'tag.Geometric': '기하학',
  'tag.SaaS': 'SaaS',
  'tag.Developer Tool': '개발자 도구',
  'tag.AI': 'AI',
  'tag.Startup': '스타트업',
  'tag.Luxury': '럭셔리',

  'theme.Monochrome': '모노크롬',
  'theme.Neon Accent': '네온 액센트',
  'theme.Ocean Blue': '오션 블루',
  'theme.Earth Tone': '어스 톤',
  'theme.Custom': '커스텀',

  'gallery.results': '이번 결과',
  'gallery.history': '히스토리',
  'gallery.clearAll': '전체 삭제',
  'gallery.emptyResults': '아직 생성된 이미지가 없습니다',
  'gallery.emptyResultsHint': '모드를 고르고 생성해 보세요.',
  'gallery.emptyHistory': '저장된 히스토리가 없습니다',
  'gallery.emptyHistoryHint': '생성한 이미지는 자동으로 히스토리에 저장됩니다.',

  'settings.title': '설정',
  'settings.language': '언어',
  'settings.provider': 'AI 제공자',
  'settings.apiKey': 'API Key',
  'settings.saved': '저장됨',
  'settings.keyHint':
    'Key는 브라우저 로컬(chrome.storage.local)에만 저장되며 외부로 전송되지 않습니다.',
  'settings.licenseKey': '라이선스 키',
  'settings.licenseKeyPlaceholder': 'XXXX-XXXX-XXXX',
  'settings.licenseHint':
    '운영자가 발급한 키를 입력하세요. 스탠다드 일10/월60 · 프리미엄 일20/월120.',
  'settings.apiBaseUrl': '라이선스 서버 URL',
  'settings.apiBaseUrlHint':
    '비우면 https://acrossicon.onrender.com 을 사용합니다. 로컬 백엔드면 http://127.0.0.1:8000',
  'settings.count': '생성 개수',
  'settings.countUnit': '{n}장',
  'settings.size': '해상도',
  'settings.sizeSquare': '1024 × 1024 (정사각)',
  'settings.sizePortrait': '1024 × 1536 (세로)',
  'settings.sizeLandscape': '1536 × 1024 (가로)',
  'settings.sizeWideHero': '2048 × 1152 (와이드 히어로 16:9)',
  'settings.googleSizeHint': 'Google Imagen은 선택한 비율에 가깝게 생성됩니다.',
  'settings.wideHeroHint': '와이드 히어로는 OpenAI gpt-image-2를 사용합니다.',
  'settings.variation': '프롬프트 변형',
  'settings.variationHint':
    '여러 장 생성 시 후보마다 구도·형태 지시문을 다르게 넣어 다양성을 높입니다.',
  'settings.save': '저장',
  'settings.saving': '저장 중…',
  'settings.savedToast': '설정이 저장되었습니다.',

  'confirm.title': '생성 비용 확인',
  'confirm.body': '{title} 이미지 {count}장을 생성합니다. API 제공자 요금이 계정에 청구될 수 있습니다.',
  'confirm.cost': '예상 비용',
  'confirm.variation': '프롬프트 변형',
  'confirm.variationOn': 'ON (후보별 구도 다양화)',
  'confirm.variationOff': 'OFF (동일 프롬프트)',
  'confirm.cancel': '취소',
  'confirm.confirm': '생성하기',
  'confirm.starting': '시작 중…',

  'toast.apiKeyHint': 'API Key를 설정하면 바로 이미지를 생성할 수 있습니다.',
  'toast.needBrand': '브랜드/서비스명을 입력해 주세요.',
  'toast.needProduct': '상품명을 입력해 주세요.',
  'toast.needUpload': '무료 이미지를 업로드해 주세요.',
  'toast.needLicense': '무료/라이선스 허용 이미지임을 확인해 주세요.',
  'toast.needLicenseKey': '라이선스 키를 설정에서 등록해 주세요.',
  'toast.needKey': 'API Key가 등록되지 않았습니다. 설정에서 Key를 입력해 주세요.',
  'toast.needOpenAI': '업로드 변환은 OpenAI Provider가 필요합니다.',
  'toast.licenseOk': '{plan} 등록됨 · {quota}',
  'toast.licenseFail': '라이선스를 확인할 수 없습니다.',
  'toast.quotaConsumeFail': '생성은 됐지만 한도 차감에 실패했습니다. 관리자에게 문의하세요.',
  'toast.partial':
    '{succeeded}/{requested}장 생성됨. 실패한 {failed}장은 건너뛰었습니다.',
  'toast.success': '{n}개의 이미지가 생성되었습니다.',
  'toast.historyFail': '히스토리 저장에 실패했습니다. 이번 결과만 표시합니다.',
  'toast.historyDeleted': '히스토리에서 삭제했습니다.',
  'toast.historyCleared': '히스토리를 모두 삭제했습니다.',
  'toast.unknown': '알 수 없는 오류가 발생했습니다.',
};

const en: Dict = {
  'app.subtitle': 'Logo · Product · Home images',
  'header.settings': 'Settings',
  'header.language': 'Language',

  'mode.logo': 'Logo',
  'mode.product': 'Product',
  'mode.home': 'Home/Banner',

  'form.apiMissing': 'API key is not registered yet.',
  'form.apiMissingLink': 'Settings',
  'form.apiMissingSuffix': '— add your OpenAI or Google API key there.',
  'form.brand': 'Brand / service name',
  'form.brandPlaceholder': 'e.g. AcrossIcon (shown in the image when filled)',
  'form.layout': 'Composition',
  'form.shape': 'Shape',
  'form.shapeSizeHint':
    'Canvas size set to {size} to match the shape. (Change anytime in Settings)',
  'form.keywords': 'Style keywords',
  'form.requirements': 'Requirements prompt',
  'form.requirementsPlaceholder':
    'e.g. circular badge, navy background, no glow, simple geometry…',
  'form.requirementsHint': 'These requirements are always included in the generation prompt.',
  'form.colorTheme': 'Color theme',
  'form.customColor': 'Custom color description',
  'form.customColorPlaceholder': 'e.g. indigo + soft coral accents',
  'form.variation': 'Prompt variation',
  'form.variationHint': 'Slightly different composition per candidate',
  'form.promptPreview': 'Prompt preview',
  'form.promptVariants': '({n} variants)',
  'form.generate': 'Generate',
  'form.generateLogo': 'Generate logo',
  'form.generateProduct': 'Generate product banner',
  'form.generateHome': 'Generate home image',
  'form.generating': 'Generating…',
  'form.costHint': 'Est. {cost} · confirm before generate',
  'form.variationOn': ' · variation ON',
  'form.count': 'Image count',
  'form.countUnit': '{n}',
  'form.size': 'Resolution',
  'size.1024x1024': '1024²',
  'size.1024x1536': '1024×1536',
  'size.1536x1024': '1536×1024',
  'size.2048x1152': '2048×1152',
  'form.googleSizeHint': 'Google Imagen follows the selected aspect ratio when possible.',
  'form.wideHeroHint': 'Wide hero uses OpenAI gpt-image-2.',

  'form.productName': 'Product name',
  'form.productNamePlaceholder': 'e.g. Pro Plan (shown in the image when filled)',
  'form.productHeadline': 'Headline',
  'form.productHeadlinePlaceholder': 'e.g. Start in minutes (shown in the image when filled)',
  'form.productPoints': 'Key points',
  'form.productPointsPlaceholder': 'e.g. Free trial, Fast setup (shown in the image when filled)',

  'form.homeSource': 'Start from',
  'form.homeSourceGenerate': 'Generate new',
  'form.homeSourceUpload': 'Edit from image',
  'form.imageSource': 'Start from',
  'form.imageSourceGenerate': 'Generate new',
  'form.imageSourceUpload': 'Edit from image',
  'form.homeTitle': 'Hero title (optional)',
  'form.homeTitlePlaceholder': 'e.g. Move faster',
  'form.homeSubtitle': 'Subtitle (optional)',
  'form.homeSubtitlePlaceholder': 'e.g. AI workflows in 5 minutes',
  'form.textPlacement': 'Copy placement',
  'placement.left': 'Left',
  'placement.right': 'Right',
  'placement.center': 'Center',
  'placement.none': 'Auto (best)',
  'form.reinterpret': 'Reinterpret strength',
  'reinterpret.light': 'Light',
  'reinterpret.medium': 'Medium',
  'reinterpret.strong': 'Strong',
  'form.upload': 'Upload reference image',
  'form.uploadHint':
    'Edit and reinterpret from the attached image. Use only license-permitted images.',
  'form.licenseConfirm': 'I confirm this image is free/licensed for commercial use and modification.',
  'form.uploadSelected': 'Selected: {name}',
  'form.uploadClear': 'Remove',
  'form.openaiOnlyUpload': 'Edit from image requires the OpenAI provider.',

  'layout.icon': 'Icon only',
  'layout.iconHint': 'Symbol mark only',
  'layout.icon_text': 'Icon + text',
  'layout.icon_textHint': 'Symbol with brand name',
  'layout.wordmark': 'Wordmark',
  'layout.wordmarkHint': 'Typography-first',

  'shape.square': 'Square',
  'shape.squareHint': 'App icon style',
  'shape.circle': 'Circle',
  'shape.circleHint': 'Round badge',
  'shape.horizontal': 'Horizontal',
  'shape.horizontalHint': 'Wide lockup',
  'shape.vertical': 'Vertical',
  'shape.verticalHint': 'Stacked layout',
  'shape.hexagon': 'Hexagon',
  'shape.hexagonHint': 'Geometric crest',
  'shape.free': 'Freeform',
  'shape.freeHint': 'No outer shape',

  'tag.Fintech': 'Fintech',
  'tag.Minimalist': 'Minimalist',
  'tag.Geometric': 'Geometric',
  'tag.SaaS': 'SaaS',
  'tag.Developer Tool': 'Developer Tool',
  'tag.AI': 'AI',
  'tag.Startup': 'Startup',
  'tag.Luxury': 'Luxury',

  'theme.Monochrome': 'Monochrome',
  'theme.Neon Accent': 'Neon Accent',
  'theme.Ocean Blue': 'Ocean Blue',
  'theme.Earth Tone': 'Earth Tone',
  'theme.Custom': 'Custom',

  'gallery.results': 'Results',
  'gallery.history': 'History',
  'gallery.clearAll': 'Clear all',
  'gallery.emptyResults': 'No images generated yet',
  'gallery.emptyResultsHint': 'Pick a mode and generate.',
  'gallery.emptyHistory': 'No saved history',
  'gallery.emptyHistoryHint': 'Generated images are saved to history automatically.',

  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.provider': 'AI provider',
  'settings.apiKey': 'API Key',
  'settings.saved': 'Saved',
  'settings.keyHint':
    'Keys are stored only in local browser storage (chrome.storage.local) and never sent to our servers.',
  'settings.licenseKey': 'License key',
  'settings.licenseKeyPlaceholder': 'XXXX-XXXX-XXXX',
  'settings.licenseHint':
    'Enter the key from your operator. Standard 10/day · 60/mo · Premium 20/day · 120/mo.',
  'settings.apiBaseUrl': 'License server URL',
  'settings.apiBaseUrlHint':
    'Defaults to https://acrossicon.onrender.com. Use http://127.0.0.1:8000 for local backend.',
  'settings.count': 'Image count',
  'settings.countUnit': '{n}',
  'settings.size': 'Resolution',
  'settings.sizeSquare': '1024 × 1024 (square)',
  'settings.sizePortrait': '1024 × 1536 (portrait)',
  'settings.sizeLandscape': '1536 × 1024 (landscape)',
  'settings.sizeWideHero': '2048 × 1152 (wide hero 16:9)',
  'settings.googleSizeHint': 'Google Imagen follows the selected aspect ratio when possible.',
  'settings.wideHeroHint': 'Wide hero uses OpenAI gpt-image-2.',
  'settings.variation': 'Prompt variation',
  'settings.variationHint':
    'When generating multiple images, vary composition directives for diversity.',
  'settings.save': 'Save',
  'settings.saving': 'Saving…',
  'settings.savedToast': 'Settings saved.',

  'confirm.title': 'Confirm generation cost',
  'confirm.body':
    'Generate {count} image(s) for {title}. Your API provider may charge your account.',
  'confirm.cost': 'Estimated cost',
  'confirm.variation': 'Prompt variation',
  'confirm.variationOn': 'ON (diverse compositions)',
  'confirm.variationOff': 'OFF (same prompt)',
  'confirm.cancel': 'Cancel',
  'confirm.confirm': 'Generate',
  'confirm.starting': 'Starting…',

  'toast.apiKeyHint': 'Add an API key to start generating images.',
  'toast.needBrand': 'Please enter a brand / service name.',
  'toast.needProduct': 'Please enter a product name.',
  'toast.needUpload': 'Please upload a free-license image.',
  'toast.needLicense': 'Please confirm the image license.',
  'toast.needLicenseKey': 'Register your license key in Settings.',
  'toast.needKey': 'API key is missing. Add it in Settings.',
  'toast.needOpenAI': 'Upload transform requires the OpenAI provider.',
  'toast.licenseOk': '{plan} active · {quota}',
  'toast.licenseFail': 'Could not verify the license.',
  'toast.quotaConsumeFail':
    'Images were generated, but quota deduct failed. Contact support.',
  'toast.partial':
    'Generated {succeeded}/{requested}. Skipped {failed} failed image(s).',
  'toast.success': 'Generated {n} image(s).',
  'toast.historyFail': 'Could not save history. Showing this batch only.',
  'toast.historyDeleted': 'Removed from history.',
  'toast.historyCleared': 'History cleared.',
  'toast.unknown': 'An unknown error occurred.',
};

const dictionaries: Record<Locale, Dict> = { ko, en };

export function t(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const template = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    template,
  );
}

export function styleTagLabel(locale: Locale, tag: string): string {
  return t(locale, `tag.${tag}`);
}

export function colorThemeLabel(locale: Locale, theme: ColorTheme): string {
  return t(locale, `theme.${theme}`);
}

export function layoutLabel(locale: Locale, layout: LogoLayout): {
  label: string;
  hint: string;
} {
  return {
    label: t(locale, `layout.${layout}`),
    hint: t(locale, `layout.${layout}Hint`),
  };
}

export function shapeLabel(locale: Locale, shape: LogoShape): {
  label: string;
  hint: string;
} {
  return {
    label: t(locale, `shape.${shape}`),
    hint: t(locale, `shape.${shape}Hint`),
  };
}
