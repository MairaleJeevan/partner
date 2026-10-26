// Romantic Proposal Experience Engine

const DEFAULT_CONFIG = {
    partnerName: "My Love",
    proposerName: "Yours Forever",
    proposalQuestion: "I Love You... Will you be mine and be my girlfriend? ❤️",
    anniversaryDate: "2023-05-14T19:30:00",
    proposalSubtitle: "Every single moment with you is magic. My heart belongs only to you.",
    loveLetter: `From the very first day you entered my life, everything turned brighter, warmer, and infinitely more beautiful.

You are the smile that begins my morning, the peace that calms my nights, and the dream I never want to wake up from. With every laugh we share, every quiet glance, and every trial we overcome together, my heart finds its home in you.

I don't just love you for who you are, but for who I am when I am with you. You make me want to be better, kinder, and bolder.

Today, under all the stars that witnessed our story, I want to tell you with my whole heart: I love you, now and forever.`,
    reasons: [
        "The way your eyes sparkle when you talk about things you love.",
        "How you make ordinary days feel like once-in-a-lifetime adventures.",
        "Your contagious laugh that instantly cures any bad day.",
        "The gentle warmth of your hand fitting perfectly into mine.",
        "How you always know what I'm feeling before I even say a word.",
        "Your kindness to strangers and your giant, compassionate heart.",
        "The cute little faces you make when you are thinking deeply.",
        "How safe and completely at peace I feel in your arms.",
        "Because you believe in my dreams even when I hesitate.",
        "Because you are my favorite person, my best friend, and my true soulmate."
    ],
    photos: [
        {
            url: "assets/hero-starlight.jpg",
            title: "Under The Starlit Sky",
            date: "Where Our Dreams Met",
            caption: "Countless stars above us, but my eyes will always find yours."
        },
        {
            url: "assets/sunset-beach.jpg",
            title: "Golden Hour Moments",
            date: "Walking Into Forever",
            caption: "Listening to the waves and wishing that this sunset walk would last an eternity."
        },
        {
            url: "assets/eternal-rose.jpg",
            title: "Our Eternal Love",
            date: "Blooming Forever",
            caption: "A flower that never fades, just like my love for you."
        }
    ]
};

// State
let appData = { ...DEFAULT_CONFIG };
let currentReasonIndex = 0;
let runawayCount = 0;

// Load saved or URL encoded data
function loadProposalData() {
    // Check if encoded in URL hash (#data=...)
    try {
        const hash = window.location.hash;
        if (hash.startsWith("#d=")) {
            const encoded = hash.substring(3);
            const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
            appData = { ...DEFAULT_CONFIG, ...decoded };
            return;
        }
    } catch (e) {
        console.warn("Could not parse URL hash data:", e);
    }

    // Otherwise check LocalStorage
    try {
        const saved = localStorage.getItem("romantic_proposal_config");
        if (saved) {
            appData = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
            if (appData.proposalQuestion && appData.proposalQuestion.toLowerCase().includes("marry")) {
                appData.proposalQuestion = DEFAULT_CONFIG.proposalQuestion;
                appData.proposalSubtitle = DEFAULT_CONFIG.proposalSubtitle;
            }
            if (appData.photos) {
                appData.photos.forEach(p => {
                    if (p.url.includes("ring-box")) {
                        p.url = "assets/eternal-rose.jpg";
                        p.title = "Our Eternal Love";
                        p.caption = "A flower that never fades, just like my love for you.";
                    }
                });
            }
            saveProposalData();
        }
    } catch (e) {
        console.warn("Could not read localStorage:", e);
    }
}

function saveProposalData() {
    try {
        localStorage.setItem("romantic_proposal_config", JSON.stringify(appData));
    } catch (e) {
        console.warn("Could not save to localStorage:", e);
    }
}

function generateShareableLink() {
    try {
        const jsonStr = JSON.stringify(appData);
        const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
        const url = window.location.origin + window.location.pathname + "#d=" + encoded;
        return url;
    } catch (e) {
        return window.location.href;
    }
}

