let snakeBody = [{x:3,y:1},{x:2,y:1},{x:1,y:1} ]
let myScore = 0
let gameOver = false
let allOver = false
let level = 1
let inputDirection = {x:0,y:0}
let lastInput = {x:0,y:0}
let reset = false
let newSegment = 0
const keys = document.querySelectorAll(".keys i")
const foodColors = ["#a67b5b","#7b3f00","#138808","#9e2b3e","#c7b9d5","#4e2161","#f9d3d6","#9197a3"];
const cBox = document.getElementsByClassName("c")
const uBox = document.getElementsByClassName("u")
const max_score = document.getElementById("maxScore")
const my_score = document.getElementById("myScore")
let uSeq =[]
const life = document.querySelector(".lives")
const time = document.querySelector(".time")
let c=1
let snakeSpeed = 4
let pause = true
let lastTime = 0
const gameBoard = document.getElementById("board")
const foodSound = new Audio('music/food.mp3');
const gameOverSound = new Audio('music/gameover.mp3');
const moveSound = new Audio('music/move.mp3');
const musicSound = new Audio('music/music.mp3');


window.addEventListener('keydown', e => {changeSnakeDirection(e)})

//------------------------ updating time and //incrementing on level ups// ----
setInterval(
    ()=> {
        let n = time.innerHTML 
        if(!pause) time.innerHTML = n-1
    },1000
)
//increasing snake speed for every 15sec
setInterval(
    () => {
        snakeSpeed += 1
    },25000
)

//---------------------getting direction from keyboard ---------------------------

const changeSnakeDirection = e => {
    // console.log(e.key)
    switch (e.key){
        case 'ArrowUp':
            if (lastInput.y !== 0) break
            inputDirection = { x: 0, y: -1}
            pause = false
            break
        case 'ArrowDown':
            if (lastInput.y !== 0) break
            inputDirection = { x: 0, y: 1}
            pause = false
            break
        case 'ArrowLeft':
            if (lastInput.x !== 0) break
            inputDirection = { x: -1, y: 0}
            pause = false
            break
        case 'ArrowRight':
            if (lastInput.x !== 0) break
            pause = false
            inputDirection = { x: 1, y: 0}
            break
        case ' '://click any direction to continue playing
            inputDirection = { x: 0, y: 0}
            pause = true
            break
    }
}

const getDirection = () =>{
    lastInput = inputDirection
    return inputDirection
} 

//--------- getting direction from keys ------------
keys.forEach(key=>{
    key.addEventListener("click", () => {changeSnakeDirection({key: key.dataset.key})} )
})


//------------------------food positions /not repeating and /not on snake  ---------

const ifSnakebodyorFoodisonSnake = (position, head=false) => {
    if(head===true){
        return snakeBody.some((segment,index) => {
            if(index!==0) {
                //console.log("intersedct",segment,snakeBody[0])
                return (
                    segment.x === snakeBody[0].x &&
                    segment.y === snakeBody[0].y
                )
            }
        })
    }
    else{
        return snakeBody.some((segment,index) => {
            return (
                segment.x === position.x &&
                segment.y === position.y
            )
        })
    }
}

const getRandomFoodPositions = () => {
    let newFoodPosition
    let xPos = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]
    let yPos = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]
    
    const foodPos_X = xPos.sort(()=> 0.5 -Math.random())
    const foodPos_Y = yPos.sort(()=> 0.5 -Math.random())
    let foodPos = []
    i=0
    while(foodPos.length<4){
        newFoodPosition = {x:foodPos_X[i],y:foodPos_Y[i]}
        if(!ifSnakebodyorFoodisonSnake(newFoodPosition)){
            foodPos.push(newFoodPosition)
        }
        i++
    }
    return foodPos
}

//----------------------generating random color sequence ----------------------------------------------
const colorSequence = () => {
    let compSeq = []
    let cpFood = foodColors.slice()
    for(let i=0;i<4;i++){
        const shuffled = cpFood.sort(()=> 0.5 -Math.random())
        let food = cpFood.shift()
        compSeq.push(food)
        cBox[i].style.backgroundColor=compSeq[i]
    }
    return compSeq
}

//--------color:food pos combo

let food = getRandomFoodPositions()
let cSeq = colorSequence()
let foodcolourcombinationwithposition= new Map()
for(i=0;i<4;i++){
    foodcolourcombinationwithposition.set(cSeq[i],food[i])
}

