const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use('/Finalproject/pic', express.static('Finalproject/pic'));
app.use('/uploads', express.static('uploads')); // ให้บริการไฟล์จากโฟลเดอร์ 'uploads'

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eventease_db'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});
app.post('/checkLogin', async (req, res) => {
    const { username, password } = req.body;
    console.log('Username:', username); // ตรวจสอบค่า username
    console.log('Password:', password); // ตรวจสอบค่า password

    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    try {
        const result = await queryDB(sql, [username, password]);

        if (result.length > 0) {
            console.log('Login successful for user:', username); // Debug
            res.cookie('username', username, { httpOnly: true }); // ตั้งคุกกี้
            res.redirect('/profile.html'); // ไปที่หน้าโปรไฟล์
        } else {
            console.log('Invalid login attempt'); // Debug
            res.redirect('/login.html?error=1');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.redirect('/login.html?error=2');
    }
});

// อัปโหลดรูปโปรไฟล์
app.post('/uploadProfilePic', upload.single('profilePic'), async (req, res) => {
    try {
        console.log('Uploaded File:', req.file);
        console.log('Username from cookie:', req.cookies.username);

        const username = req.cookies.username;
        if (!username) return res.status(401).json({ message: 'No logged-in user' });

        const photoPath = `/uploads/${req.file.filename}`;
        console.log('Photo path to save:', photoPath);

        // อัปเดตเส้นทางรูปในฐานข้อมูล
        await queryDB('UPDATE users SET photo = ? WHERE username = ?', [photoPath, username]);

        res.status(200).json({ photo: photoPath });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.get('/getProfile', async (req, res) => {
    try {
        const username = req.cookies.username;

        if (!username) {
            console.log('No username found in cookies');
            return res.status(401).json({ message: 'No logged-in user found' });
        }

        const result = await queryDB('SELECT username, email, phone, photo FROM users WHERE username = ?', [username]);

        if (result.length > 0) {
            console.log('User data from database:', result[0]);
            res.json(result[0]);
        } else {
            console.log('No user found in database with username:', username);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Helper function for database queries
const queryDB = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

// Endpoint และ Middleware อื่นๆ
app.post('/regisDB', async (req, res) => {
    const { username, password, email, age, phone } = req.body;
    if (!username || !password || !email || !age || !phone) {
        return res.status(400).send('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    try {
        const [existingUser] = await queryDB('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).send('Username นี้ถูกใช้งานแล้ว');
        }

        await queryDB('INSERT INTO users (username, password, email, age, phone) VALUES (?, ?, ?, ?, ?)',
            [username, password, email, age, phone]);

        res.status(201).send('สมัครสมาชิกสำเร็จ');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('เกิดข้อผิดพลาด');
    }
});

// ตั้งค่าเซิร์ฟเวอร์
const PORT = 3000;
const HOSTNAME = 'localhost';

app.listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
app.post('/registerEvent', async (req, res) => {
    const { name, date, time, location, description, upload_image, username, eventJoin } = req.body;

    // ตรวจสอบว่าข้อมูลจำเป็นครบถ้วน
    if (!name || !date || !time || !location || !description || !username || eventJoin === undefined) {
        return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    try {
        const saveDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // วันที่บันทึก
        const result = await queryDB(
            `INSERT INTO tbl_event (name, date, time, location, description, upload_image, username, save_date, join_event) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, date, time, location, description, upload_image, username, saveDate, eventJoin]
        );
        
        res.status(201).json({ message: 'Event added successfully', eventId: result.insertId });
    } catch (error) {
        console.error('Error adding event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.patch('/joinEvent/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const result = await queryDB(
            'UPDATE tbl_event SET join_event = 1 WHERE id = ?',
            [eventId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Event joined successfully' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error joining event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.patch('/updateJoinEvent/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const result = await queryDB(
            'UPDATE tbl_event SET join_event = 0 WHERE id = ?',
            [eventId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Event updated successfully' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getEvents', async (req, res) => {
    try {
        const events = await queryDB('SELECT * FROM tbl_event');
        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/getUserEvents', async (req, res) => {
    const username = req.query.username; // ใช้ query parameter เพื่อระบุผู้ใช้

    if (!username) {
        return res.status(400).json({ message: 'Missing username parameter' });
    }

    try {
        const events = await queryDB(
            'SELECT * FROM tbl_event WHERE username = ? AND join_event = 0',
            [username]
        );

        if (events.length > 0) {
            res.status(200).json(events);
        } else {
            res.status(404).json({ message: 'No events found for this user' });
        }
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/clearEvents', async (req, res) => {
    try {
        await queryDB('DELETE FROM tbl_event');
        res.status(200).json({ message: 'All events cleared successfully' });
    } catch (error) {
        console.error('Error clearing events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Server setup


// เพิ่ม Route สำหรับการเข้าถึงหน้า index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html')); // ชี้ไปที่ไฟล์ index.html
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/home/home.html'));
});

// GET: ดึงข้อมูลกิจกรรมที่เข้าร่วม
app.get('/attendedEvents', (req, res) => {
    const sql = 'SELECT * FROM tbl_apply_event';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching attended events:', err);
            return res.status(500).json({ message: 'Failed to fetch attended events' });
        }
        res.json(results);
    });
});
app.post('/logout', (req, res) => {
    // ลบ session หรือ token ของผู้ใช้
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Logout failed');
        }
        res.status(200).send('Logout successful');
    });
});
app.use('/uploads', express.static('uploads')); 