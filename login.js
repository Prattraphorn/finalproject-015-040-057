function goToNextPage() {
    window.location.href = "register.html";
}

function goToLogin() {
    window.location.href = "login.html";
}

function goToHome() {
    // สร้างคุกกี้ 'username' เมื่อผู้ใช้ล็อกอิน
    document.cookie = "username=; path=/; max-age=" + 60*60*24*30; // คุกกี้จะหมดอายุใน 30 วัน

    // เปลี่ยนหน้าไปที่ home.html
    window.location.href = "home.html"; 
    
    // แสดงข้อความใน Console
    console.log('Login success!');
}



document.querySelector('.form').addEventListener('submit', function (e) {
    const username = document.querySelector('input[name="username"]').value.trim();
    const password = document.querySelector('input[name="password"]').value.trim();
    
    if (!username || !password) {
        e.preventDefault(); // หยุดการส่งฟอร์ม
        document.getElementById('errordisplay').textContent = 'Please fill in both fields.';
    } else {
        document.getElementById('errordisplay').textContent = ''; // ล้างข้อความแสดงข้อผิดพลาด
    }
});

