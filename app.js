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
        title: '비폭력 대화',
        author: '유자 선생님',
        time: '방금 전',
        subject: '생활지도',
        grade: '공통',
        iconColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        iconClass: 'fas fa-heart',
        type: 'slideshow',
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
        type: 'normal'
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
        type: 'normal'
    }
];

let currentSubject = '전체';
let currentGrade = '전체';

// DOM Elements
const subjectMenuEl = document.getElementById('subject-menu');
const gradeTabsEl = document.getElementById('grade-tabs');
const postListEl = document.getElementById('post-list');
const currentSubjectTitleEl = document.getElementById('current-subject-title');

// Initialize
function init() {
    renderSubjects();
    renderGrades();
    renderPosts();
    setupModal();
}

// Render Subject Menu
function renderSubjects() {
    subjectMenuEl.innerHTML = '';
    subjects.forEach(subject => {
        // Reduced restriction on '전체' in sidebar to allow it if desired, 
        // but typically '전체' is represented by a specific top-level state.
        // The user wants '전체' to be selectable.
        const li = document.createElement('li');
        li.className = `nav-item ${subject === currentSubject ? 'active' : ''}`;
        li.innerHTML = `<i class="fas fa-folder"></i> ${subject}`;
        li.onclick = () => {
            currentSubject = subject;
            currentGrade = '전체'; // Reset grade when subject changes
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
            updateActiveStates();
            renderPosts();
        };
        gradeTabsEl.appendChild(div);
    });
}

// Update UI active states
function updateActiveStates() {
    // Subject Header
    currentSubjectTitleEl.textContent = currentSubject;
    
    // Sidebar
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.textContent.trim() === currentSubject);
    });

    // Grade Tabs
    document.querySelectorAll('.tab-item').forEach(el => {
        el.classList.toggle('active', el.textContent.trim() === currentGrade);
    });
}

// Render Posts
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
        card.onclick = () => handlePostClick(post);
        
        // If it iconColor is light, make text black, else white (simple logic)
        let iconTextColor = 'white';
        if(post.iconColor.includes('#fdfbfb')) iconTextColor = '#333';

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

// Post Click Handler
function handlePostClick(post) {
    if (post.type === 'slideshow') {
        openModal(post);
    } else {
        alert('이 게시물은 데모입니다.');
    }
}

/* =======================================
   Slideshow & Audio Logic
======================================= */
let currentSlideIndex = 0;
let currentPost = null;

const modal = document.getElementById('slideshow-modal');
const closeModalBtn = document.getElementById('close-modal');
const slideImg = document.getElementById('current-slide');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
const slideCurrentEl = document.getElementById('slide-current');
const slideTotalEl = document.getElementById('slide-total');
const modalTitle = document.getElementById('modal-title');

// Audio Controls
const audio = document.getElementById('lesson-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const timeDisplay = document.getElementById('time-display');
const speedControl = document.getElementById('speed-control');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const modalBody = document.querySelector('.modal-body');

function setupModal() {
    closeModalBtn.onclick = closeModal;
    
    prevBtn.onclick = () => {
        if(currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlideView();
        }
    };
    
    nextBtn.onclick = () => {
        if(currentPost && currentSlideIndex < currentPost.images.length - 1) {
            currentSlideIndex++;
            updateSlideView();
        }
    };

    // Close on outside click
    modal.onclick = (e) => {
        if(e.target === modal) closeModal();
    };

    // Audio Evenets
    playPauseBtn.onclick = togglePlay;
    
    audio.ontimeupdate = updateProgress;
    audio.onloadedmetadata = () => {
        timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
    };
    audio.onended = () => {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> 재생';
    };

    progressContainer.onclick = setProgress;
    
    speedControl.onchange = (e) => {
        audio.playbackRate = parseFloat(e.target.value);
    };

    if (fullscreenBtn) {
        fullscreenBtn.onclick = toggleFullscreen;
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        modalBody.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

function openModal(post) {
    currentPost = post;
    currentSlideIndex = 0;
    
    modalTitle.textContent = post.title;
    slideTotalEl.textContent = post.images.length;
    
    // Set Audio
    audio.src = `${post.folder}/${post.audio}`;
    audio.playbackRate = parseFloat(speedControl.value);
    audio.load();
    
    updateSlideView();
    
    modal.style.display = 'flex';
    // Small delay for CSS transition
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // reset audio UI
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i> 재생';
    progressBar.style.width = '0%';
}

function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        currentPost = null;
        audio.pause();
        audio.currentTime = 0;
    }, 300); // match transition css
}

function updateSlideView() {
    if(!currentPost) return;
    const imgFile = currentPost.images[currentSlideIndex];
    slideImg.src = `${currentPost.folder}/${imgFile}`;
    slideCurrentEl.textContent = currentSlideIndex + 1;
    
    // Button states
    prevBtn.style.opacity = currentSlideIndex === 0 ? '0.3' : '1';
    prevBtn.style.cursor = currentSlideIndex === 0 ? 'default' : 'pointer';
    
    nextBtn.style.opacity = currentSlideIndex === currentPost.images.length - 1 ? '0.3' : '1';
    nextBtn.style.cursor = currentSlideIndex === currentPost.images.length - 1 ? 'default' : 'pointer';
}

function togglePlay() {
    if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> 일시정지';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> 재생';
    }
}

function updateProgress() {
    if(audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
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

function formatTime(seconds) {
    if(isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Run app
document.addEventListener('DOMContentLoaded', init);
