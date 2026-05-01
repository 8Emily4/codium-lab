export const company = {
  nameKo: "코디움랩",
  nameEn: "Codium Lab",
  foundedYear: 2026,
  location: "경기도 광명시",
  ceo: "임나리",
  rdFields: ["AI 자동화 도구"],
  tagline: "기술의 본질을 연구하고 가치를 구현하는 프리미엄 IT 솔루션 연구소",
  description:
    "코디움랩은 LLM과 자동화의 경계에서 실제로 동작하는 도구를 연구합니다. 데모로 끝나지 않는 솔루션, 사람의 일을 한 단계 위로 올려놓는 기술을 만듭니다.",
  contactEmail: "narimagic@naver.com",
  philosophy: [
    {
      title: "본질에서 출발합니다",
      body: "화려한 프레임워크보다 문제의 결을 먼저 읽습니다. 깊이 들여다본 만큼 단단한 솔루션이 만들어집니다.",
    },
    {
      title: "도구가 사람을 끌어올립니다",
      body: "AI는 사람을 대체하는 자리가 아니라, 한 사람의 역량을 한 단계 위로 올려놓는 자리에 둡니다.",
    },
    {
      title: "일상까지 닿아야 가치입니다",
      body: "연구실 안에 머무는 기술은 가치를 만들지 못합니다. 결과를 일상의 손끝까지 옮겨 놓는 일까지 책임집니다.",
    },
  ],
  stats: [
    { label: "R&D 분야", value: "AI 자동화" },
    { label: "운영 브랜드", value: "2개" },
    { label: "설립", value: "2026" },
    { label: "본거지", value: "경기 광명" },
  ],
  services: [
    {
      title: "AI 자동화 컨설팅",
      summary: "워크플로 진단 → 자동화 설계 → 운영 이관까지",
      body: "반복 업무의 결을 분석해 LLM·RPA·스크립트가 제일 잘 맞는 위치를 찾아냅니다. PoC가 아니라 운영까지 가는 자동화를 설계합니다.",
      tag: "Consulting",
    },
    {
      title: "맞춤형 LLM 도구 개발",
      summary: "조직의 데이터에 맞춘 전용 어시스턴트",
      body: "사내 문서·매뉴얼·고객 응대 데이터를 기반으로 한 검색·요약·생성 도구를 설계하고, 보안 정책에 맞춰 배포합니다.",
      tag: "Engineering",
    },
    {
      title: "AI 리터러시 교육",
      summary: "조직과 개인을 위한 실전 교육 프로그램",
      body: "에이디움 브랜드를 통해 실무에 바로 적용 가능한 AI 활용 교육을 제공합니다. 임원진 워크샵부터 실무자 핸즈온까지.",
      tag: "Education",
    },
    {
      title: "디지털 굿즈 협업",
      summary: "AI 디자인을 일상의 물건으로",
      body: "베이디움 브랜드가 AI 디자인을 굿즈·콘텐츠로 전환합니다. 브랜드·캠페인 단위 협업이 가능합니다.",
      tag: "Studio",
    },
  ],
  process: [
    {
      step: "01",
      title: "발견",
      body: "현장 인터뷰와 데이터 흐름 관찰부터 시작합니다. 문제를 다시 정의하는 단계입니다.",
    },
    {
      step: "02",
      title: "설계",
      body: "사용자, 모델, 데이터, 운영 비용을 한 그림 위에 올려 놓고 가장 단순한 해결을 그립니다.",
    },
    {
      step: "03",
      title: "구현",
      body: "프로토타입이 아닌 운영 가능한 코드. 모니터링과 롤백 시나리오까지 함께 만듭니다.",
    },
    {
      step: "04",
      title: "이관",
      body: "조직이 스스로 운영할 수 있도록 문서·교육·관리 도구를 같이 넘깁니다. 의존성을 남기지 않습니다.",
    },
  ],
  faq: [
    {
      q: "어떤 규모의 회사와 협업하시나요?",
      a: "스타트업부터 중견기업까지 모두 가능합니다. 다만 '문제 정의가 분명한가, 의사결정자가 참여 가능한가'가 협업 성공의 더 중요한 변수라고 봅니다.",
    },
    {
      q: "PoC만 짧게 진행할 수도 있나요?",
      a: "가능합니다. 보통 2–4주 단위의 디스커버리 + PoC 패키지를 먼저 제안드립니다. 이 단계에서 '이 자동화가 정말 필요한지'를 함께 판단합니다.",
    },
    {
      q: "보안·데이터 정책이 까다로운 환경도 가능한가요?",
      a: "네. 사내 폐쇄망, 온프레미스 LLM, VPC 격리 등 환경에 맞춰 구성합니다. 협업 전에 보안 검토 체크리스트를 함께 작성합니다.",
    },
    {
      q: "교육과 컨설팅 중 무엇부터 시작하면 좋을까요?",
      a: "조직의 AI 활용도가 낮다면 에이디움의 리터러시 교육을, 자동화할 워크플로가 명확하다면 컨설팅을 먼저 권합니다. 무료 진단 미팅에서 함께 정해드립니다.",
    },
    {
      q: "원격 협업도 가능한가요?",
      a: "기본이 원격 협업입니다. 광명 본사에서의 워크샵·인터뷰는 필요한 단계에 한해 오프라인으로 진행합니다.",
    },
  ],
} as const;

export type SubBrand = {
  slug: string;
  nameKo: string;
  nameEn: string;
  tagline: string;
  description: string;
  highlights: readonly string[];
  accent: string;
  href?: string;
};

export const subBrands: SubBrand[] = [
  {
    slug: "adium",
    nameKo: "에이디움",
    nameEn: "Adium",
    tagline: "AI 리터러시 교육",
    description:
      "AI와 배움이 만나 일상의 지능을 높이는 인공지능 리터러시 교육 브랜드. 임원 워크샵부터 실무자 핸즈온, 학교 단위 정규 과정까지 포괄합니다.",
    highlights: ["임원·실무자 트랙 분리", "조직 전용 커리큘럼", "수료 후 운영 코칭"],
    accent: "from-indigo-500 to-violet-500",
  },
  {
    slug: "badium",
    nameKo: "베이디움",
    nameEn: "Badium",
    tagline: "디지털 굿즈 스튜디오",
    description:
      "AI 디자인의 감성을 따뜻한 일상으로 구워내는 디지털 굿즈 스튜디오. 브랜드 협업, 캠페인 시즌 굿즈, 일러스트 라이선싱까지 다룹니다.",
    highlights: ["AI 일러스트 라이선싱", "캠페인 단위 굿즈 제작", "브랜드 콜라보"],
    accent: "from-fuchsia-500 to-rose-500",
  },
];