// Dom population
function updateDOMWithData() {
    // Text elements
    document.querySelectorAll(".val-partner-name").forEach(el => el.textContent = appData.partnerName);
    document.querySelectorAll(".val-proposer-name").forEach(el => el.textContent = appData.proposerName);
    
    const salutationEl = document.getElementById("letterSalutationText");
    if (salutationEl) {
        if (appData.partnerName.toLowerCase().startsWith("my ")) {
            salutationEl.textContent = `To ${appData.partnerName},`;
        } else {
            salutationEl.textContent = `To My Beloved ${appData.partnerName},`;
        }
    }

    const questionEl = document.getElementById("proposalQuestionText");
    if (questionEl) questionEl.textContent = appData.proposalQuestion;

    const subtitleEl = document.getElementById("proposalSubtitleText");
    if (subtitleEl) subtitleEl.textContent = appData.proposalSubtitle;

    const letterEl = document.getElementById("letterBodyText");
    if (letterEl) {
        letterEl.innerHTML = appData.loveLetter.replace(/\n\n/g, "<br><br>").replace(/\n/g, "<br>");
    }

    // Render Reason
    renderCurrentReason();

    // Render Gallery
    renderPhotoGallery();

    // Fill Customizer Form
    populateCustomizerInputs();
}

function renderCurrentReason() {
    const textEl = document.getElementById("reasonCardText");
    const countEl = document.getElementById("reasonCounter");
    if (!textEl || !appData.reasons.length) return;

    textEl.style.opacity = "0";
    textEl.style.transform = "translateY(10px) scale(0.97)";
    
    setTimeout(() => {
        textEl.textContent = `"${appData.reasons[currentReasonIndex]}"`;
        if (countEl) countEl.textContent = `Reason #${currentReasonIndex + 1} of ${appData.reasons.length}`;
        textEl.style.opacity = "1";
        textEl.style.transform = "translateY(0) scale(1)";
    }, 220);
}

function nextReason() {
    currentReasonIndex = (currentReasonIndex + 1) % appData.reasons.length;
    renderCurrentReason();
    if (window.romanticAudio) window.romanticAudio.playKissChime();
    createFloatingHeartAtElement(document.getElementById("btnNextReason"));
}

function prevReason() {
    currentReasonIndex = (currentReasonIndex - 1 + appData.reasons.length) % appData.reasons.length;
    renderCurrentReason();
}

function renderPhotoGallery() {
    const galleryContainer = document.getElementById("polaroidGallery");
    if (!galleryContainer) return;

    galleryContainer.innerHTML = "";
    appData.photos.forEach((photo, idx) => {
        const tilt = (idx % 2 === 0 ? -2.5 : 2.5) * (1 + (idx * 0.4));
        const card = document.createElement("div");
        card.className = "polaroid-card";
        card.style.setProperty("--tilt-deg", `${tilt}deg`);
        card.innerHTML = `
            <div class="polaroid-pin">❤️</div>
            <div class="polaroid-tape"></div>
            <div class="polaroid-img-wrapper">
                <img src="${photo.url}" alt="${photo.title}" loading="lazy">
                <div class="polaroid-overlay">
                    <span>✨ View Memory</span>
                </div>
            </div>
            <div class="polaroid-caption">
                <h4>${photo.title}</h4>
                <p class="polaroid-date">${photo.date}</p>
                <p class="polaroid-sub">${photo.caption}</p>
            </div>
        `;
        card.addEventListener("click", () => openLightbox(photo));
        galleryContainer.appendChild(card);
    });
}

function openLightbox(photo) {
    const modal = document.getElementById("lightboxModal");
    const img = document.getElementById("lightboxImg");
    const title = document.getElementById("lightboxTitle");
    const caption = document.getElementById("lightboxCaption");
    if (!modal) return;

    img.src = photo.url;
    title.textContent = photo.title;
    caption.textContent = `${photo.date} • ${photo.caption}`;
    modal.classList.add("active");
    if (window.romanticAudio) window.romanticAudio.playKissChime();
}

function closeLightbox() {
    const modal = document.getElementById("lightboxModal");
    if (modal) modal.classList.remove("active");
}

