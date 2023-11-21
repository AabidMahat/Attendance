// // generate events
// var eventDates = {};
// let day1 = formatDate(new Date(new Date().setMonth(new Date().getMonth())));
// console.log(day1);
// eventDates[day1] = ['Event 1, Location', 'Event 2, Location 2'];
// let day2 = formatDate(new Date(new Date().setDate(new Date().getDate() + 22)));
// console.log(day2);
// eventDates[day2] = ['Event 2, Location 3'];
// let day3 = formatDate(new Date(new Date().setDate(new Date().getDate() + 23)));
// eventDates[day3] = ['Event 2, Location 3'];
// let day4 = formatDate(new Date(new Date().setDate(new Date().getDate() + 24)));
// eventDates[day4] = ['Event 2, Location 3'];
// let day5 = formatDate(new Date(new Date().setDate(new Date().getDate() + 25)));
// eventDates[day5] = ['Event 2, Location 3'];
// let day6 = formatDate(new Date(new Date().setDate(new Date().getDate() + 1)));
// eventDates[day6] = ['Event 2, Location 3'];

// console.log(eventDates);
// Assuming subjectData is an object containing the attendanceRecords array
// var subjectData = /* your subject data */
var newEventDates = {};

subjectData.forEach((record) => {
    let date = formatDate(new Date(record.date));
    let eventDetails = record.isPresent ? 'Present' : 'Absent'; // You can modify this based on your requirement
    newEventDates[date] = [eventDetails];
});

console.log('Event Dates:', newEventDates);

const presentEvents = [];
const absentEvents = [];
for (const dates in newEventDates) {
    if (newEventDates[dates].includes('Present')) {
        presentEvents.push(dates);
    }
}
console.log(presentEvents);

for (const dates in newEventDates) {
    if (!newEventDates[dates].includes('Present')) {
        absentEvents.push(dates);
    }
}
console.log(absentEvents);

// set maxDates
var maxDate = {
    1: new Date(new Date().setMonth(new Date().getMonth() + 11)),
    2: new Date(new Date().setMonth(new Date().getMonth() + 10)),
    3: new Date(new Date().setMonth(new Date().getMonth() + 9)),
};

var flatpickr = $('#calendar .placeholder').flatpickr({
    inline: true,
    minDate: '2023-10-10',
    maxDate: maxDate[3],
    showMonths: 3,
    enable: presentEvents,
    disableMobile: 'true',
    locale: {
        weekdays: {
            shorthand: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            longhand: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ],
        },
    },
});
var flatpickr1 = $('#calendar1 .placeholder').flatpickr({
    inline: true,
    minDate: '2023-10-10',
    maxDate: maxDate[3],
    showMonths: 3,
    enable: absentEvents,
    disableMobile: 'true',
    locale: {
        weekdays: {
            shorthand: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            longhand: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ],
        },
    },
});

eventCaledarResize($(window));
$(window).on('resize', function () {
    eventCaledarResize($(this));
});

function eventCaledarResize($el) {
    var width = $el.width();
    if (flatpickr.selectedDates.length) {
        flatpickr.clear();
    }
    if (width >= 992 && flatpickr.config.showMonths !== 3) {
        flatpickr.set('showMonths', 3);
        flatpickr.set('maxDate', maxDate[3]);
    }
    if (width < 992 && width >= 768 && flatpickr.config.showMonths !== 2) {
        flatpickr.set('showMonths', 2);
        flatpickr.set('maxDate', maxDate[2]);
    }
    if (width < 768 && flatpickr.config.showMonths !== 1) {
        flatpickr.set('showMonths', 1);
        flatpickr.set('maxDate', maxDate[1]);
        $('.flatpickr-calendar').css('width', '');
    }
}
function eventCaledarResize($el) {
    var width = $el.width();
    if (flatpickr1.selectedDates.length) {
        flatpickr1.clear();
    }
    if (width >= 992 && flatpickr1.config.showMonths !== 3) {
        flatpickr1.set('showMonths', 3);
        flatpickr1.set('maxDate', maxDate[3]);
    }
    if (width < 992 && width >= 768 && flatpickr1.config.showMonths !== 2) {
        flatpickr1.set('showMonths', 2);
        flatpickr1.set('maxDate', maxDate[2]);
    }
    if (width < 768 && flatpickr1.config.showMonths !== 1) {
        flatpickr1.set('showMonths', 1);
        flatpickr1.set('maxDate', maxDate[1]);
        $('.flatpickr-calendar').css('width', '');
    }
}

function formatDate(date) {
    let d = date.getDate();
    let m = date.getMonth() + 1; //Month from 0 to 11
    let y = date.getFullYear();
    // console.log(y);
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

// console.log('Subject Data are ', subjectData);
