let selectedDays = [];
let dayTimeData = {}; // เก็บข้อมูลเวลาเริ่มต้นและเวลาสิ้นสุดสำหรับแต่ละวัน

// เปิดฟอร์มเพิ่มรายวิชา
function openPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popupForm').style.display = 'block';
}

// ปิดฟอร์มเพิ่มรายวิชา
function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('popupForm').style.display = 'none';
    clearForm();  // รีเซ็ตข้อมูลเมื่อปิดฟอร์ม
}

// ฟังก์ชันนี้จะปิด autocomplete สำหรับทุก input ในฟอร์ม
function disableAutocomplete() {
    document.querySelectorAll('input').forEach(input => {
        input.setAttribute('autocomplete', 'off');
    });
}

// เรียกใช้ disableAutocomplete เมื่อโหลดหน้าฟอร์ม
window.onload = disableAutocomplete;

// ฟังก์ชันเคลียร์ฟอร์มทั้งหมด
function clearForm() {
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('instructorName').value = '';
    document.getElementById('classroom').value = '';
    document.getElementById('timeInputs').innerHTML = '';
    selectedDays = [];
    dayTimeData = {}; // รีเซ็ตข้อมูลเวลา
    document.querySelectorAll('.day-button').forEach(button => button.classList.remove('selected'));
    clearErrors();  // เคลียร์ข้อผิดพลาดเมื่อปิดฟอร์ม

    // ซ่อน timeInputsContainer เมื่อรีเซ็ต
    const timeInputsContainer = document.getElementById('timeInputsContainer');
    timeInputsContainer.style.display = 'none';  // ซ่อน timeInputsContainer
}



// ฟังก์ชันที่ใช้ในการจัดรูปแบบรหัสวิชา (xxx-xxx หรือ xxx-xxxxx) และแปลงเป็นพิมพ์ใหญ่
function formatCourseCode() {
    const courseCodeInput = document.getElementById('courseCode');
    let value = courseCodeInput.value;

    // แปลงทุกตัวอักษรให้เป็นตัวพิมพ์ใหญ่
    value = value.toUpperCase();

    // ลบอักขระที่ไม่ใช่ตัวอักษรหรือหมายเลข
    value = value.replace(/[^A-Za-z0-9]/g, "");

    // รูปแบบการจัดรหัสวิชา xxx-xxx หรือ xxx-xxxxx โดยให้สองตัวสุดท้ายเป็นตัวอักษร
    if (value.length > 3) {
        // ให้ตัวเลขสามตัวแรก และสองตัวท้ายเป็นตัวอักษร
        if (value.length > 6) {
            value = value.slice(0, 3) + '-' + value.slice(3, 6) + value.slice(6, 8);
        } else {
            value = value.slice(0, 3) + '-' + value.slice(3, 6);
        }
    }

    // รีเซ็ตค่าในฟิลด์
    courseCodeInput.value = value;
}

// ฟังก์ชันที่ใช้ในการจัดการค่าที่กรอกให้เป็นตัวพิมพ์ใหญ่และกรองให้เป็นตัวอักษรภาษาอังกฤษ
document.getElementById('courseCode').addEventListener('input', function(event) {
    const input = event.target;
    let value = input.value;

    // แปลงให้เป็นตัวพิมพ์ใหญ่
    value = value.toUpperCase();

    // ลบตัวอักษรที่ไม่ใช่ภาษาอังกฤษหรือตัวเลข
    value = value.replace(/[^A-Za-z0-9-]/g, '');

    // เพิ่มการตรวจสอบว่า 2 ตัวสุดท้ายต้องเป็นตัวอักษร
    if (value.length > 3 && value.length <= 6) {
        value = value.slice(0, 6);
    }

    // รีเซ็ตค่าในฟิลด์
    input.value = value;
});

// ฟังก์ชันที่เลือกวัน
function toggleDay(button, day) {
    if (selectedDays.includes(day)) {
        selectedDays = selectedDays.filter(d => d !== day);
        // ลบข้อมูลวันนั้นๆออกจาก dayTimeData
        delete dayTimeData[day]; 
        button.classList.remove('selected');
    } else {
        selectedDays.push(day);
        // เพิ่มข้อมูลวันใหม่ที่ยังไม่เคยเลือก
        if (!dayTimeData[day]) {
            dayTimeData[day] = { start: '', end: '' };
        }
        button.classList.add('selected');
    }
    updateTimeInputs();
    if (selectedDays.length > 0) {
        document.getElementById('daysError').innerText = '';  // เคลียร์ข้อผิดพลาด
    }
}