// Live Love Counter
function initLoveCounter() {
    const daysEl = document.getElementById("countDays");
    const hoursEl = document.getElementById("countHours");
    const minsEl = document.getElementById("countMinutes");
    const secsEl = document.getElementById("countSeconds");
    const heartbeatsEl = document.getElementById("statHeartbeats");
    const smilesEl = document.getElementById("statSmiles");

    function updateCounter() {
        const start = new Date(appData.anniversaryDate).getTime();
        const now = new Date().getTime();
        let diff = Math.max(0, now - start);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);

        const seconds = Math.floor(diff / 1000);

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
        if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');

        // Romantic approximate calculations
        const totalMinutes = Math.floor((now - start) / (1000 * 60));
        const estimatedBeats = (totalMinutes * 72).toLocaleString();
        const estimatedSmiles = (days * 18).toLocaleString();

        if (heartbeatsEl) heartbeatsEl.textContent = estimatedBeats;
        if (smilesEl) smilesEl.textContent = estimatedSmiles;
    }

    updateCounter();
    setInterval(updateCounter, 1000);
}

// Ambient Background Animation (Canvas: Rose Petals, Twinkling Stars & Fireflies)
class AmbientAtmosphere {
    constructor() {
        this.canvas = document.getElementById("ambientCanvas");
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.petals = [];
        this.stars = [];
        this.fireflies = [];
        this.numPetals = 35;
        this.numStars = 85;
        this.numFireflies = 25;

        this.resize();
        this.initElements();
        window.addEventListener("resize", () => this.resize());
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    initElements() {
        // Stars
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.5 + 0.4,
                alpha: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.02 + 0.005,
                direction: Math.random() > 0.5 ? 1 : -1
            });
        }

        // Fireflies
        this.fireflies = [];
        for (let i = 0; i < this.numFireflies; i++) {
            this.fireflies.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2.2 + 1.2,
                color: `rgba(${230 + Math.random() * 25}, ${190 + Math.random() * 40}, ${90 + Math.random() * 40},`,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                alpha: Math.random() * 0.7 + 0.3,
                pulse: Math.random() * Math.PI
            });
        }

        // Petals
        this.petals = [];
        for (let i = 0; i < this.numPetals; i++) {
            this.petals.push(this.createPetal(true));
        }
    }

    createPetal(randomY = false) {
        return {
            x: Math.random() * this.width,
            y: randomY ? Math.random() * this.height : -20,
            size: Math.random() * 14 + 10,
            speedY: Math.random() * 1.2 + 0.8,
            speedX: Math.random() * 1.4 - 0.7,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            flip: Math.random() * 360,
            flipSpeed: Math.random() * 2 + 1,
            color: Math.random() > 0.35 ? "#d93856" : "#f26d85",
            opacity: Math.random() * 0.45 + 0.45
        };
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Stars
        for (let s of this.stars) {
            s.alpha += s.speed * s.direction;
            if (s.alpha > 0.95 || s.alpha < 0.2) s.direction *= -1;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 245, 230, ${s.alpha})`;
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = "#ffffff";
            this.ctx.fill();
        }
        this.ctx.shadowBlur = 0;

        // Draw Fireflies
        for (let f of this.fireflies) {
            f.x += f.vx;
            f.y += f.vy;
            f.pulse += 0.035;
            const currentAlpha = Math.max(0.1, (Math.sin(f.pulse) * 0.4 + 0.5) * f.alpha);

            if (f.x < 0) f.x = this.width;
            if (f.x > this.width) f.x = 0;
            if (f.y < 0) f.y = this.height;
            if (f.y > this.height) f.y = 0;

            const grad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 3.5);
            grad.addColorStop(0, `${f.color} ${currentAlpha})`);
            grad.addColorStop(0.4, `${f.color} ${currentAlpha * 0.4})`);
            grad.addColorStop(1, `${f.color} 0)`);

            this.ctx.beginPath();
            this.ctx.fillStyle = grad;
            this.ctx.arc(f.x, f.y, f.radius * 3.5, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw Rose Petals
        for (let p of this.petals) {
            p.y += p.speedY;
            p.x += Math.sin(p.y * 0.015) * 1.2 + p.speedX;
            p.rotation += p.rotationSpeed;
            p.flip += p.flipSpeed;

            if (p.y > this.height + 30) {
                Object.assign(p, this.createPetal(false));
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.scale(1, Math.cos((p.flip * Math.PI) / 180));
            this.ctx.globalAlpha = p.opacity;

            // Draw romantic petal shape
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
            this.ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);

            const petalGrad = this.ctx.createLinearGradient(-p.size / 2, 0, p.size / 2, p.size);
            petalGrad.addColorStop(0, "#ff758c");
            petalGrad.addColorStop(0.6, p.color);
            petalGrad.addColorStop(1, "#800c24");

            this.ctx.fillStyle = petalGrad;
            this.ctx.fill();
            this.ctx.restore();
        }

        requestAnimationFrame(this.animate);
    }
}

// Interactive Cursor Heart Sparkles
function initCursorSparkles() {
    let lastSpawn = 0;
    const colors = ["#ff4b72", "#ff8da1", "#ffd166", "#fcedc7", "#ffffff"];

    function createSparkle(x, y) {
        const now = Date.now();
        if (now - lastSpawn < 55) return;
        lastSpawn = now;

        const heart = document.createElement("div");
        heart.className = "cursor-heart-particle";
        heart.textContent = Math.random() > 0.4 ? "❤️" : "✨";
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 14 + 10}px`;
        heart.style.color = colors[Math.floor(Math.random() * colors.length)];
        heart.style.setProperty("--tx", `${(Math.random() - 0.5) * 60}px`);
        heart.style.setProperty("--ty", `${-Math.random() * 70 - 20}px`);

        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1100);
    }

    window.addEventListener("mousemove", (e) => createSparkle(e.clientX, e.clientY));
    window.addEventListener("touchmove", (e) => {
        if (e.touches && e.touches[0]) {
            createSparkle(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });
}

function createFloatingHeartAtElement(el) {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 7; i++) {
        const heart = document.createElement("div");
        heart.className = "cursor-heart-particle";
        heart.textContent = ["💖", "💕", "✨", "💍", "🌸"][i % 5];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.fontSize = `${Math.random() * 16 + 14}px`;
        heart.style.setProperty("--tx", `${(Math.random() - 0.5) * 120}px`);
        heart.style.setProperty("--ty", `${-Math.random() * 100 - 30}px`);
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1200);
    }
}

