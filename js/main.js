// ==========================================================================
// 0. 브라우저 기본 동작 제어 (스크롤 복원 및 URL 해시 제거)
// ==========================================================================
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (window.location.hash) {
  history.replaceState(null, null, window.location.pathname + window.location.search);
}
window.addEventListener('load', () => window.scrollTo(0, 0));

document.addEventListener('DOMContentLoaded', () => {
  //내 실제 GitHub 아이디를 입력
  const GITHUB_USERNAME = 'jec0331-coder'; 
  const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`;

  // ==========================================================================
  // 1. 애플리케이션 중앙 상태(State) 정의
  // ==========================================================================
  const state = {
    theme: localStorage.getItem('theme') || 'light', // 'light' | 'dark'
    isMenuOpen: false,                              // 모바일 메뉴 열림 여부
    isHeaderScrolled: false,                        // 헤더 스크롤 스타일 적용 여부 (60px)
    isScrollTopVisible: false,                      // 탑 버튼 노출 여부 (300px)
    projects: {
      list: [],                                     // GitHub API 원본 데이터
      filter: 'all',                                // 'all' | 'forks' | 'stars'
      status: 'loading',                            // 'loading' | 'success' | 'error'
      errorMessage: ''
    }
  };

  // ==========================================================================
  // 2. DOM 요소 캐싱
  // ==========================================================================
  const DOM = {
    html: document.documentElement,
    header: document.querySelector('#main-header'),
    menuToggle: document.querySelector('#menu-toggle'),
    navMenu: document.querySelector('#nav-menu'),
    navLinks: document.querySelectorAll('.nav-menu a'),
    themeToggle: document.querySelector('#theme-toggle'),
    scrollTopBtn: document.querySelector('#scroll-top'),
    projectContainer: document.querySelector('#project-container'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    fadeInElements: document.querySelectorAll('.fade-in'),
    contactForm: document.querySelector('#contact-form')
  };

  // ==========================================================================
  // 3. 상태 업데이트 함수 (setState)
  // 상태가 변경되면 반드시 이 함수를 거치며, 자동으로 render()를 호출합니다.
  // ==========================================================================
  const setState = (newState) => {
    // 중첩 객체(projects) 병합 처리
    if (newState.projects) {
      state.projects = { ...state.projects, ...newState.projects };
      delete newState.projects;
    }
    Object.assign(state, newState);
    render();
  };

  // ==========================================================================
  // 4. 통합 렌더링 함수 (render)
  // 현재 state 값을 읽어 화면(UI)을 동기화합니다.
  // ==========================================================================
  const render = () => {
    // 1) 테마(다크/라이트 모드) 반영
    DOM.html.setAttribute('data-theme', state.theme);
    localStorage.setItem('theme', state.theme);

    // 2) 모바일 햄버거 메뉴 토글 반영
    if (DOM.navMenu) {
      DOM.navMenu.classList.toggle('active', state.isMenuOpen);
    }

    // 3) 스크롤 헤더 스타일 반영 (60px 기준)
    if (DOM.header) {
      DOM.header.classList.toggle('scrolled', state.isHeaderScrolled);
    }

    // 4) 스크롤 탑 버튼 노출 반영 (300px 기준)
    if (DOM.scrollTopBtn) {
      DOM.scrollTopBtn.classList.toggle('visible', state.isScrollTopVisible);
    }

    // 5) 프로젝트 필터 버튼 활성화 상태 반영
    DOM.filterButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-filter') === state.projects.filter;
      btn.classList.toggle('active', isActive);
    });

    // 6) 프로젝트 섹션 렌더링 (로딩 / 에러 / 빈 상태 / 성공)
    renderProjectsSection();
  };

  /**
   * 프로젝트 상태별 UI 마크업 생성 및 주입
   */
  const renderProjectsSection = () => {
    if (!DOM.projectContainer) return;

    const { status, list, filter, errorMessage } = state.projects;

    if (status === 'loading') {
      DOM.projectContainer.innerHTML = `
        <div class="status-message">
          <div class="spinner"></div>
          <p>GitHub 프로젝트를 불러오는 중입니다...</p>
        </div>
      `;
      return;
    }

    if (status === 'error') {
      DOM.projectContainer.innerHTML = `
        <div class="status-message">
          <p>⚠️ ${errorMessage}</p>
          <button id="btn-retry" class="btn-primary" style="margin-top: 1rem;">다시 시도하기</button>
        </div>
      `;
      const retryBtn = document.querySelector('#btn-retry');
      if (retryBtn) retryBtn.addEventListener('click', fetchGitHubRepositories);
      return;
    }

    // status === 'success' 일 때 필터링 적용
    let filteredList = list;
    if (filter === 'forks') {
      filteredList = list.filter((repo) => repo.fork === true);
    } else if (filter === 'stars') {
      filteredList = list.filter((repo) => repo.stargazers_count > 0);
    }

    // 빈 상태 처리
    if (filteredList.length === 0) {
      DOM.projectContainer.innerHTML = `
        <div class="status-message">
          <p>ℹ️ 표시할 프로젝트가 없습니다.</p>
        </div>
      `;
      return;
    }

    // 카드 리스트 렌더링
    DOM.projectContainer.innerHTML = filteredList.map((repo) => {
      const { name, description, html_url, language, stargazers_count } = repo;
      return `
        <article class="project-card">
          <h3>${name}</h3>
          <p>${description || '설명이 작성되지 않은 리포지토리입니다.'}</p>
          <div class="tech-tags">
            ${language ? `<span class="tag">${language}</span>` : ''}
            <span class="tag">⭐ ${stargazers_count}</span>
          </div>
          <a href="${html_url}" target="_blank" class="btn-project-link">GitHub 바로가기</a>
        </article>
      `;
    }).join('');
  };

  // ==========================================================================
  // 5. 비동기 API 호출 액션
  // ==========================================================================
  const fetchGitHubRepositories = async () => {
    setState({ projects: { status: 'loading' } });

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP 에러 (상태코드: ${response.status})`);

      const data = await response.json();
      setState({
        projects: {
          status: 'success',
          list: data
        }
      });
    } catch (error) {
      console.error('Fetch 에러:', error);
      setState({
        projects: {
          status: 'error',
          errorMessage: '프로젝트를 불러올 수 없습니다. 네트워크 연결을 확인해 주세요.'
        }
      });
    }
  };

  // ==========================================================================
  // 6. 이벤트 리스너 연결 (오직 setState만 호출하여 상태 변경)
  // ==========================================================================
  // 다크 모드 토글
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', () => {
      setState({ theme: state.theme === 'light' ? 'dark' : 'light' });
    });
  }

  // 모바일 햄버거 메뉴 토글
  if (DOM.menuToggle) {
    DOM.menuToggle.addEventListener('click', () => {
      setState({ isMenuOpen: !state.isMenuOpen });
    });
  }

  // 네비게이션 링크 클릭 (부드러운 스크롤 + 모바일 메뉴 닫기)
  DOM.navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        event.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
          window.scrollTo({
            top: targetSection.offsetTop - headerHeight,
            behavior: 'smooth'
          });
        }
      }
      if (state.isMenuOpen) {
        setState({ isMenuOpen: false });
      }
    });
  });

  // 스크롤 감지 (상태가 실제로 바뀔 때만 setState 호출하여 불필요한 렌더링 방지)
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop;
    const nextHeaderScrolled = scrollY >= 60;
    const nextScrollTopVisible = scrollY >= 300;

    if (
      state.isHeaderScrolled !== nextHeaderScrolled ||
      state.isScrollTopVisible !== nextScrollTopVisible
    ) {
      setState({
        isHeaderScrolled: nextHeaderScrolled,
        isScrollTopVisible: nextScrollTopVisible
      });
    }
  });

  // 스크롤 탑 버튼 클릭
  if (DOM.scrollTopBtn) {
    DOM.scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 프로젝트 필터 버튼 클릭
  DOM.filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedFilter = button.getAttribute('data-filter');
      if (state.projects.filter !== selectedFilter) {
        setState({ projects: { filter: selectedFilter } });
      }
    });
  });

  // Contact 폼 검증
  if (DOM.contactForm) {
    DOM.contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const nameInput = document.querySelector('#user-name');
      const emailInput = document.querySelector('#user-email');
      const messageInput = document.querySelector('#user-message');
      const nameError = document.querySelector('#name-error');
      const emailError = document.querySelector('#email-error');
      const messageError = document.querySelector('#message-error');
      const formSuccess = document.querySelector('#form-success');

      let isValid = true;
      nameError.textContent = '';
      emailError.textContent = '';
      messageError.textContent = '';
      formSuccess.textContent = '';
      formSuccess.classList.remove('show');

      if (nameInput.value.trim() === '') {
        nameError.textContent = '이름을 입력해 주세요.';
        nameInput.focus();
        isValid = false;
      }

      const emailValue = emailInput.value.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailValue === '') {
        emailError.textContent = '이메일을 입력해 주세요.';
        if (isValid) emailInput.focus();
        isValid = false;
        } else if (!emailRegex.test(emailValue)) {
        emailError.textContent = '올바른 이메일 형식이 아닙니다.';
        if (isValid) emailInput.focus();
        isValid = false;
        }
        if (messageInput.value.trim() === '') {
        messageError.textContent = '메시지를 입력해 주세요.';
        if (isValid) messageInput.focus();
        isValid = false;
        }
        if (isValid) {
        formSuccess.textContent = '🎉 성공적으로 전송되었습니다! 감사합니다, ${nameInput.value.trim()}님.';
        formSuccess.classList.add('show');
        DOM.contactForm.reset();
        }
        });
        }
        // 스크롤 등장 애니메이션 (Intersection Observer)
        const observer = new IntersectionObserver(
        (entries) => {
        entries.forEach((entry) => {
        if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
        }
        });
        },
        { threshold: 0.2 }
        );
        DOM.fadeInElements.forEach((el) => observer.observe(el));
        // ==========================================================================
        // 7. 초기 실행
        // ==========================================================================
        render();                   // 초기 상태(테마 등) 즉시 반영
        fetchGitHubRepositories();  // GitHub API 호출 시작
        });