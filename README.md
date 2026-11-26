# 🌐 개인 포트폴리오 웹사이트 (Personal Portfolio)

HTML5, CSS3, Vanilla JavaScript(ES6+)만을 사용하여 제작한 반응형 개인 포트폴리오 웹사이트입니다.  
모바일 퍼스트(Mobile-First) 설계와 상태 기반(State-Driven) UI 렌더링 구조를 적용하여 유지보수성과 사용자 경험(UX)을 높였습니다.

---

## 🔗 배포 URL (Live Demo)
* **GitHub Pages:** `https://jec0331-coder.github.io/Codyssey_MissionB1-1/`

---

## 🛠️ 사용 기술 (Tech Stack)
* **Markup:** HTML5 (Semantic Tags)
* **Styling:** CSS3 (CSS Variables, Flexbox, Grid, Media Queries)
* **Scripting:** JavaScript ES6+ (`async/await`, `fetch`, `IntersectionObserver`, `localStorage`, State Pattern)
* **Deployment:** GitHub Pages

---

## 📁 폴더 구조 (Directory Structure)
```text
📦 project-root
 ┣ 📂 css
 ┃ ┗ 📜 style.css       # 모바일 퍼스트 반응형 및 다크 모드 스타일시트
 ┣ 📂 js
 ┃ ┗ 📜 main.js         # 상태(State) 관리, DOM 조작, API 연동 및 폼 검증 스크립트
 ┣ 📜 index.html        # 시맨틱 마크업 기반 메인 페이지
 ┗ 📜 README.md         # 프로젝트 설명 및 기능 명세 문서
```

---

## ✨ 주요 구현 기능 및 명세

### 1. 시맨틱 구조 및 반응형 레이아웃
* **섹션 구성:** `Hero`, `About`, `Skills`, `Projects`, `Contact`, `Footer`로 명확하게 구역을 분리했습니다.
* **모바일 퍼스트(Mobile-First):** 모바일(`767px` 이하) 화면을 기본으로 설계하고, 미디어 쿼리 브레이크포인트를 통해 확장됩니다.
  * **태블릿 분기점:** `768px` 이상 (햄버거 메뉴 숨김, 상단 네비게이션 가로 배치)
  * **데스크톱 분기점:** `1024px` 이상 (여백 확장 및 타이포그래피 최적화)
* **Flexbox & Grid:** 상단 네비게이션은 `Flexbox`로 좌우 정렬하고, 프로젝트 카드 목록은 `CSS Grid (auto-fit, minmax(280px, 1fr))`를 활용해 화면 크기에 맞춰 유연하게 배치했습니다.

### 2. 다크 모드 (Dark Mode)
* CSS 변수(`:root` 및 `[data-theme="dark"]`)를 활용하여 라이트/다크 테마 컬러 시스템을 구축했습니다.
* 우측 상단 토글 버튼 클릭 시 테마가 전환되며, 선택된 값은 브라우저의 `localStorage`에 저장되어 새로고침 이후에도 유지됩니다.

### 3. 인터랙션 및 스크롤 기준값 명세
* **햄버거 메뉴 토글:** 모바일 환경에서 햄버거 버튼 클릭 시 `classList.toggle('active')`를 통해 메뉴가 열리고 닫힙니다.
* **부드러운 스크롤 (Smooth Scroll):** 네비게이션 메뉴 클릭 시 `event.preventDefault()`로 기본 점프 동작을 막고 해당 섹션으로 부드럽게 이동합니다.
* **네비게이션 스타일 변경 기준 (`60px`):** 윈도우 스크롤 위치(`scrollY`)가 **`60px` 이상**일 때 상단 헤더에 `.scrolled` 클래스가 부여되어 배경색과 그림자가 변경됩니다.
* **스크롤 탑 버튼 노출 기준 (`300px`):** 윈도우 스크롤 위치(`scrollY`)가 **`300px` 이상**일 때 우측 하단에 맨 위로 이동 버튼(`.visible`)이 나타나며, 클릭 시 페이지 최상단(`top: 0`)으로 이동합니다.
* **스크롤 등장 애니메이션 (`threshold: 0.2`):** `IntersectionObserver`의 임계값을 **`0.2`(20%)**로 설정하여, 각 섹션이 화면에 20% 이상 진입할 때 부드럽게 나타나는 시각 효과를 적용했습니다.