// Envelope Opening Experience (Touch & Click optimized for mobile)
function initEnvelopeExperience() {
    const envelope = document.getElementById("proposalEnvelope");
    const introCurtain = document.getElementById("introCurtain");
    const mainContent = document.getElementById("mainContent");
    const musicBtn = document.getElementById("musicToggleBtn");

    if (!envelope) return;

    let hasOpened = false;
    function openCurtain() {
        if (hasOpened) return;
        hasOpened = true;
        envelope.classList.add("opened");

        if (window.romanticAudio) {
            window.romanticAudio.init();
            window.romanticAudio.startMelody();
            if (musicBtn) musicBtn.classList.add("playing");
        }

        // Particle burst
        createFloatingHeartAtElement(envelope);

        setTimeout(() => {
            introCurtain.classList.add("fade-out");
            mainContent.classList.remove("hidden");
            mainContent.classList.add("visible");
            
            // Smoothly scroll down slightly to chapter 1
            setTimeout(() => {
                const target = document.getElementById("chapterStory");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                }
            }, 400);
        }, 900);
    }

    envelope.addEventListener("click", openCurtain);
    envelope.addEventListener("touchend", (e) => {
        e.preventDefault();
        openCurtain();
    });
}

// Playful "No" Button Mechanics (Runaway from cursor proximity & mobile touch evasion)
function initProposalButtons() {
    const btnYes = document.getElementById("btnProposalYes");
    const btnNo = document.getElementById("btnProposalNo");
    const proposalArea = document.getElementById("proposalInteractiveArea");

    if (!btnYes || !btnNo || !proposalArea) return;

    const wittyPhrases = [
        "Wait, are you sure? 🥺",
        "You love me too much! ❤️",
        "Wrong button, my cutie! 🥰",
        "Nice try! 😜💨",
        "Only YES is accepted! ✨",
        "My heart already heard YES! 💕",
        "Can't catch me! 🏃‍♀️💨",
        "I promise to love you forever! 💖",
        "Click the glowing YES! 🌟"
    ];

    let lastFleeTime = 0;

    function fleeRandomly() {
        const areaRect = proposalArea.getBoundingClientRect();
        const yesRect = btnYes.getBoundingClientRect();
        const noRect = btnNo.getBoundingClientRect();

        const padding = 15;
        const maxX = Math.max(10, areaRect.width - noRect.width - padding);
        const maxY = Math.max(10, areaRect.height - noRect.height - padding);

        const yesCenterX = (yesRect.left - areaRect.left) + yesRect.width / 2;
        const yesCenterY = (yesRect.top - areaRect.top) + yesRect.height / 2;

        let newX = padding, newY = padding;
        let attempts = 0;

        do {
            newX = Math.floor(Math.random() * maxX);
            newY = Math.floor(Math.random() * maxY);
            attempts++;
            const distToYes = Math.hypot(newX + noRect.width / 2 - yesCenterX, newY + noRect.height / 2 - yesCenterY);
            if (distToYes > 140 || attempts > 15) break;
        } while (attempts < 15);

        applyFleePosition(newX, newY);
    }

    function applyFleePosition(newX, newY) {
        runawayCount++;
        const areaRect = proposalArea.getBoundingClientRect();
        const noRect = btnNo.getBoundingClientRect();
        const padding = 15;
        const maxX = Math.max(10, areaRect.width - noRect.width - padding);
        const maxY = Math.max(10, areaRect.height - noRect.height - padding);

        const finalX = Math.max(padding, Math.min(maxX, newX));
        const finalY = Math.max(padding, Math.min(maxY, newY));

        btnNo.style.position = "absolute";
        btnNo.style.left = `${finalX}px`;
        btnNo.style.top = `${finalY}px`;
        btnNo.style.zIndex = "10";

        // Cycle through playful phrases
        const phrase = wittyPhrases[runawayCount % wittyPhrases.length];
        btnNo.textContent = phrase;

        // Make YES button grow bigger & glow more!
        const scale = Math.min(1.6, 1 + runawayCount * 0.05);
        btnYes.style.transform = `scale(${scale})`;
        btnYes.style.boxShadow = `0 0 ${25 + runawayCount * 5}px rgba(255, 75, 114, 0.95)`;

        if (window.romanticAudio) window.romanticAudio.playKissChime();
        createFloatingHeartAtElement(btnNo);
    }

    function fleeFromCursor(cursorX, cursorY) {
        const now = Date.now();
        if (now - lastFleeTime < 110) return; // smooth pacing
        lastFleeTime = now;

        const areaRect = proposalArea.getBoundingClientRect();
        const noRect = btnNo.getBoundingClientRect();
        const yesRect = btnYes.getBoundingClientRect();

        const noCenterX = noRect.left + noRect.width / 2;
        const noCenterY = noRect.top + noRect.height / 2;

        // Vector pointing directly away from approaching cursor
        let dx = noCenterX - (cursorX || noCenterX);
        let dy = noCenterY - (cursorY || noCenterY);
        const dist = Math.hypot(dx, dy) || 1;
        dx /= dist;
        dy /= dist;

        const padding = 15;
        const maxX = Math.max(10, areaRect.width - noRect.width - padding);
        const maxY = Math.max(10, areaRect.height - noRect.height - padding);

        // Current coordinates relative to container
        const currentLeft = (btnNo.style.position === "absolute") 
            ? parseFloat(btnNo.style.left) || (noRect.left - areaRect.left)
            : (noRect.left - areaRect.left);
        const currentTop = (btnNo.style.position === "absolute") 
            ? parseFloat(btnNo.style.top) || (noRect.top - areaRect.top)
            : (noRect.top - areaRect.top);

        // Push forward in the fleeing direction
        const pushDistance = 140 + Math.random() * 40;
        let newX = currentLeft + dx * pushDistance;
        let newY = currentTop + dy * pushDistance;

        // If pushing out of bounds, wrap across to open space
        if (newX < padding || newX > maxX) {
            newX = newX < padding ? maxX - 25 : padding + 25;
        }
        if (newY < padding || newY > maxY) {
            newY = newY < padding ? maxY - 25 : padding + 25;
        }

        // Avoid overlapping with btnYes
        const yesCenterX = (yesRect.left - areaRect.left) + yesRect.width / 2;
        const yesCenterY = (yesRect.top - areaRect.top) + yesRect.height / 2;
        const distToYes = Math.hypot(newX + noRect.width / 2 - yesCenterX, newY + noRect.height / 2 - yesCenterY);
        if (distToYes < 150) {
            newX = newX > yesCenterX ? Math.min(maxX, yesCenterX + 150) : Math.max(padding, yesCenterX - 150);
        }

        applyFleePosition(newX, newY);
    }

    // Proximity evasion on cursor movement (Desktop)
    window.addEventListener("mousemove", (e) => {
        const noRect = btnNo.getBoundingClientRect();
        const noCenterX = noRect.left + noRect.width / 2;
        const noCenterY = noRect.top + noRect.height / 2;
        const distance = Math.hypot(e.clientX - noCenterX, e.clientY - noCenterY);

        if (distance < 110) {
            fleeFromCursor(e.clientX, e.clientY);
        }
    });

    // Mobile touch interaction: touch anywhere near No button causes it to dart away
    proposalArea.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            const noRect = btnNo.getBoundingClientRect();
            const noCenterX = noRect.left + noRect.width / 2;
            const noCenterY = noRect.top + noRect.height / 2;
            const distance = Math.hypot(touch.clientX - noCenterX, touch.clientY - noCenterY);
            if (distance < 120) {
                fleeRandomly();
            }
        }
    }, { passive: true });

    // Direct touchstart on No button on mobile (instantly flees before click can trigger!)
    btnNo.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fleeRandomly();
    }, { passive: false });

    btnNo.addEventListener("mouseenter", (e) => {
        fleeFromCursor(e.clientX, e.clientY);
    });

    btnNo.addEventListener("click", (e) => {
        e.preventDefault();
        fleeRandomly();
    });

    // YES Button Click -> The Grand Celebration!
    btnYes.addEventListener("click", () => {
        triggerGrandCelebration();
    });
    btnYes.addEventListener("touchend", (e) => {
        e.preventDefault();
        triggerGrandCelebration();
    });
}

