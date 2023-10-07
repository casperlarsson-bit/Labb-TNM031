function closeAd() {
    var x = document.getElementById('ad')
    if (x.style.display === 'none') {
        x.style.display = 'block'
    } else {
        x.style.display = 'none'
    }
}

const time = new Date()
const hours = time.getHours()
const day = time.getDay()
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var msg = ''
if (hours > 4 && hours <= 5) { msg = 'Go to bed ' }
if (hours > 5 && hours <= 9) { msg = 'Good morning ' }
if (hours > 9 && hours <= 12) { msg = 'Good day ' }
else if (hours > 12 && hours <= 17) { msg = 'Good afternoon ' }
else if (hours > 17 && hours <= 21) { msg = 'Good evening ' }
else if (hours > 21 || hours <= 4) { msg = 'Happy ' + dayNames[day] + ' ' }
document.getElementById('welcome-text-id').innerHTML = msg + document.getElementById('welcome-text-id').innerHTML
