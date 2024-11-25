document.addEventListener('DOMContentLoaded', async () => {
    const eventFeed = document.querySelector('.event-feed-container');

    try {
        // เรียก API เพื่อดึงข้อมูล Event
        const response = await fetch('/getEvents');
        if (!response.ok) {
            throw new Error('Failed to fetch events');
        }

        const events = await response.json();

        // ตรวจสอบว่ามี Event หรือไม่
        if (events.length === 0) {
            eventFeed.innerHTML = '<p>No events available. Create a new event!</p>';
            return;
        }

        // แสดงเฉพาะ Event ที่ join_event !== 0
        events.forEach(event => {
            if (event.join_event === 0) {
                return; // ข้าม Event ที่ join_event = 0
            }

            const eventCard = document.createElement('div');
            eventCard.classList.add('event-card');
            eventCard.innerHTML = `
                <h3>${event.name}</h3>
                <p>Date: ${event.date} | Time: ${event.time}</p>
                <p>Location: ${event.location}</p>
                <p>${event.description}</p>
                
                
                <button class="join-btn" data-id="${event.id}">Join</button>
            `;
            eventFeed.appendChild(eventCard);
        });

        // เพิ่ม Event Listener สำหรับปุ่ม Join
        eventFeed.addEventListener('click', async (e) => {
            if (e.target.classList.contains('join-btn')) {
                const eventId = e.target.getAttribute('data-id'); // ดึง ID ของ Event
                try {
                    // เรียก API เพื่ออัปเดต join_event ใน DB
                    const response = await fetch(`/updateJoinEvent/${eventId}`, { method: 'PATCH' });
                    if (!response.ok) {
                        throw new Error('Failed to update event');
                    }
                    alert('You have successfully joined this event!');
                    location.reload(); // Reload หน้า
                } catch (error) {
                    console.error('Error updating event:', error);
                    alert('Failed to join event. Please try again.');
                }
            }
        });

    } catch (error) {
        console.error('Error loading events:', error);
        eventFeed.innerHTML = '<p>Failed to load events. Please try again later.</p>';
    }

    // Carousel Logic (คงเดิม)
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const dotsNav = document.querySelector('.carousel-dots');
    const dots = Array.from(dotsNav.children);

    const slideWidth = slides[0].getBoundingClientRect().width;

    slides.forEach((slide, index) => {
        slide.style.left = `${slideWidth * index}px`; // ใช้ backticks เพื่อใส่ค่าภายใน string
    });

    const moveToSlide = (track, currentSlide, targetSlide) => {
        track.style.transform = `translateX(-${targetSlide.style.left})`; // ใช้ backticks สำหรับการแทรกตัวแปร
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    nextButton.addEventListener('click', () => {
        const currentSlide = track.querySelector('.current-slide');
        const nextSlide = currentSlide.nextElementSibling;
        moveToSlide(track, currentSlide, nextSlide);
    });

    prevButton.addEventListener('click', () => {
        const currentSlide = track.querySelector('.current-slide');
        const prevSlide = currentSlide.previousElementSibling;
        moveToSlide(track, currentSlide, prevSlide);
    });
});