// Celebration / Fireworks Engine
function triggerGrandCelebration() {
    const celebrationOverlay = document.getElementById("celebrationOverlay");
    if (!celebrationOverlay) return;

    celebrationOverlay.classList.remove("hidden");
    celebrationOverlay.classList.add("active");

    // Play celebration audio fanfare
    if (window.romanticAudio) {
        window.romanticAudio.playCelebrationFanfare();
    }

    // Launch massive canvas confetti and fireworks
    launchCelebrationFireworks();

    // Populate certificate info
    const certDate = document.getElementById("certDate");
    if (certDate) {
        const today = new Date();
        certDate.textContent = today.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    const certNames = document.getElementById("certNames");
    if (certNames) {
        certNames.textContent = `${appData.proposerName} & ${appData.partnerName}`;
    }

    // Setup share buttons
    setupCelebrationActions();
}

function launchCelebrationFireworks() {
    const canvas = document.getElementById("celebrationCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#ff4b72", "#ffd166", "#06d6a0", "#118ab2", "#e8a598", "#ffffff", "#ff8da1"];

    function createRocket(targetX, targetY) {
        const count = 75;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 8 + 3;
            particles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008,
                shape: Math.random() > 0.4 ? "circle" : "heart"
            });
        }
    }

    // Initial volley of fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createRocket(
                Math.random() * (canvas.width * 0.7) + canvas.width * 0.15,
                Math.random() * (canvas.height * 0.5) + canvas.height * 0.15
            );
        }, i * 350);
    }

    // Recurring fireworks bursts
    const fireworkInterval = setInterval(() => {
        if (!document.getElementById("celebrationOverlay").classList.contains("active")) {
            clearInterval(fireworkInterval);
            return;
        }
        createRocket(
            Math.random() * (canvas.width * 0.8) + canvas.width * 0.1,
            Math.random() * (canvas.height * 0.5) + canvas.height * 0.15
        );
    }, 900);

    function animateCelebration() {
        ctx.fillStyle = "rgba(11, 9, 20, 0.22)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.08; // gravity
            p.vx *= 0.98;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;

            if (p.shape === "heart") {
                ctx.translate(p.x, p.y);
                ctx.font = "16px sans-serif";
                ctx.fillText("❤️", 0, 0);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        requestAnimationFrame(animateCelebration);
    }

    animateCelebration();
}

