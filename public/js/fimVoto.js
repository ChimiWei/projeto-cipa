let counter = 10
const counterEl = document.getElementById('counter')
counterEl.textContent = counter 
var intervalId;
const startInterval = () => {
    intervalId = setInterval(() => {
        counter--
        counterEl.textContent = counter
        console.log(counter)
        if(counter === 0) stopInterval()  
    }, 1000)
  
}

startInterval()

const stopInterval = () =>{
    clearInterval(intervalId)
}

