const subjects = [
    '전체', '국어', '도덕', '사회', '수학', '과학', '실과', '체육', '음악', '미술', '영어', '창체', '통합교과', '안전', '생활지도'
];

const grades = [
    '전체', '공통', '1학년', '2학년', '3학년', '4학년', '5학년', '6학년'
];

// Mock Data
const posts = [
    {
        id: 1,
        title: '비폭력대화 PPT+오디오',
        author: '유자 선생님',
        time: '방금 전',
        subject: '생활지도',
        grade: '공통',
        iconColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        iconClass: 'fas fa-heart',
        type: 'slideshow',
        content: '비폭력대화 오디오 오버뷰를 재생하고 오디오 내용에 맞게 슬라이드를 넘겨서 사용하세요',
        folder: '비폭력대화',
        images: Array.from({length: 15}, (_, i) => `슬라이드${i + 1}.PNG`),
        audio: '말의_가시를_빼는_초6의_대화법.m4a'
    },
    {
        id: 2,
        title: '3단원 6차시 문장의 짜임을 생각하며 바르게 읽고 쓰기',
        author: '에이뽀용지',
        time: '12분 전',
        subject: '국어',
        grade: '3학년',
        iconColor: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        iconClass: 'fas fa-book',
        type: 'normal',
        content: '국어 수업 자료입니다. 문장의 짜임을 학습합니다.'
    },
    {
        id: 3,
        title: '6_1_2 영화 감상문을 쓰고 고쳐 쓰기 (토이스토리)',
        author: '입열지마라',
        time: '7분 전',
        subject: '국어',
        grade: '6학년',
        iconColor: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        iconClass: 'fas fa-film',
        type: 'normal',
        content: '영화 토이스토리를 보고 감상문을 써봅시다.'
    }
];

let currentSubject = '전체';
let currentGrade = '전체';
let currentSlideIndex = 0;
let currentPost = null;

// DOM Elements
const subjectMenuEl = document.getElementById('subject-menu');
const gradeTabsEl = document.getElementById('grade-tabs');
const postListEl = document.getElementById('post-list');
const currentSubjectTitleEl = document.getElementById('current-subject-title');

const postListView = document.getElementById('post-list-view');
const postDetailView = document.getElementById('post-detail-view');
const backToListBtn = document.getElementById('back-to-list');

const detailTitle = document.getElementById('detail-title');
const detailMeta = document.getElementById('detail-meta');
const detailText = document.getElementById('detail-text');
const mediaContainer = document.getElementById('media-container');
const floatingAudio = document.getElementById('floating-audio-player');

// Audio Elements (Updated selectors for new HTML structure)
const audio = document.getElementById('lesson-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const speedControl = document.getElementById('speed-control');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const closeFullscreenBtn = document.getElementById('close-fullscreen-btn');

// Initialize
function init() {
    renderSubjects();
    renderGrades();
    renderPosts();
    setupEventListeners();
}

function setupEventListeners() {
    backToListBtn.onclick = () => {
        postDetailView.style.display = 'none';
        postListView.style.display = 'block';
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    // Audio Events
    playPauseBtn.onclick = togglePlay;
    audio.ontimeupdate = updateProgress;
    audio.onended = () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    };
    progressContainer.onclick = setProgress;
    speedControl.onchange = (e) => {
        audio.playbackRate = parseFloat(e.target.value);
    };
    if (fullscreenBtn) {
        fullscreenBtn.onclick = toggleFullscreen;
    }
    if (closeFullscreenBtn) {
        closeFullscreenBtn.onclick = toggleFullscreen;
    }
}

// Render Subject Menu
function renderSubjects() {
    subjectMenuEl.innerHTML = '';
    subjects.forEach(subject => {
        const li = document.createElement('li');
        li.className = `nav-item ${subject === currentSubject ? 'active' : ''}`;
        li.innerHTML = `<i class="fas fa-folder"></i> ${subject}`;
        li.onclick = () => {
            currentSubject = subject;
            currentGrade = '전체';
            postDetailView.style.display = 'none';
            postListView.style.display = 'block';
            updateActiveStates();
            renderPosts();
        };
        subjectMenuEl.appendChild(li);
    });
}

// Render Grade Tabs
function renderGrades() {
    gradeTabsEl.innerHTML = '';
    grades.forEach(grade => {
        const div = document.createElement('div');
        div.className = `tab-item ${grade === currentGrade ? 'active' : ''}`;
        div.textContent = grade;
        div.onclick = () => {
            currentGrade = grade;
            postDetailView.style.display = 'none';
            postListView.style.display = 'block';
            updateActiveStates();
            renderPosts();
        };
        gradeTabsEl.appendChild(div);
    });
}

function updateActiveStates() {
    currentSubjectTitleEl.textContent = currentSubject;
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.textContent.trim() === currentSubject);
    });
    document.querySelectorAll('.tab-item').forEach(el => {
        el.classList.toggle('active', el.textContent.trim() === currentGrade);
    });
}

