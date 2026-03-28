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
        images: Array.from({ length: 15 }, (_, i) => `슬라이드${i + 1}.PNG`),
        audio: ['비폭력대화 오디오 오버뷰1(28분).m4a', '비폭력대화 오디오 오버뷰2(2분).m4a']
    },
    {
        id: 2,
        title: '역사 속으로 다이빙! 🌊 생생 역사 대화 프롬프트 제너레이터',
        author: '왕관유자쌤',
        time: '방금 전',
        subject: '사회',
        grade: '공통',
        iconColor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        iconClass: 'fas fa-history',
        type: 'iframe',
        url: 'history-prompt/index.html',
        content: '과거의 한 장면으로 들어가 역사의 숨결을 직접 느껴보세요!\n\n- 시대, 인물, 국가, 사건 등 원하는 주제를 마음껏 골라보세요.\n- 역사 속 인물과 실시간으로 대화를 나누며 현장의 생생한 이야기를 들어봅시다.'
    }
];

let currentSubject = '전체';
let currentGrade = '전체';
let currentSlideIndex = 0;
let currentPost = null;

// Media Controllers
let activePlayers = [];

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
        stopAllPlayers();
    };

    document.onfullscreenchange = () => {
        if (!document.fullscreenElement) {
            // Reset visibility when exiting fullscreen
            document.querySelectorAll('.audio-player').forEach(p => p.style.display = '');
        }
    };
}

function stopAllPlayers() {
    activePlayers.forEach(player => {
        player.media.pause();
        player.media.currentTime = 0;
    });
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
            stopAllPlayers();
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
            stopAllPlayers();
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
    stopAllPlayers();
    activePlayers = [];

    detailTitle.textContent = post.title;
    detailMeta.textContent = `${post.grade} · ${post.subject} · ${post.author}`;
    detailText.textContent = post.content || '';

    // Clear previous media, except floating audio player
    Array.from(mediaContainer.children).forEach(child => {
        if (child.id !== 'floating-audio-player') {
            child.remove();
        }
    });

    floatingAudio.innerHTML = '';
    floatingAudio.style.display = 'none';

    if (post.type === 'slideshow') {
        renderSlideshow(post);
    } else if (post.type === 'video') {
        // We will let createMediaPlayer handle it if it's the main video
        mediaContainer.insertAdjacentHTML('afterbegin', '<div style="padding: 20px; color: #666; font-style: italic;">동영상 자료</div>');
    } else if (post.type === 'iframe') {
        mediaContainer.insertAdjacentHTML('afterbegin', `<iframe src="${post.url}" style="width:100%; height:75vh; min-height:650px; border:none; border-radius:12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); background: transparent;"></iframe>`);
    } else {
        mediaContainer.insertAdjacentHTML('afterbegin', '<div style="padding: 40px; color: #666;">콘텐츠 준비 중입니다.</div>');
    }

    // Setup media players (multiple audio/video)
    const mediaFiles = [];
    if (post.video) {
        if (Array.isArray(post.video)) mediaFiles.push(...post.video.map(f => ({ file: f, type: 'video' })));
        else mediaFiles.push({ file: post.video, type: 'video' });
    }

    if (post.audio) {
        if (Array.isArray(post.audio)) mediaFiles.push(...post.audio.map(f => ({ file: f, type: 'audio' })));
        else mediaFiles.push({ file: post.audio, type: 'audio' });
    }

    if (mediaFiles.length > 0) {
        floatingAudio.style.display = 'flex';
        floatingAudio.style.flexDirection = 'column';
        floatingAudio.style.gap = '15px';
        mediaFiles.forEach(media => {
            createMediaPlayer(media.file, media.type, post.folder);
        });
    }
}

