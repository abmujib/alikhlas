function checkAccess() {
    const role = localStorage.getItem("role");
    const nama = localStorage.getItem("nama_lengkap");
    const currentPage = window.location.pathname.split("/").pop();

    // 1. Cek jika belum login
    if (!role) {
        window.location.href = "index.html";
        return;
    }

    // 2. Tampilkan Nama & Role Otomatis (Jika elemennya ada)
    // Pastikan di HTML Anda ada elemen <span id="welcomeText"></span>
    const welcomeEl = document.getElementById("welcomeText");
    if (welcomeEl && nama) {
        welcomeEl.innerText = `${nama} (${role})`;
    }

    // 3. Aturan Akses dengan SweetAlert
    const denyAccess = (msg, target) => {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: msg,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = target;
            });
        } else {
            alert(msg);
            window.location.href = target;
        }
    };

    if (currentPage === "dashboard.html" && role !== "Admin") {
        denyAccess("Hanya Admin yang dapat mengakses Dashboard.", role === "Bendahara" ? "transaksi.html" : "laporan.html");
    } 
    else if (currentPage === "transaksi.html" && (role !== "Bendahara" && role !== "Admin")) {
        denyAccess("Hanya Bendahara atau Admin yang dapat melakukan transaksi.", "laporan.html");
    }
}

// FUNGSI LOGOUT
function logout() {
    Swal.fire({
        title: 'Keluar?',
        text: "Sesi Anda akan berakhir.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = "index.html";
        }
    });
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", checkAccess);