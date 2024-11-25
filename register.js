function goToLogin() {
    window.location.href = "login.html";
}

       document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();  // ป้องกันไม่ให้ฟอร์ม submit โดยปกติ

            const data = {
                username: document.getElementById('username').value,
                password: document.getElementById('password').value,
                email: document.getElementById('email').value,
                age: document.getElementById('age').value,
                phone: document.getElementById('phone').value
            };

            try {
                const response = await fetch('/regisDB', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.text();
                const responseMessage = document.getElementById('responseMessage');
                
                if (responseMessage) {
                    responseMessage.innerText = result; // แสดงผลข้อความจากเซิร์ฟเวอร์
                } else {
                    console.error('Element #responseMessage not found');
                }

                // ถ้าการลงทะเบียนสำเร็จให้ไปหน้า login.html
                if (response.ok) {
                    window.location.href = "login.html";  // เปลี่ยนไปที่หน้า login.html
                }
            } catch (error) {
                console.error('Error:', error);
                const responseMessage = document.getElementById('responseMessage');
                if (responseMessage) {
                    responseMessage.innerText = 'Failed to register.';
                }
            }
        });