function renderSlideshow(post) {
    currentSlideIndex = 0;
    const slidesHTML = `
        <div class="slideshow-container" id="slideshow-root">
            <button class="expand-btn" id="slide-expand" title="전체화면"><i class="fas fa-expand"></i></button>
            <img id="current-slide" src="${post.folder}/${post.images[0]}" alt="Slide">
            <button class="slide-nav prev" id="prev-slide"><i class="fas fa-chevron-left"></i></button>
            <button class="slide-nav next" id="next-slide"><i class="fas fa-chevron-right"></i></button>
            <div class="slide-counter"><span id="slide-current">1</span> / <span id="slide-total">${post.images.length}</span></div>
        </div>
    `;
    mediaContainer.insertAdjacentHTML('afterbegin', slidesHTML);

    const expandB = document.getElementById('slide-expand');
    if (expandB) expandB.onclick = toggleFullscreen;

    const prevB = document.getElementById('prev-slide');
    const nextB = document.getElementById('next-slide');

    prevB.onclick = () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlideView();
        }
    };
    nextB.onclick = () => {
        if (currentSlideIndex < post.images.length - 1) {
            currentSlideIndex++;
            updateSlideView();
        }
    };
    updateSlideView();
}

function updateSlideView() {
    if (!currentPost) return;
    const slideImg = document.getElementById('current-slide');
    const slideCurrentEl = document.getElementById('slide-current');
    const prevB = document.getElementById('prev-slide');
    const nextB = document.getElementById('next-slide');

    slideImg.src = `${currentPost.folder}/${currentPost.images[currentSlideIndex]}`;
    slideCurrentEl.textContent = currentSlideIndex + 1;

    prevB.style.opacity = currentSlideIndex === 0 ? '0.3' : '1';
    nextB.style.opacity = currentSlideIndex === currentPost.images.length - 1 ? '0.3' : '1';
}

