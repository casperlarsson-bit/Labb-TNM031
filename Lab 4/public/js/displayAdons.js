function closeAd() {
    var a = document.getElementById('ad')
    if (a.style.display === 'none') {
        a.style.display = 'block'
    } else {
        a.style.display = 'none'
    }
}

document.addEventListener('DOMContentLoaded', (e) => {
    const a = document.getElementById('ad')
    const linkArray = [
        'https://www.youtube.com/watch?v=BuNlNcQm4rg&t=8s',
        'https://www.youtube.com/watch?v=W7bmXywWus8&t=61s',
        'https://www.youtube.com/watch?v=532j-186xEQ&feature=youtu.be&t=57',
        'https://www.youtube.com/watch?v=sNjWpZmxDgg',
        'https://www.youtube.com/watch?v=R4dyRTAfsKc',
        'https://www.youtube.com/watch?v=glN0W8WogK8',
        'https://www.youtube.com/watch?v=Z6BWXhvBpwk&t=47s',
        'https://developer.chrome.com/blog/autoplay/'
    ]

    a.href = linkArray[getRandomInt(0, linkArray.length - 1)]

})

// Get a random integer between min (inclusive) and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
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