function setupCelebrationActions() {
    const btnWhatsApp = document.getElementById("btnShareWhatsApp");
    if (btnWhatsApp) {
        btnWhatsApp.onclick = () => {
            const text = encodeURIComponent(`I SAID YES! ❤️🥰 I love you so much! ${appData.partnerName} and ${appData.proposerName} are officially together now! ✨`);
            window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
        };
    }

    const btnPrint = document.getElementById("btnPrintCert");
    if (btnPrint) {
        btnPrint.onclick = () => {
            window.print();
        };
    }

    const btnClose = document.getElementById("btnCloseCelebration");
    if (btnClose) {
        btnClose.onclick = () => {
            const celebrationOverlay = document.getElementById("celebrationOverlay");
            if (celebrationOverlay) celebrationOverlay.classList.remove("active");
        };
    }
}

// Customizer Modal & Settings Logic
function initCustomizer() {
    const modal = document.getElementById("customizerModal");
    const openBtn = document.getElementById("openCustomizerBtn");
    const closeBtn = document.getElementById("closeCustomizerBtn");
    const saveBtn = document.getElementById("saveCustomizerBtn");
    const resetBtn = document.getElementById("resetCustomizerBtn");
    const shareBtn = document.getElementById("copyShareLinkBtn");
    const hideBtn = document.getElementById("hideEditorBtn");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            populateCustomizerInputs();
            modal.classList.add("active");
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.classList.remove("active");
        });
    }

    // Secret shortcut Shift+E to open customizer
    window.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key.toLowerCase() === "e") {
            modal.classList.toggle("active");
            populateCustomizerInputs();
        }
    });

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            readCustomizerInputs();
            saveProposalData();
            updateDOMWithData();
            modal.classList.remove("active");
            showToast("✨ Proposal personalized & saved!");
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (confirm("Reset everything to original defaults?")) {
                localStorage.removeItem("romantic_proposal_config");
                appData = { ...DEFAULT_CONFIG };
                updateDOMWithData();
                populateCustomizerInputs();
                modal.classList.remove("active");
                showToast("Reset to romantic defaults.");
            }
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener("click", () => {
            readCustomizerInputs();
            saveProposalData();
            const link = generateShareableLink();
            navigator.clipboard.writeText(link).then(() => {
                showToast("💍 Secret Surprise Link copied to clipboard!");
            }).catch(() => {
                prompt("Copy this surprise link:", link);
            });
        });
    }

    if (hideBtn) {
        hideBtn.addEventListener("click", () => {
            document.body.classList.add("presentation-mode");
            modal.classList.remove("active");
            showToast("Presentation Mode active! Customizer hidden. Press Shift+E to reveal.");
        });
    }

    // Custom Photo Upload handlers
    setupPhotoUpload();
}

