document.getElementById('createEventForm').addEventListener('submit', async (e) => {
    e.preventDefault();

   // เรียก /getProfile เพื่อดึง username
   const profileResponse = await fetch('/getProfile');
   if (!profileResponse.ok) {
       throw new Error('Failed to fetch profile');
   }

   const profileData = await profileResponse.json();
   const username = profileData.username; // ดึง username จาก response

   // ดึงข้อมูลจากฟอร์ม
   const eventName = document.getElementById('eventName').value;
   const eventDate = document.getElementById('eventDate').value;
   const eventTime = document.getElementById('eventTime').value;
   const eventLocation = document.getElementById('eventLocation').value;
   const eventDescription = document.getElementById('eventDescription').value;
   const eventJoin = 1;
   const upload_image = 'photo.jpeg'; // ค่า default ของรูปภาพ

   

   // สร้างอ็อบเจ็กต์สำหรับข้อมูลอีเวนต์
   const newEvent = {
       name: eventName,
       date: eventDate,
       time: eventTime,
       location: eventLocation,
       description: eventDescription,
       upload_image, // ใส่ 'photo.jpeg'
       username, // ใช้ username ที่ดึงจาก /getProfile
       eventJoin
   };

    try {
        // ส่งข้อมูลไปที่ Backend
        const response = await fetch('/registerEvent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent),
        });

        if (!response.ok) {
            throw new Error('Failed to create event');
        }

        const responseData = await response.json();
        alert('Event Created Successfully!');

        // ล้างข้อมูลในฟอร์ม
        e.target.reset();

        // เปลี่ยนหน้าไป Home
        window.location.href = "home.html";
    } catch (error) {
        console.error('Error adding event:', error);
        alert('Failed to create event. Please try again.');
    }
});