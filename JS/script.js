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
    clearForm();
}

// รีเซ็ตฟอร์ม
function clearForm() {
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('instructorName').value = '';
    document.getElementById('classroom').value = '';
    document.getElementById('timeInputs').innerHTML = '';
    selectedDays = [];
    dayTimeData = {}; // รีเซ็ตข้อมูลเวลา
    document.querySelectorAll('.day-button').forEach(button => {
        button.classList.remove('selected');
    });
    clearErrors(); // Clear error messages on form reset
}

// ฟังก์ชันที่เลือกวัน
function toggleDay(button, day) {
    if (selectedDays.includes(day)) {
        selectedDays = selectedDays.filter(d => d !== day);
        delete dayTimeData[day]; // ลบข้อมูลวันนั้นๆออกจาก dayTimeData
        button.classList.remove('selected');
    } else {
        selectedDays.push(day);
        dayTimeData[day] = { start: '', end: '' }; // เพิ่มข้อมูลวันและเวลาเริ่มต้นและสิ้นสุด
        button.classList.add('selected');
    }
    updateTimeInputs();
    if (selectedDays.length > 0) {
        document.getElementById('daysError').innerText = '';
    }
}

// ฟังก์ชันที่ตรวจสอบว่าเวลาถูกต้องตามช่วงหรือไม่
function validateTimeInput(input) {
    const minTime = "08:00"; // เวลาเริ่มต้น
    const maxTime = "20:00"; // เวลาสิ้นสุด

    // ตรวจสอบว่าเวลาใน input น้อยกว่าช่วงที่กำหนดหรือไม่
    const timeValue = input.value;
    if (timeValue < minTime || timeValue > maxTime) {
        showError(input, "โปรดเลือกเวลาในช่วง 08:00 - 20:00");
        input.value = ""; // ลบค่าเวลาที่กรอกไป
    } else {
        clearErrors(); // ลบข้อความผิดพลาด
    }
}

// อัปเดตฟังก์ชัน `updateTimeInputs` เพื่อให้เรียก `validateTimeInput`
function updateTimeInputs() {
    const timeInputsContainer = document.getElementById('timeInputsContainer');
    const timeInputs = document.getElementById('timeInputs');
    timeInputs.innerHTML = '';

    if (selectedDays.length > 0) {
        timeInputsContainer.style.display = 'block';
        selectedDays.forEach(day => {
            timeInputs.innerHTML += 
                `<div class="time-select">
                    <h4>${day}</h4>
                    <div class="time-label">
                        <label>เวลาเริ่ม:</label>
                        <label>เวลาสิ้นสุด:</label>
                    </div>
                    <div>
                        <input type="time" class="start-time" data-day="${day}" required 
                               min="08:00" max="20:00" oninput="validateTimeInput(this)">
                        <input type="time" class="end-time" data-day="${day}" required 
                               min="08:00" max="20:00" oninput="validateTimeInput(this)">
                    </div>
                </div>`;
        });
    } else {
        timeInputsContainer.style.display = 'none';
    }
}



// ฟังก์ชันที่แสดงข้อความผิดพลาด
function showError(input, message) {
    const errorElement = document.getElementById(input.id + 'Error');
    input.classList.add('input-error');
    errorElement.innerText = message;
    input.focus();
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ฟังก์ชันที่ลบข้อความผิดพลาด
function clearErrors() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('input-error');
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) errorElement.innerText = ''; // Clear error message
    });
    const timeInputsError = document.getElementById('timeInputsError');
    if (timeInputsError) timeInputsError.innerText = ''; // Clear time-related error
}

// ฟังก์ชันที่ตรวจสอบเวลา
function validateTime(startTime, endTime) {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return start < end;
}