//--------------------update function called in main to update snakedirection, foodPosition, game ending status 
const update = () => {
    // update snake
    //moveSound.play()
    const direction = getDirection()
    if (!(direction.x === 0 && direction.y ===0)){
        console.log("in")
        musicSound.play()
        for(i= snakeBody.length-2;i>=0;i--){
            snakeBody[i+1] = {...snakeBody[i]}
        }
    
        snakeBody[0].x+=direction.x
        snakeBody[0].y+=direction.y
    }
    
    
    //game won
    foodcolourcombinationwithposition = won()
    if(reset){
        foodcolourcombinationwithposition = toReset()
        gameOver = false
        reset = false
    }
    
    //update food -remove on eating and create on finishing
    foodcolourcombinationwithposition.forEach((value,key,index) => {
        if(ifSnakebodyorFoodisonSnake(value)){
            uSeq.push(key)
            uBox[4-foodcolourcombinationwithposition.size].style.backgroundColor = key
            // console.log(foodcolourcombinationwithposition.size,key)
            foodSound.play()
            foodcolourcombinationwithposition.delete(key)
        }
    })

    //check death 
    const outsidegird = pos => {
        return( pos.x<1 || pos.x > 21 || pos.y<1 || pos.y >21 )
    }
    const timeup = () => {
        return(time.innerHTML == 0)
    }
    const wrongSeq = () => {
        if (uSeq){
            for(i=0;i<uSeq.length;i++){
                if (uSeq[i] !== cSeq[i]) return true               
            }
        }
    }
    const snakeIntersection = () => {
        return (ifSnakebodyorFoodisonSnake(snakeBody[0],true))
    }

    gameOver = outsidegird(snakeBody[0])||timeup()||wrongSeq()||snakeIntersection()
    finalCheck(gameOver)
}



//-------------------------draw func called in main to draw snake, food-------------------


const draw = () =>{
    gameBoard.innerHTML=""
    //draw snake
    i=0
    snakeBody.forEach(segment => {
        const snakeElement = document.createElement("div")
        snakeElement.style.gridRowStart = segment.y
        snakeElement.style.gridColumnStart = segment.x
        snakeElement.classList.add("snake")
        snakeElement.classList.add('i'+String(i))
        gameBoard.appendChild(snakeElement)
        i++
    })

    //draw food
    foodcolourcombinationwithposition= won()
    if(reset){
        foodcolourcombinationwithposition = toReset()
        gameOver = false
        reset = false
    }
    

    foodcolourcombinationwithposition.forEach((value,key) => {
         console.log(value,key)
        const foodElement = document.createElement('div')
        foodElement.style.gridRowStart = value.y
        foodElement.style.gridColumnStart = value.x
        foodElement.style.backgroundColor = key
        gameBoard.appendChild(foodElement)
    } )
    
} 


//-----------------high score-----------------
const highScore = () => {
    let maxScore = localStorage.getItem("highScore")
    if(maxScore == null || String(myScore)>maxScore){
        localStorage.setItem("highScore", String(myScore))
    }
    
    localStorage.setItem("highScore", String(myScore))
    max_score.innerHTML = localStorage.getItem("highScore")   
}

//-------------------game won --------------------------------
const newFC =()=>{
    //--------color:food pos combo
    let foodcolourcombinationwithposition= new Map()
    for(i=0;i<4;i++){
        foodcolourcombinationwithposition.set(cSeq[i],food[i])
    }
    // console.log(foodcolourcombinationwithposition)
    return foodcolourcombinationwithposition
}

const won = () => {
    if(uSeq.length == 4 && JSON.stringify(uSeq) === JSON.stringify(cSeq)){
        cSeq = colorSequence()
        food = getRandomFoodPositions()
        level++
        myScore+=4
        my_score.innerHTML = myScore
        highScore()
        // snakeBody.push({ ...snakeBody[snakeBody.length - 1] }) // use loop for multiple expansion expand snake
        time.innerHTML=Number(time.innerHTML)+10
        for(i=0;i<4;i++){
            uBox[i].style.backgroundColor=""
        }
        foodcolourcombinationwithposition = newFC(cSeq,food)
        uSeq=[]
        
    }
    
    return foodcolourcombinationwithposition
}

//----lives----------
const finalCheck = gameOver => {
    if(gameOver){
        if(c<4){
            gameOverSound.play()
            alert("Lost 1 life")
            
            console.log(gameOver,c,"Lost 1 life")
            reset = true
            toReset(reset)
            // gameOver = false
            console.log(c)
            life.removeChild(life.children[0])
            c++
        }else{
            life.removeChild(life.children[0])
            allOver = true
        }
    }
}

//-------reset------------
const toReset = () => {
    cSeq = colorSequence()
    food = getRandomFoodPositions()
    for(i=0;i<4;i++){
        uBox[i].style.backgroundColor=""
    }
    pause = true
    snakeBody = [ {x:3,y:1},{x:2,y:1},{x:1,y:1} ]
    inputDirection ={x:0,y:0}
   
    foodcolourcombinationwithposition= newFC(cSeq,food)
    uSeq=[]  
    return foodcolourcombinationwithposition
}


//-------------------------main function to run everything called every 200ms---------------------------

const main = currentTime => {
    if(allOver){
        if(confirm('You lost all lives. Press ok to restart')){
            location.reload()
        }
        return
    }

    window.requestAnimationFrame(main)
    const secDiff = (currentTime - lastTime)/1000
    if(secDiff < 1/snakeSpeed) return
    lastTime = currentTime

    update()
    draw()
}

window.requestAnimationFrame(main)
