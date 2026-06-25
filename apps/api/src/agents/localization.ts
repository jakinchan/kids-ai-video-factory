export type SupportedLanguage = "ja" | "zh" | "en";

export function normalizeLanguage(language?: string): SupportedLanguage {
  if (language === "ja" || language === "zh" || language === "en") return language;
  return "en";
}

const localized = {
  en: {
    planSteps: [
      "Parse natural-language request",
      "Create child-safe content ideas",
      "Create content jobs",
      "Generate scripts",
      "Generate storyboard and narration metadata",
      "Run mock video/audio/subtitle pipeline",
      "Review child-safety notes",
      "Export bundle",
      "Prepare publish suggestions for human review"
    ],
    lesson: {
      educational: "learn one small concept through repetition",
      gentle: "practice kindness and calm curiosity"
    },
    visualStyle: "soft 2D storybook, warm lighting, simple shapes",
    voiceStyle: {
      song: "warm singing narrator",
      default: "warm_narrator"
    },
    safetyNotes: [
      "Draft generation only; publishing stays manual.",
      "Mock pipeline outputs scripts, storyboard, narration, subtitles, metadata, and review files.",
      "Generated scenes avoid fear, shame, dangerous imitation, personal data, and medical claims."
    ],
    script: {
      visual1: (theme: string) => `A gentle opening shot introducing ${theme}.`,
      narration1: (title: string) => `Hello little friend. Today we meet ${title}.`,
      visual2: "A simple moment of curiosity and a kind choice.",
      narration2: "We look, we listen, and we choose the safe and kind way.",
      visual3: "A warm ending with a small repeatable lesson.",
      narration3: "Great job. Let's remember this happy little lesson together."
    },
    safetyDraft: "Draft bundle only. Human approval is required before platform upload.",
    manifestNote: "Mock bundle ready for human review.",
    publish: {
      titles: (title: string) => [`${title} | Gentle Story for Kids`, `${title} - A Calm Learning Short`, `Little Lesson: ${title}`],
      description: "A gentle, child-safe short video draft. Please review narration, visuals, and subtitles before publishing.",
      hashtags: ["#KidsStory", "#ChildSafe", "#GentleLearning"],
      thumbnail: "Bright character close-up with one simple object from the story."
    }
  },
  ja: {
    planSteps: [
      "自然言語の依頼を解析",
      "子ども向け安全基準に沿った企画を作成",
      "コンテンツジョブを作成",
      "台本を生成",
      "絵コンテとナレーション情報を生成",
      "モックの動画・音声・字幕パイプラインを実行",
      "子ども安全レビューを実施",
      "成果物バンドルを書き出し",
      "人間レビュー用の公開提案を作成"
    ],
    lesson: {
      educational: "くり返しを通じて小さな概念を学ぶ",
      gentle: "やさしさと落ち着いた好奇心を育てる"
    },
    visualStyle: "やわらかい2D絵本風、暖かい光、シンプルな形",
    voiceStyle: {
      song: "やさしい歌のおねえさん風ナレーター",
      default: "やさしいナレーター"
    },
    safetyNotes: [
      "生成はドラフトのみで、公開は必ず手動確認にします。",
      "モックパイプラインは台本、絵コンテ、ナレーション、字幕、メタデータ、レビュー文書を出力します。",
      "怖がらせる表現、羞恥、危険なまね、個人情報、医療的主張を避けます。"
    ],
    script: {
      visual1: (theme: string) => `${theme}をやさしく紹介するオープニング。`,
      narration1: (title: string) => `こんにちは。今日は「${title}」のお話だよ。`,
      visual2: "小さな発見と、やさしい選択の場面。",
      narration2: "よく見て、よく聞いて、安全でやさしい方を選ぼうね。",
      visual3: "くり返し思い出せる小さな学びで終わる暖かい場面。",
      narration3: "よくできました。この楽しい学びを一緒に覚えておこうね。"
    },
    safetyDraft: "ドラフト用バンドルです。プラットフォームへ公開する前に人間の確認が必要です。",
    manifestNote: "モックバンドルは人間レビュー待ちです。",
    publish: {
      titles: (title: string) => [`${title} | 子ども向けやさしいお話`, `${title} - 落ち着いて学べる短編`, `小さな学び: ${title}`],
      description: "子ども向けの安全な短編動画ドラフトです。公開前にナレーション、映像、字幕を確認してください。",
      hashtags: ["#子ども向け", "#安全な学び", "#やさしいお話"],
      thumbnail: "物語のキーアイテムと明るいキャラクターのアップ。"
    }
  },
  zh: {
    planSteps: [
      "解析自然语言需求",
      "创建适合儿童且安全的内容创意",
      "创建内容任务",
      "生成脚本",
      "生成分镜和旁白元数据",
      "运行模拟视频、音频和字幕流程",
      "审核儿童安全注意事项",
      "导出成品包",
      "准备给人工审核的发布建议"
    ],
    lesson: {
      educational: "通过重复学习一个小概念",
      gentle: "练习善良和温和的好奇心"
    },
    visualStyle: "柔和2D绘本风，温暖光线，简单形状",
    voiceStyle: {
      song: "温柔歌唱旁白",
      default: "温柔旁白"
    },
    safetyNotes: [
      "仅生成草稿，发布必须人工操作。",
      "模拟流程会输出脚本、分镜、旁白、字幕、元数据和审核文件。",
      "画面避免恐吓、羞辱、危险模仿、个人信息和医疗承诺。"
    ],
    script: {
      visual1: (theme: string) => `温柔介绍${theme}主题的开场画面。`,
      narration1: (title: string) => `小朋友你好。今天我们来看《${title}》。`,
      visual2: "一个简单的好奇时刻，以及一个善良的选择。",
      narration2: "我们认真看，认真听，选择安全又友善的做法。",
      visual3: "用一个容易记住的小道理温暖收尾。",
      narration3: "你做得真棒。让我们一起记住这个开心的小道理。"
    },
    safetyDraft: "这只是草稿包。上传到平台前必须人工审核。",
    manifestNote: "模拟成品包已准备好，等待人工审核。",
    publish: {
      titles: (title: string) => [`${title} | 儿童温柔故事`, `${title} - 安静学习短片`, `小小道理: ${title}`],
      description: "这是一条适合儿童的安全短视频草稿。发布前请检查旁白、画面和字幕。",
      hashtags: ["#儿童故事", "#儿童安全", "#温柔学习"],
      thumbnail: "明亮的角色特写，加上故事中的一个简单物件。"
    }
  }
} as const;

export function t(language?: string) {
  return localized[normalizeLanguage(language)];
}