### 4. 비동기 처리 & GitHub API 연동
* `fetch`와 `async/await`를 사용하여 GitHub에서 저장소 목록을 실시간으로 가져옵니다.
* 배열 메서드(`map`, `filter`, `forEach`)와 템플릿 리터럴, 구조분해 할당을 활용해 동적 카드를 생성하고 카테고리(`All`, `Forks`, `Stars`)별 필터링을 지원합니다.
* **4대 UI 상태 처리 (`try/catch` 활용):**
  * **로딩 상태:** 데이터 요청 중 원형 스피너와 `"GitHub 프로젝트를 불러오는 중입니다..."` 안내 표시
  * **성공 상태:** 저장소 이름, 설명, 사용 언어, 스타(⭐) 수, 링크가 포함된 카드 리스트 렌더링
  * **에러 상태:** 네트워크 오류 등 실패 시 `"프로젝트를 불러올 수 없습니다"` 메시지 및 **다시 시도하기** 버튼 제공
  * **빈 상태:** 조건에 맞는 저장소가 없을 경우 `"표시할 프로젝트가 없습니다"` 메시지 출력

### 5. Contact 폼 유효성 검증 (UX)
* 이름, 이메일, 메시지 입력 필드에 대한 필수값(공백) 검증 및 정규표현식을 활용한 이메일 형식 검증을 구현했습니다.
* 유효하지 않은 입력 시 해당 필드 하단에 에러 메시지를 즉시 표시하며, 모든 조건 통과 시 `event.preventDefault()`로 새로고침을 방지한 뒤 전송 성공 안내 메시지를 출력합니다.

### 6. 상태(State) 기반 아키텍처
* 페이지의 테마, 메뉴 열림 여부, 스크롤 상태, API 데이터 상태를 단일 `state` 객체로 통합 관리하고, `setState()` 호출 시 `render()` 함수가 UI를 일관되게 동기화하도록 설계했습니다.

---

## 스크린샷

### 1.모바일 비율
<img width="577" height="881" alt="모바일" src="https://github.com/user-attachments/assets/0d034856-1ddd-48b2-ac7e-36dfac678f41" />

### 2.웹 비율
<img width="1440" height="880" alt="웹비율" src="https://github.com/user-attachments/assets/c517eeac-96e1-4bfc-b6bf-36dc9bcb309d" />

### 3.다크 모드
<img width="579" height="878" alt="모바일 다크" src="https://github.com/user-attachments/assets/2e9f0809-526a-4655-98a3-8f52e38df822" />

### 4.about, skill 섹션
<img width="576" height="876" alt="about, skill 섹션" src="https://github.com/user-attachments/assets/b127e787-0a9a-49c7-9ee6-fe2c7a59f107" />

### 5.projects 섹션
<img width="575" height="877" alt="projects 섹션" src="https://github.com/user-attachments/assets/b5eb6fdf-5545-418c-bb4c-5846ca517929" />

### 6.contact 섹션
<img width="576" height="876" alt="contact 섹션" src="https://github.com/user-attachments/assets/fd6887ab-c8dd-4621-bf88-266c91655c93" />


### footer
<img width="576" height="879" alt="footer" src="https://github.com/user-attachments/assets/f030497d-10ef-4674-a843-4f830400af3e" />


---

## 👤 작성자 (Author)
* **정의철:**
* **GitHub:** `https://github.com/jec0331-coder/Codyssey_MissionB1-1`
* **Email:** `jec0331@gmail.com`
