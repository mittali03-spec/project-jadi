
/* ==========================================
   PROJECT J.A.D.I.
   Journey Across Dimensions & Infinity
   ========================================== */

const $ = (selector) => document.querySelector(selector);

const screens = document.querySelectorAll(".screen");
const startBtn = $("#startBtn");
const puzzleForm = $("#puzzleForm");
const secretCode = $("#secretCode");
const puzzleFeedback = $("#puzzleFeedback");
const celebrateBtn = $("#celebrateBtn");
const wishMessage = $("#wishMessage");
const restartBtn = $("#restartBtn");
const confettiLayer = $("#confettiLayer");

let audioContext = null;
let soundEnabled = true;
let starAnimationId = null;

/* ------------------------------------------
   SCREEN NAVIGATION
------------------------------------------ */



function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("active");
        screen.style.display = "none";
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
        target.style.display = "flex";
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        console.error("Screen not found:", screenId);
    }
}

document.querySelectorAll(".next-btn").forEach((button) => {
    button.addEventListener("click", () => {
        showScreen(button.dataset.next);
    });
});



/* ------------------------------------------
   MOVING STARFIELD
------------------------------------------ */

const canvas = $("#starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let width = 0;
let height = 0;
let pixelRatio = 1;

function resizeStarfield() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const starCount = Math.min(
        220,
        Math.max(80, Math.floor((width * height) / 6500))
    );

    stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.25,
        alpha: Math.random() * 0.7 + 0.2,
        speed: Math.random() * 0.35 + 0.08,
        twinkle: Math.random() * 0.03 + 0.005,
        direction: Math.random() > 0.5 ? 1 : -1
    }));
}

