const ATTENDANCE_URL =
    "https://alighadimi2020.github.io/employee/attendance/checkin.html";

let qrScanner = null;
let qrProcessing = false;

function getSession() {
    try {
        return JSON.parse(localStorage.getItem("ariotejarat_session")) || null;
    } catch {
        return null;
    }
}

function normalizeQrUrl(value) {
    try {
        const url = new URL(value);

        return (
            url.origin + url.pathname
        ).replace(/\/+$/, "");
    } catch {
        return String(value).trim().replace(/\/+$/, "");
    }
}

function isValidAttendanceQr(value) {
    return normalizeQrUrl(value) === normalizeQrUrl(ATTENDANCE_URL);
}

async function startQrScanner() {
    const session = getSession();

    if (!session || session.role !== "employee") {
        alert("ابتدا وارد حساب کاربری کارکنان شوید.");
        return;
    }

    const box = document.getElementById("qrScannerBox");
    const status = document.getElementById("qrScannerStatus");

    box.hidden = false;
    status.textContent = "دوربین در حال آماده‌سازی است...";

    qrProcessing = false;

    qrScanner = new Html5Qrcode("qr-reader");

    try {
        await qrScanner.start(
            {
                facingMode: "environment"
            },
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },
            async decodedText => {
                if (qrProcessing) {
                    return;
                }

                if (!isValidAttendanceQr(decodedText)) {
                    status.textContent =
                        "این QR مربوط به ثبت حضور آریو تجارت نیست.";
                    return;
                }

                qrProcessing = true;

                status.textContent = "QR شناسایی شد...";

                await stopQrScanner();

                window.location.href =
                    "../attendance/checkin.html";
            },
            () => {}
        );

        status.textContent = "QR را داخل کادر قرار دهید.";
    } catch (error) {
        console.error(error);

        status.textContent =
            "دسترسی به دوربین امکان‌پذیر نشد. مجوز دوربین را بررسی کنید.";
    }
}

async function stopQrScanner() {
    if (!qrScanner) {
        return;
    }

    try {
        await qrScanner.stop();
    } catch (error) {
        console.error(error);
    }

    try {
        qrScanner.clear();
    } catch (error) {
        console.error(error);
    }

    qrScanner = null;
}

document.addEventListener("DOMContentLoaded", () => {
    const startButton =
        document.getElementById("startQrScanner");

    const stopButton =
        document.getElementById("stopQrScanner");

    if (startButton) {
        startButton.addEventListener(
            "click",
            startQrScanner
        );
    }

    if (stopButton) {
        stopButton.addEventListener(
            "click",
            stopQrScanner
        );
    }
});