function populateCustomizerInputs() {
    const fPartner = document.getElementById("inputPartnerName");
    const fProposer = document.getElementById("inputProposerName");
    const fQuestion = document.getElementById("inputQuestion");
    const fDate = document.getElementById("inputAnniversaryDate");
    const fSubtitle = document.getElementById("inputSubtitle");
    const fLetter = document.getElementById("inputLetter");
    const fReasons = document.getElementById("inputReasons");

    if (fPartner) fPartner.value = appData.partnerName;
    if (fProposer) fProposer.value = appData.proposerName;
    if (fQuestion) fQuestion.value = appData.proposalQuestion;
    if (fSubtitle) fSubtitle.value = appData.proposalSubtitle;
    if (fLetter) fLetter.value = appData.loveLetter;
    if (fReasons) fReasons.value = appData.reasons.join("\n");
    if (fDate) {
        // Format to YYYY-MM-DDThh:mm for datetime-local
        try {
            const d = new Date(appData.anniversaryDate);
            const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            fDate.value = iso;
        } catch (e) {
            fDate.value = "2023-05-14T19:30";
        }
    }
}

function readCustomizerInputs() {
    const fPartner = document.getElementById("inputPartnerName");
    const fProposer = document.getElementById("inputProposerName");
    const fQuestion = document.getElementById("inputQuestion");
    const fDate = document.getElementById("inputAnniversaryDate");
    const fSubtitle = document.getElementById("inputSubtitle");
    const fLetter = document.getElementById("inputLetter");
    const fReasons = document.getElementById("inputReasons");

    if (fPartner && fPartner.value.trim()) appData.partnerName = fPartner.value.trim();
    if (fProposer && fProposer.value.trim()) appData.proposerName = fProposer.value.trim();
    if (fQuestion && fQuestion.value.trim()) appData.proposalQuestion = fQuestion.value.trim();
    if (fSubtitle && fSubtitle.value.trim()) appData.proposalSubtitle = fSubtitle.value.trim();
    if (fLetter && fLetter.value.trim()) appData.loveLetter = fLetter.value.trim();
    if (fDate && fDate.value) appData.anniversaryDate = new Date(fDate.value).toISOString();

    if (fReasons && fReasons.value.trim()) {
        const split = fReasons.value.split("\n").map(r => r.trim()).filter(Boolean);
        if (split.length > 0) {
            appData.reasons = split;
            currentReasonIndex = 0;
        }
    }
}