function createMediaPlayer(fileName, type, folder) {
    const playerWrapper = document.createElement('div');
    playerWrapper.className = 'audio-player small';

    const mediaPath = `${folder}/${fileName}`;
    const mediaTag = type === 'video' ? 'video' : 'audio';

    // For video, we might want to see it if it's not the main one
    const videoStyle = type === 'video' ? 'width: 100%; max-height: 200px; background: #000; margin-bottom: 10px; display: block;' : 'display: none;';

    playerWrapper.innerHTML = `
        <div class="player-header">
            <span class="player-filename">${fileName}</span>
        </div>
        ${type === 'video' ? `<video src="${mediaPath}" style="${videoStyle}"></video>` : `<audio src="${mediaPath}" style="display:none"></audio>`}
        <div class="player-controls-row">
            <button class="control-btn mini play-btn"><i class="fas fa-play"></i></button>
            <button class="control-btn mini stop-btn"><i class="fas fa-stop"></i></button>
            
            <span class="time-text current-time">00:00</span>
            
            <button class="seek-btn prev-10" title="10초 뒤로"><i class="fas fa-undo"></i></button>
            <div class="progress-bar-container">
                <div class="progress-bar">
                    <div class="progress-thumb"></div>
                </div>
            </div>
            <button class="seek-btn next-10" title="10초 앞으로"><i class="fas fa-redo"></i></button>
            
            <span class="time-text total-duration">00:00</span>
            
            <div class="speed-container">
                <button class="speed-btn down"><i class="fas fa-chevron-left"></i></button>
                <input type="text" class="speed-input" value="1.0" readonly>
                <button class="speed-btn up"><i class="fas fa-chevron-right"></i></button>
            </div>
            
            <div class="volume-control-wrapper">
                <button class="control-btn mini secondary volume-btn" title="음량"><i class="fas fa-volume-up"></i></button>
                <div class="volume-popup" style="display:none;">
                    <i class="fas fa-volume-up mute-toggle" title="음소거"></i>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.05" value="1">
                </div>
            </div>
            
            <button class="control-btn mini secondary expand-toggle"><i class="fas fa-expand"></i></button>
        </div>
    `;

    floatingAudio.appendChild(playerWrapper);

    const media = playerWrapper.querySelector(mediaTag);
    const playBtn = playerWrapper.querySelector('.play-btn');
    const stopBtn = playerWrapper.querySelector('.stop-btn');
    const progressBar = playerWrapper.querySelector('.progress-bar');
    const progressContainer = playerWrapper.querySelector('.progress-bar-container');
    const currentTimeEl = playerWrapper.querySelector('.current-time');
    const durationEl = playerWrapper.querySelector('.total-duration');
    const speedInput = playerWrapper.querySelector('.speed-input');
    const speedUp = playerWrapper.querySelector('.speed-btn.up');
    const speedDown = playerWrapper.querySelector('.speed-btn.down');
    const expandBtn = playerWrapper.querySelector('.expand-toggle');
    const seekPrev = playerWrapper.querySelector('.prev-10');
    const seekNext = playerWrapper.querySelector('.next-10');

    // Volume Control Elements
    const volumeBtn = playerWrapper.querySelector('.volume-btn');
    const volumePopup = playerWrapper.querySelector('.volume-popup');
    const volumeSlider = playerWrapper.querySelector('.volume-slider');
    const muteToggle = playerWrapper.querySelector('.mute-toggle');
    const volumeBtnIcon = volumeBtn.querySelector('i');

    let lastVolume = 1;

    // Volume Logic
    volumeBtn.onclick = (e) => {
        e.stopPropagation();
        const currentDisplay = volumePopup.style.display;
        // Close other popups? Or just toggle this one
        volumePopup.style.display = currentDisplay === 'none' ? 'flex' : 'none';
    };

    volumeSlider.oninput = (e) => {
        const val = e.target.value;
        media.volume = val;
        updateVolumeIcon(val);
        if (val > 0) lastVolume = val;
    };

    muteToggle.onclick = () => {
        if (media.volume > 0) {
            lastVolume = media.volume;
            media.volume = 0;
            volumeSlider.value = 0;
        } else {
            media.volume = lastVolume;
            volumeSlider.value = lastVolume;
        }
        updateVolumeIcon(media.volume);
    };

    function updateVolumeIcon(vol) {
        let iconClass = 'fa-volume-up';
        if (vol == 0) iconClass = 'fa-volume-mute';
        else if (vol < 0.5) iconClass = 'fa-volume-down';

        volumeBtnIcon.className = `fas ${iconClass}`;
        muteToggle.className = `fas ${iconClass} mute-toggle`;
    }

    // Close volume popup when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (!volumeBtn.contains(e.target) && !volumePopup.contains(e.target)) {
            volumePopup.style.display = 'none';
        }
    });

    // Play/Pause toggle
    playBtn.onclick = () => {
        if (media.paused) {
            // Optional: Pause others if you want only one playing at a time
            activePlayers.forEach(p => {
                if (p.media !== media) {
                    p.media.pause();
                    p.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    p.wrapper.classList.remove('active-playing');
                }
            });

            media.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playerWrapper.classList.add('active-playing');
        } else {
            media.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playerWrapper.classList.remove('active-playing');
        }
    };

    const playerObj = { media, playBtn, progressBar, currentTimeEl, durationEl, wrapper: playerWrapper };
    activePlayers.push(playerObj);

    // Stop
    stopBtn.onclick = () => {
        media.pause();
        media.currentTime = 0;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playerWrapper.classList.remove('active-playing');
        updateUI();
    };

    // Progress update
    media.ontimeupdate = updateUI;
    media.onloadedmetadata = () => {
        durationEl.textContent = formatTime(media.duration);
    };
    media.onended = () => {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    };

    function updateUI() {
        const percent = (media.currentTime / media.duration) * 100 || 0;
        progressBar.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(media.currentTime);
    }

    // Seek
    progressContainer.onclick = (e) => {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        media.currentTime = pos * media.duration;
    };

    seekPrev.onclick = () => {
        media.currentTime = Math.max(0, media.currentTime - 10);
    };

    seekNext.onclick = () => {
        media.currentTime = Math.min(media.duration, media.currentTime + 10);
    };

    // Speed controls
    speedUp.onclick = () => {
        let rate = parseFloat(speedInput.value);
        rate = Math.min(4.0, rate + 0.1);
        speedInput.value = rate.toFixed(1);
        media.playbackRate = rate;
    };
    speedDown.onclick = () => {
        let rate = parseFloat(speedInput.value);
        rate = Math.max(0.1, rate - 0.1);
        speedInput.value = rate.toFixed(1);
        media.playbackRate = rate;
    };

    // Fullscreen toggle (starts playback as well)
    expandBtn.onclick = () => {
        if (!document.fullscreenElement) {
            // Start playing if not already
            if (media.paused) {
                playBtn.onclick();
            }
            toggleFullscreen();
        } else {
            toggleFullscreen();
        }
    };
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        mediaContainer.requestFullscreen().catch(err => {
            alert(`Fullscreen error: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

document.addEventListener('DOMContentLoaded', init);