function renderPosts() {
    postListEl.innerHTML = '';
    const filteredPosts = posts.filter(post => {
        const matchSubject = currentSubject === '전체' || post.subject === currentSubject;
        const matchGrade = currentGrade === '전체' || post.grade === currentGrade;
        return matchSubject && matchGrade;
    });

    if (filteredPosts.length === 0) {
        postListEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">등록된 게시물이 없습니다.</div>';
        return;
    }

    filteredPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => showPostDetail(post);
        let iconTextColor = post.iconColor.includes('#fdfbfb') ? '#333' : 'white';
        card.innerHTML = `
            <div class="post-icon" style="background: ${post.iconColor}; color: ${iconTextColor}">
                <i class="${post.iconClass}"></i>
            </div>
            <div class="post-content">
                <div class="post-badges">
                    <span class="badge grade">${post.grade}</span>
                    <span class="badge subject">${post.subject}</span>
                </div>
                <div class="post-title">${post.title}</div>
                <div class="post-meta">
                    <span style="font-weight:500; color:#444;">${post.author}</span> · ${post.time}
                </div>
            </div>
        `;
        postListEl.appendChild(card);
    });
}

function showPostDetail(post) {
    currentPost = post;
    postListView.style.display = 'none';
    postDetailView.style.display = 'block';

    detailTitle.textContent = post.title;
    detailMeta.textContent = `${post.grade} · ${post.subject} · ${post.author}`;
    detailText.textContent = post.content || '';

    // Clear previous media
    mediaContainer.innerHTML = '';
    floatingAudio.style.display = 'none';

    if (post.type === 'slideshow') {
        renderSlideshow(post);
        if (post.audio) {
            setupAudio(post);
        }
    } else {
        mediaContainer.innerHTML = '<div style="padding: 40px; color: #666;">콘텐츠 준비 중입니다.</div>';
    }
}

function renderSlideshow(post) {
    currentSlideIndex = 0;
    const slidesHTML = `
        <div class="slideshow-container" id="slideshow-root">
            <img id="current-slide" src="${post.folder}/${post.images[0]}" alt="Slide">
            <button class="slide-nav prev" id="prev-slide"><i class="fas fa-chevron-left"></i></button>
            <button class="slide-nav next" id="next-slide"><i class="fas fa-chevron-right"></i></button>
            <div class="slide-counter"><span id="slide-current">1</span> / <span id="slide-total">${post.images.length}</span></div>
        </div>
    `;
    mediaContainer.innerHTML = slidesHTML;

    const prevB = document.getElementById('prev-slide');
    const nextB = document.getElementById('next-slide');

    prevB.onclick = () => {
        if(currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlideView();
        }
    };
    nextB.onclick = () => {
        if(currentSlideIndex < post.images.length - 1) {
            currentSlideIndex++;
            updateSlideView();
        }
    };
    updateSlideView();
}

function updateSlideView() {
    if(!currentPost) return;
    const slideImg = document.getElementById('current-slide');
    const slideCurrentEl = document.getElementById('slide-current');
    const prevB = document.getElementById('prev-slide');
    const nextB = document.getElementById('next-slide');

    slideImg.src = `${currentPost.folder}/${currentPost.images[currentSlideIndex]}`;
    slideCurrentEl.textContent = currentSlideIndex + 1;
    
    prevB.style.opacity = currentSlideIndex === 0 ? '0.3' : '1';
    nextB.style.opacity = currentSlideIndex === currentPost.images.length - 1 ? '0.3' : '1';
}

function setupAudio(post) {
    audio.src = `${post.folder}/${post.audio}`;
    audio.playbackRate = parseFloat(speedControl.value);
    audio.load();
    floatingAudio.style.display = 'block';
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function updateProgress() {
    if(audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        // Thumb is handled by CSS (position: absolute; right: -6px within progress-bar)
    }
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    if(duration) {
        audio.currentTime = (clickX / width) * duration;
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        mediaContainer.requestFullscreen().catch(err => {
            alert(`Fullscreen error: ${err.message}`);
        });
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

document.addEventListener('DOMContentLoaded', init);
