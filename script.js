
const jalan = document.getElementById("jalan");
const player = document.getElementById("player");
const musuh1 = document.getElementById("musuh1");
const musuh2 = document.getElementById("musuh2");
const skorText = document.getElementById("skor");
const highscoreText = document.getElementById("highscore");
const statusText = document.getElementById("status");
const overlay = document.getElementById("overlay");
const pesan = document.getElementById("pesan");
const levelSelect = document.getElementById("level");

const jalur = [20, 115, 205];

let posisiPlayer = 115;
let posisiMusuh1 = 20;
let posisiMusuh2 = 205;

let yMusuh1 = -100;
let yMusuh2 = -350;

let skor = 0;
let highscore = 0;
let kecepatan = 3;
let bermain = false;
let animasi = null;
let waktuTerakhir = 0;

// Ambil high score dari browser
try {
    highscore = Number(
        localStorage.getItem("highscoreDaffa")
    ) || 0;
} catch (error) {
    highscore = 0;
}

highscoreText.textContent = highscore;

// Pilih jalur secara acak
function jalurAcak() {
    return jalur[Math.floor(Math.random() * jalur.length)];
}

// Mulai atau restart game
function mulaiGame() {
    if (animasi !== null) {
        cancelAnimationFrame(animasi);
    }

    posisiPlayer = 115;
    posisiMusuh1 = jalurAcak();
    posisiMusuh2 = jalurAcak();

    yMusuh1 = -100;
    yMusuh2 = -350;

    skor = 0;
    waktuTerakhir = 0;

    const level = levelSelect.value;

    if (level === "easy") {
        kecepatan = 3;
    } else if (level === "medium") {
        kecepatan = 5;
    } else {
        kecepatan = 7;
    }

    bermain = true;

    player.style.left = posisiPlayer + "px";

    musuh1.style.left = posisiMusuh1 + "px";
    musuh2.style.left = posisiMusuh2 + "px";

    musuh1.style.top = yMusuh1 + "px";
    musuh2.style.top = yMusuh2 + "px";

    skorText.textContent = skor;
    statusText.textContent = "🏁 BALAPAN DIMULAI!";

    overlay.style.display = "none";
    jalan.classList.add("berjalan");

    animasi = requestAnimationFrame(updateGame);
}

// Gerakkan mobil pemain
function gerakKiri() {
    if (!bermain) return;

    const index = jalur.indexOf(posisiPlayer);

    if (index > 0) {
        posisiPlayer = jalur[index - 1];
    }

    player.style.left = posisiPlayer + "px";
}

function gerakKanan() {
    if (!bermain) return;

    const index = jalur.indexOf(posisiPlayer);

    if (index < jalur.length - 1) {
        posisiPlayer = jalur[index + 1];
    }

    player.style.left = posisiPlayer + "px";
}

// Kontrol keyboard
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" ||
        event.key === "ArrowRight") {
        event.preventDefault();
    }

    if (event.repeat) return;

    if (event.key === "ArrowLeft") {
        gerakKiri();
    }

    if (event.key === "ArrowRight") {
        gerakKanan();
    }
});

// Periksa tabrakan
function cekTabrakan(musuh, y) {
    const posisiX = parseInt(musuh.style.left);

    return (
        posisiPlayer === posisiX &&
        y + 65 > 415 &&
        y < 480
    );
}

// Tambah skor
function tambahSkor() {
    skor++;
    skorText.textContent = skor;

    if (skor > highscore) {
        highscore = skor;
        highscoreText.textContent = highscore;

        try {
            localStorage.setItem(
                "highscoreDaffa",
                highscore
            );
        } catch (error) {
            // Game tetap berjalan jika penyimpanan diblokir
        }
    }
}

// Game Over
function gameOver() {
    bermain = false;
    animasi = null;

    jalan.classList.remove("berjalan");

    overlay.style.display = "flex";
    pesan.textContent = "💥 GAME OVER!";

    statusText.textContent =
        "Skor kamu: " + skor + " | Klik MULAI untuk restart";
}

// Loop utama game
function updateGame(waktu) {
    if (!bermain) return;

    if (!waktuTerakhir) {
        waktuTerakhir = waktu;
    }

    const delta = Math.min(
        (waktu - waktuTerakhir) / 16.67, 3
    );

    waktuTerakhir = waktu;

    // Gerakkan musuh
    yMusuh1 += kecepatan * delta;
    yMusuh2 += kecepatan * delta;

    // Musuh pertama melewati pemain
    if (yMusuh1 > 500) {
        yMusuh1 = -100;
        posisiMusuh1 = jalurAcak();
        musuh1.style.left = posisiMusuh1 + "px";
        tambahSkor();
    }

    // Musuh kedua melewati pemain
    if (yMusuh2 > 500) {
        yMusuh2 = -100;
        posisiMusuh2 = jalurAcak();
        musuh2.style.left = posisiMusuh2 + "px";
        tambahSkor();
    }

    musuh1.style.top = yMusuh1 + "px";
    musuh2.style.top = yMusuh2 + "px";

    // Cek apakah mobil bertabrakan
    if (
        cekTabrakan(musuh1, yMusuh1) ||
        cekTabrakan(musuh2, yMusuh2)
    ) {
        gameOver();
        return;
    }

    // Game semakin cepat
    const level = levelSelect.value;
    let dasar = 3;

    if (level === "medium") dasar = 5;
    if (level === "hard") dasar = 7;

    kecepatan = dasar + skor * 0.15;

    animasi = requestAnimationFrame(updateGame);
}