// ฟังก์ชันที่แสดงข้อมูลเวลาในฟอร์ม
function updateTimeInputs() {
    const timeInputsContainer = document.getElementById('timeInputsContainer');
    const timeInputs = document.getElementById('timeInputs');
    timeInputs.innerHTML = '';  // ล้างข้อมูลเวลาเก่า

    if (selectedDays.length > 0) {
        timeInputsContainer.style.display = 'block';
        selectedDays.forEach(day => {
            const startTime = dayTimeData[day]?.start || '';  // ดึงเวลาเริ่มต้นที่มีอยู่แล้ว
            const endTime = dayTimeData[day]?.end || '';      // ดึงเวลาสิ้นสุดที่มีอยู่แล้ว

            timeInputs.innerHTML += 
                `<div class="time-select">
                    <h4>${day}</h4>
                    <div class="time-label">
                        <label>เวลาเริ่ม:</label>
                        <label>เวลาสิ้นสุด:</label>
                    </div>
                    <div>
                        <input type="time" class="start-time" data-day="${day}" required 
                               min="08:00" max="20:00" value="${startTime}" oninput="validateTimeInput(this)">
                        <input type="time" class="end-time" data-day="${day}" required 
                               min="08:00" max="20:00" value="${endTime}" oninput="validateTimeInput(this)">
                    </div>
                </div>`;
        });
    } else {
        timeInputsContainer.style.display = 'none';
    }
}


// ฟังก์ชันตรวจสอบข้อมูลเวลา
function validateTimeInput(input) {
    const timeValue = input.value;
    if (timeValue < "08:00" || timeValue > "20:00") {
        showError(input, "โปรดเลือกเวลาในช่วง 08:00 - 20:00");
        input.value = ""; // ลบค่าเวลาที่กรอกไป
    } else {
        clearErrors(); // ลบข้อความผิดพลาด
    }
}

// ฟังก์ชันแสดงข้อความผิดพลาด
function showError(input, message) {
    const errorElement = document.getElementById(input.id + 'Error');
    if (errorElement) {
        errorElement.innerText = message;
    }
    input.classList.add('input-error'); // เพิ่มคลาสเพื่อเปลี่ยนสีกรอบเป็นสีแดง
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ฟังก์ชันลบข้อความผิดพลาด
function clearErrors() {
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('input-error'); // ลบคลาส .input-error เมื่อแก้ไขข้อผิดพลาด
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) errorElement.innerText = ''; // Clear error message
    });
}

// ฟังก์ชันที่ตรวจสอบเวลาเริ่มต้นก่อนเวลาสิ้นสุด
function validateTimeRange(startTime, endTime) {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    
    if (start >= end) {
        return `เวลาเริ่มต้นต้องก่อนเวลาสิ้นสุด`;
    }
    return null;
}

// ฟังก์ชันตรวจสอบการซ้อนทับเวลา
function checkTimeConflict(day, startTime, endTime) {
    // เปรียบเทียบกับรายวิชาที่มีอยู่แล้ว
    for (let course of existingCourses) {
        if (course.day === day) {
            const existingStart = course.startTime;
            const existingEnd = course.endTime;

            // ตรวจสอบว่ามีการทับซ้อนของเวลา
            if ((startTime < existingEnd && endTime > existingStart)) {
                return false;  // ทับซ้อน
            }
        }
    }
    return true;  // ไม่มีการทับซ้อน
}


// ฟังก์ชันที่ดึงวันเรียนที่เลือก
function getSelectedDays() {
    return selectedDays;  // ต้องกำหนดค่า selectedDays ให้ถูกต้องก่อนใช้งาน
}

// ตัวแปรสำหรับเก็บรายวิชาที่มีอยู่ในระบบ
let existingCourses = [];

// ฟังก์ชันสำหรับโหลดข้อมูลรายวิชาจาก Google Sheets
function loadExistingCourses() {
    const url = 'https://script.google.com/macros/s/AKfycbwnerH0ORPHbWx5PaOZ8xsLBeKe2VFggGHxoCyXbFzyaxRTQGIwPKXwuK_GdOWXIYtoiw/exec';

    // ส่ง GET request เพื่อดึงข้อมูลรายวิชาที่มีอยู่
    fetch(url)
        .then(response => response.json())
        .then(data => {
            existingCourses = data;  // เก็บข้อมูลที่ได้จาก Google Sheets
        })
        .catch(error => {
            console.error('Error loading existing courses:', error);
        });
}

// ฟังก์ชันตรวจสอบการทับซ้อนเวลา
function checkTimeConflict(day, startTime, endTime) {
    // เปรียบเทียบกับรายวิชาที่มีอยู่แล้ว
    for (let course of existingCourses) {
        if (course.day === day) {
            const existingStart = course.startTime;
            const existingEnd = course.endTime;

            // ตรวจสอบว่ามีการทับซ้อนของเวลา
            if ((startTime < existingEnd && endTime > existingStart)) {
                return false;  // ทับซ้อน
            }
        }
    }
    return true;  // ไม่มีการทับซ้อน
}