// ฟังก์ชันที่ตรวจสอบว่าเวลาไม่ทับซ้อนกับตารางที่มีอยู่
function checkTimeConflict(day, startTime, endTime) {
    const dayCell = document.getElementById(`${day.toLowerCase()}-timeline`);
    const courseDivs = dayCell ? dayCell.querySelectorAll('.course-entry') : [];

    const startMinutes = convertToMinutes(startTime);
    const endMinutes = convertToMinutes(endTime);

    for (let courseDiv of courseDivs) {
        const courseStartTime = courseDiv.dataset.startTime;
        const courseEndTime = courseDiv.dataset.endTime;
        const courseStartMinutes = convertToMinutes(courseStartTime);
        const courseEndMinutes = convertToMinutes(courseEndTime);

        if ((startMinutes < courseEndMinutes && endMinutes > courseStartMinutes)) {
            return false; // ทับซ้อนกัน
        }
    }
    return true;
}

// ฟังก์ชันแปลงเวลาเป็นนาที
function convertToMinutes(time) {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
}

// ฟังก์ชันเพิ่มรายวิชา
function addCourse() {
    const courseCode = document.getElementById('courseCode');
    const courseName = document.getElementById('courseName');
    const instructorName = document.getElementById('instructorName');
    const classroom = document.getElementById('classroom');
    const startTimes = document.querySelectorAll('.start-time');
    const endTimes = document.querySelectorAll('.end-time');

    let validationError = false;
    clearErrors();

    // ตรวจสอบข้อมูลพื้นฐาน
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
        const daysError = document.getElementById('daysError');
        daysError.innerText = 'กรุณาเลือกวันเรียน';
        validationError = true;
    }

    // ตรวจสอบเวลาเริ่มต้นและสิ้นสุด
    const dayTimeErrors = [];

    startTimes.forEach((startTime, index) => {
        const endTime = endTimes[index];
        const day = startTime.dataset.day;

        if (!startTime.value || !endTime.value) {
            dayTimeErrors.push('กรุณากรอกเวลาเริ่มต้นและสิ้นสุดให้ครบถ้วน');
        } else if (!validateTime(startTime.value, endTime.value)) {
            dayTimeErrors.push(`เวลาเริ่มต้นต้องก่อนเวลาสิ้นสุดสำหรับวัน ${day}`);
        } else if (!checkTimeConflict(day, startTime.value, endTime.value)) {
            dayTimeErrors.push(`เวลาในวัน ${day} ทับซ้อนกับรายวิชาที่มีอยู่`);
        } else {
            dayTimeData[day].start = startTime.value;
            dayTimeData[day].end = endTime.value;
        }
    });

    if (dayTimeErrors.length > 0) {
        validationError = true;
        dayTimeErrors.forEach(message => {
            const timeInputsError = document.getElementById('timeInputsError');
            timeInputsError.innerText = message;
        });
    }

    if (!validationError) {
        const tbody = document.getElementById('scheduleTable').getElementsByTagName('tbody')[0];

        selectedDays.forEach(day => {
            const startHour = parseInt(dayTimeData[day].start.split(':')[0], 10);
            const endHour = parseInt(dayTimeData[day].end.split(':')[0], 10);
            const startMin = parseInt(dayTimeData[day].start.split(':')[1], 10);
            const endMin = parseInt(dayTimeData[day].end.split(':')[1], 10);

            const startTimeInMinutes = startHour * 60 + startMin;
            const endTimeInMinutes = endHour * 60 + endMin;
            const duration = endTimeInMinutes - startTimeInMinutes; // ความยาวในนาที

            const cellId = `${day.toLowerCase()}-timeline`;
            const newRow = tbody.insertRow();

            newRow.innerHTML = `
                <td>${courseCode.value}</td>
                <td>${courseName.value}</td>
                <td>${instructorName.value}</td>
                <td>${classroom.value}</td>
                <td>${day}</td>
                <td>${dayTimeData[day].start} - ${dayTimeData[day].end}</td>
            `;

            const dayCell = document.getElementById(cellId);
            const courseDiv = document.createElement('div');
            courseDiv.className = 'course-entry';
            courseDiv.dataset.startTime = dayTimeData[day].start;
            courseDiv.dataset.endTime = dayTimeData[day].end;
            courseDiv.style.height = `${duration}px`; // สูงของ div ตามความยาวของเวลา
            dayCell.appendChild(courseDiv);
        });

        closePopup();
    }
}

