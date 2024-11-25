function goToLogin() {
    window.location.href = "login.html";
}
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const profileResponse = await fetch('/getProfile');
        if (!profileResponse.ok) throw new Error('Failed to fetch profile');
        const profileData = await profileResponse.json();

        // อัปเดตข้อมูลโปรไฟล์
        document.getElementById('username').innerText = profileData.username || 'N/A';
        document.getElementById('email').innerText = `Email: ${profileData.email || 'N/A'}`;
        document.getElementById('phone').innerText = `Phone: ${profileData.phone || 'N/A'}`;
        document.getElementById('profilePicture').src = profileData.photo || 'placeholder.jpg';
       console.log('Profile picture path:', profileData.photo);

     // ดึงข้อมูล Event ที่ join_event = 0
     const eventsResponse = await fetch(`/getUserEvents?username=${profileData.username}`);
        if (!eventsResponse.ok) {
            throw new Error('Failed to fetch events');
        }
        const eventsData = await eventsResponse.json();

        // เพิ่มการ์ด Event ลงใน event-list
        const eventList = document.querySelector('.event-list');
        if (eventsData.length > 0) {
            eventsData.forEach(event => {
                const eventCard = document.createElement('div');
                eventCard.classList.add('event-card');
                eventCard.innerHTML = `
                    <h3>${event.name}</h3>
                    <p>Date: ${event.date} | Time: ${event.time}</p>
                    <p>Location: ${event.location}</p>
                    <p>${event.description}</p>
                `;
                eventList.appendChild(eventCard);
            });
        } else {
            eventList.innerHTML = '<p>No events joined yet.</p>';
        }
        } catch (error) {
        console.error('Error:', error);
        document.querySelector('.event-list').innerHTML = '<p>Failed to load events. Please try again later.</p>';
        }
    });
        // ดักจับฟอร์มอัปโหลดรูป
        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            const fileInput = document.getElementById('profilePicInput');
            formData.append('profilePic', fileInput.files[0]);

            const uploadResponse = await fetch('/uploadProfilePic', {
                method: 'POST',
                body: formData
            });

            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                document.getElementById('profilePicture').src = result.photo; // อัปเดตรูปใหม่
            } else {
                alert('Failed to upload profile picture.');
            }
        });
    
document.getElementById('logoutButton').addEventListener('click', () => {
    // ลบข้อมูล session หรือ token
    fetch('/logout', {
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            // นำผู้ใช้ไปยังหน้า login
            window.location.href = '/login.html';
        } else {
            alert('Failed to logout. Please try again.');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    });
});