function drawStarfield() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
        star.y += star.speed;
        star.alpha += star.twinkle * star.direction;

        if (star.alpha >= 1 || star.alpha <= 0.15) {
            star.direction *= -1;
        }

        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(230, 205, 255, ${star.alpha})`;
        ctx.shadowBlur = star.radius > 1.2 ? 8 : 0;
        ctx.shadowColor = "#b982ff";
        ctx.fill();
    });

    ctx.shadowBlur = 0;
    starAnimationId = requestAnimationFrame(drawStarfield);
}

resizeStarfield();
drawStarfield();

window.addEventListener("resize", resizeStarfield);

/* ------------------------------------------
   OPTIONAL COSMIC SOUND EFFECTS

   Browsers require a user interaction before
   sound can start. This code creates the
   sounds directly, without an audio file.
------------------------------------------ */

function getAudioContext() {
    const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
        return null;
    }

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}

function playTone(frequency, startTime, duration, volume, type = "sine") {
    const audio = getAudioContext();

    if (!audio || !soundEnabled) {
        return;
    }

    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0002, volume),
        startTime + 0.025
    );
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.04);
}

function playSignalSound() {
    const audio = getAudioContext();

    if (!audio || !soundEnabled) {
        return;
    }

    const now = audio.currentTime;

    // Three electronic signal beeps
    playTone(660, now, 0.22, 0.18, "square");
    playTone(880, now + 0.25, 0.22, 0.18, "square");
    playTone(1100, now + 0.5, 0.45, 0.20, "sine");

    // A low cosmic confirmation tone
    playTone(110, now + 0.65, 0.7, 0.15, "sine");
}

function playUnlockSound() {
    const audio = getAudioContext();

    if (!audio || !soundEnabled) {
        return;
    }

    const now = audio.currentTime;

    playTone(523.25, now, 0.25, 0.15);
    playTone(659.25, now + 0.14, 0.25, 0.15);
    playTone(783.99, now + 0.28, 0.45, 0.17);
}


function playCelebrationSound() {
    const audio = getAudioContext();

    if (!audio || !soundEnabled) {
        return;
    }

    // Happy Birthday — gentle music-box style
    const melody = [
        [392, 0.30], [392, 0.30], [440, 0.55], [392, 0.55], [523.25, 0.55], [493.88, 0.85],
        [392, 0.30], [392, 0.30], [440, 0.55], [392, 0.55], [587.33, 0.55], [523.25, 0.85],
        [392, 0.30], [392, 0.30], [783.99, 0.55], [659.25, 0.55], [523.25, 0.55], [493.88, 0.55], [440, 0.85],
        [698.46, 0.30], [698.46, 0.30], [659.25, 0.55], [523.25, 0.55], [587.33, 0.55], [523.25, 1.0]
    ];

    let time = audio.currentTime + 0.08;

    melody.forEach(([frequency, duration]) => {
        playTone(frequency, time, duration, 0.12, "sine");
        time += duration + 0.07;
    });
}


/* ------------------------------------------
   INITIATE CONNECTION
------------------------------------------ */

startBtn.addEventListener("click", () => {
    // This user click enables audio in compatible browsers.
    getAudioContext();
    playSignalSound();

    showScreen("signal");
});
/* ------------------------------------------
   BIRTHDAY ACCESS CODE

   12 October = 1210
------------------------------------------ */

puzzleForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const enteredCode = secretCode.value.trim();

    if (enteredCode === "1210") {
       
playUnlockSound();

// Prepare audio during the user's button click
getAudioContext();

setTimeout(() => {
    showScreen("birthday");

    // Automatically play the birthday melody
    playCelebrationSound();

    // Automatically launch the sprinkles
    launchConfetti();
}, 900);

    } else {
        puzzleFeedback.textContent =
            "ACCESS DENIED. TRY AGAIN, ASTRONAUT. HINT: DDMM.";

        puzzleFeedback.style.color = "#ff9ab5";

        secretCode.value = "";
        secretCode.focus();
    }
});

/* ------------------------------------------
   BIRTHDAY WISH CELEBRATION
------------------------------------------ */


function launchConfetti() {
    if (!confettiLayer) return;

    confettiLayer.innerHTML = "";

    const colors = [
        "#bd82ff",
        "#e2c6ff",
        "#d8b77b",
        "#ffffff",
        "#8e65d4",
        "#f5b8ee"
    ];

    for (let i = 0; i < 150; i++) {
        const piece = document.createElement("span");

        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.top = `${-10 - Math.random() * 30}px`;

        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDuration =
            `${3 + Math.random() * 4}s`;

        piece.style.animationDelay =
            `${Math.random() * 1.5}s`;

        piece.style.width =
            `${4 + Math.random() * 6}px`;

        piece.style.height =
            `${8 + Math.random() * 10}px`;

        confettiLayer.appendChild(piece);
    }

    setTimeout(() => {
        confettiLayer.innerHTML = "";
    }, 10000);
}


/* ------------------------------------------
   PLAY BIRTHDAY MUSIC + CONFETTI
------------------------------------------ */

celebrateBtn.addEventListener("click", () => {
    getAudioContext();
    playCelebrationSound();
    launchConfetti();

    wishMessage.classList.add("show");

    celebrateBtn.innerHTML =
        "<span>HAPPY BIRTHDAY, JADI! ✨</span><span>♡</span>";

    celebrateBtn.disabled = true;
    celebrateBtn.style.opacity = "0.8";
});

/* ------------------------------------------
   REPLAY THE EXPERIENCE
------------------------------------------ */

restartBtn.addEventListener("click", () => {
    secretCode.value = "";
    puzzleFeedback.textContent = "";

    wishMessage.classList.remove("show");

    celebrateBtn.disabled = false;
    celebrateBtn.style.opacity = "1";
    celebrateBtn.innerHTML =
        "<span>MAKE A WISH ✨</span><span class='button-arrow'>↗</span>";

    confettiLayer.innerHTML = "";

    showScreen("hero");
});

/* ------------------------------------------
   PORTAL INTERACTION
------------------------------------------ */

const portal = $("#portal");

portal.addEventListener("pointermove", (event) => {
    if (window.innerWidth <= 650) {
        return;
    }

    const rect = portal.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    portal.style.transform =
        `perspective(700px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
});

portal.addEventListener("pointerleave", () => {
    portal.style.transform = "";
});

/* ------------------------------------------
   SEND AND SAVE TRUSHNAA'S BIRTHDAY WISH
------------------------------------------ */

const wishForm = document.querySelector("#wishForm");
const wishFeedback = document.querySelector("#wishFeedback");

if (wishForm && wishFeedback) {
    wishForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = wishForm.querySelector(
            'button[type="submit"]'
        );

        const originalButtonText = submitButton.innerHTML;

        submitButton.disabled = true;
        submitButton.textContent = "SENDING YOUR WISH... ✨";
        wishFeedback.textContent = "";

        const formData = new FormData(wishForm);
        formData.append(
            "_subject",
            "A Birthday Wish from Trushnaa — PROJECT J.A.D.I."
        );

        try {
            const response = await fetch(
                "https://formspree.io/f/xjygorqk",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

           if (!response.ok) {
    const errorData = await response.json();
    console.error("Formspree error:", errorData);

    throw new Error(
        errorData.errors?.map(error => error.message).join(", ") ||
        "The wish could not be submitted."
    );
}

            wishFeedback.textContent =
                "Your wish has reached the stars. 💜✨";

            wishForm.reset();
    } catch (error) {
    console.error("Wish submission failed:", error);

    wishFeedback.textContent =
        "Your wish could not be sent: " + error.message;

        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

console.log("PROJECT J.A.D.I. initialized successfully.");
console.log("Access code hint: DDMM");