function setupPhotoUpload() {
    const fileInput = document.getElementById("customPhotoInput");
    if (!fileInput) return;

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            appData.photos.unshift({
                url: base64,
                title: "Our Favorite Memory",
                date: "Forever in My Heart",
                caption: "Every day with you is my new favorite day."
            });
            renderPhotoGallery();
            saveProposalData();
            showToast("📸 Photo added to Our Cherished Memories!");
        };
        reader.readAsDataURL(file);
    });
}

// Toast helper
function showToast(msg) {
    let toast = document.getElementById("appToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "appToast";
        toast.className = "app-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 3200);
}

// Global Audio Toggle Button
function initAudioControls() {
    const musicBtn = document.getElementById("musicToggleBtn");
    if (!musicBtn) return;

    musicBtn.addEventListener("click", () => {
        if (!window.romanticAudio) return;
        const playing = window.romanticAudio.toggle();
        if (playing) {
            musicBtn.classList.add("playing");
            musicBtn.title = "Pause romantic music";
        } else {
            musicBtn.classList.remove("playing");
            musicBtn.title = "Play romantic music";
        }
    });
}

// Init everything upon DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    loadProposalData();
    updateDOMWithData();
    initLoveCounter();
    new AmbientAtmosphere();
    initCursorSparkles();
    initEnvelopeExperience();
    initProposalButtons();
    initCustomizer();
    initAudioControls();

    // Reason buttons
    const btnNext = document.getElementById("btnNextReason");
    if (btnNext) btnNext.addEventListener("click", nextReason);

    const btnPrev = document.getElementById("btnPrevReason");
    if (btnPrev) btnPrev.addEventListener("click", prevReason);

    // Lightbox close
    const lightboxModal = document.getElementById("lightboxModal");
    if (lightboxModal) {
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal || e.target.classList.contains("lightbox-close")) {
                closeLightbox();
            }
        });
    }
});