// ฟังก์ชันสำหรับเพิ่มรายวิชา
function addCourse() {
    const courseCode = document.getElementById('courseCode');
    const courseName = document.getElementById('courseName');
    const instructorName = document.getElementById('instructorName');
    const classroom = document.getElementById('classroom');
    const startTimes = document.querySelectorAll('.start-time');
    const endTimes = document.querySelectorAll('.end-time');

    let validationError = false;
    clearErrors();  // เคลียร์ข้อผิดพลาดก่อนหน้านี้

    // 1. ตรวจสอบข้อมูลพื้นฐาน
    if (!courseCode.value) {
        showError(courseCode, 'กรุณากรอกรหัสวิชา');
        validationError = true;
    } else if (!courseName.value) {
        showError(courseName, 'กรุณากรอกชื่อรายวิชา');
        validationError = true;
    } else if (!instructorName.value) {
        showError(instructorName, 'กรุณากรอกชื่ออาจารย์');
        validationError = true;
    } else if (!classroom.value) {
        showError(classroom, 'กรุณากรอกห้องเรียน');
        validationError = true;
    } else if (selectedDays.length === 0) {
        showErrorForDays('กรุณาเลือกวันเรียน');
        validationError = true;
    }

    // หากมีข้อผิดพลาดในการกรอกข้อมูลพื้นฐาน
    if (validationError) return;

    const dayTimeErrors = [];
    const missingTimeDays = [];

    // 2. ตรวจสอบเวลาของแต่ละวัน
    selectedDays.forEach((day, index) => {
        const startTime = startTimes[index].value;
        const endTime = endTimes[index].value;

        if (!startTime || !endTime) {
            missingTimeDays.push(day);  // หากยังไม่ได้กรอกเวลา
        } else {
            // ตรวจสอบเวลาว่าไม่ซ้อนทับกับรายวิชาอื่น
            const timeError = validateTimeRange(startTime, endTime);
            if (timeError) {
                dayTimeErrors.push(`${timeError} สำหรับวัน ${day}`);
            } else {
                // ตรวจสอบการทับซ้อนเวลา
                if (!checkTimeConflict(day, startTime, endTime)) {
                    dayTimeErrors.push(`เวลาในวัน ${day} ทับซ้อนกับรายวิชาที่มีอยู่`);
                } else {
                    // หากทุกอย่างถูกต้อง ให้บันทึกเวลา
                    dayTimeData[day] = { start: startTime, end: endTime };
                }
            }
        }
    });

    // 3. หากยังไม่ได้กรอกเวลาเริ่มต้นและสิ้นสุด
    if (missingTimeDays.length > 0) {
        validationError = true;
        showTimeError(`กรุณากรอกเวลาเริ่มต้นและเวลาสิ้นสุดสำหรับวัน: ${missingTimeDays.join(', ')}`);
    }

    // 4. หากพบข้อผิดพลาดเกี่ยวกับเวลา
    if (dayTimeErrors.length > 0) {
        validationError = true;
        dayTimeErrors.forEach(msg => showTimeError(msg));
    }

    // หากมีข้อผิดพลาดทั้งหมด จะไม่บันทึกข้อมูล
    if (validationError) return;

    // 5. หากทุกอย่างถูกต้อง บันทึกข้อมูล
    saveCourseData(courseCode.value, courseName.value, instructorName.value, classroom.value, dayTimeData);
    closePopup();  // ปิดฟอร์ม
}

// โหลดข้อมูลรายวิชาก่อนที่จะเริ่มใช้งาน
loadExistingCourses();

function saveCourseData(courseCode, courseName, instructorName, classroom, dayTimeData) {
    const url = 'https://script.google.com/macros/s/AKfycbwnerH0ORPHbWx5PaOZ8xsLBeKe2VFggGHxoCyXbFzyaxRTQGIwPKXwuK_GdOWXIYtoiw/exec';

    const courseData = {
        courseCode: courseCode,
        courseName: courseName,
        instructorName: instructorName,
        classroom: classroom,
        dayTimeData: dayTimeData
    };

    // ส่งข้อมูลผ่าน POST request
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)  // ส่งข้อมูลในรูปแบบ JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to connect to the server');
        }
        return response.json();  // แปลงข้อมูลที่ตอบกลับเป็น JSON
    })
    .then(data => {
        if (data.result === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'เพิ่มรายวิชาเรียนสำเร็จ',
                toast: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#d4edda',
                color: '#155724',
                iconColor: '#155724',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                text: 'กรุณาลองใหม่อีกครั้ง',
                toast: true,
                position: 'top-right',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#f8d7da',
                color: '#721c24',
                iconColor: '#721c24',
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);  // แสดงข้อผิดพลาดใน console
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์',
            toast: true,
            position: 'top-right',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#f8d7da',
            color: '#721c24',
            iconColor: '#721c24',
        });
    });
}


// ฟังก์ชันสำหรับแสดงข้อผิดพลาดเกี่ยวกับวัน
function showErrorForDays(message) {
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#f8d7da',
        color: '#721c24',
        iconColor: '#721c24',
    });
}

// ฟังก์ชันสำหรับแสดงข้อผิดพลาดเกี่ยวกับเวลา
function showTimeError(message) {
    Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: message,
        toast: true,
        position: 'top-right',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#f8d7da',
        color: '#721c24',
        iconColor: '#721c24',
    });
}
