
const State = Object.freeze({
    REGULAR: "REGULAR",
    ASTEROID: "ASTEROID",
    DESTROYED: "DESTROYED",
});

let stars = [];
let currentState = State.REGULAR;
let frame = 0;

function setup() {
    createCanvas(700, 700, WEBGL);
    createSelectionArea();
    strokeWeight(0);
    stroke(255, 255, 255);
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: random(-height*5, height*5),
            y: random(-height*5, height*5),
            z: random(-height*5, height*5)
        });
    }
}

function createSelectionArea(){
  // Copied Slection Area Creation Code from the P5.js Reference
  let selectionArea = createDiv();
  selectionArea.style('background', '#f0f0f0');
  selectionArea.style('width', '400px');
  selectionArea.style('font-family', 'sans-serif');
  asteroidButton = createButton('Spawn Asteroid');
  asteroidButton.mouseClicked(spawnAsteroid)
  asteroidButton.parent(selectionArea);
}

function draw() {
    background(20,20,40);
    orbitControl();
    strokeWeight(0);
    fill(255);
    for (let i = 0; i < stars.length; i++) {
        push();
        translate(stars[i].x, stars[i].y, stars[i].z);
        sphere(5, 4, 2);    
        pop();
    }
    if (currentState == State.REGULAR || currentState == State.ASTEROID){
        fill(50,50,150);
    } else {
        fill(100);
        if (frame > 200){
            currentState = State.REGULAR;
        }
    }
    strokeWeight(0);
    sphere(200, 16, 8);

    if (currentState == State.ASTEROID){
        if (frame > 100){
            currentState = State.DESTROYED;
            frame = 0;
        }
        translate (150,150,150);
        fill(90,60,60);
        sphere(50, 16, 8);
        // translate (150,150,150);
        rotate(90)
        fill(100,20,20)
        cone(50, 100, 16, 8, true)
        fill(255,150,20)
        cone(50, 150, 16, 8, true)
        fill(255,255,0)
        cone(55, 200, 16, 8, false)
    }

    frame++;
}

function spawnAsteroid(){
    currentState = State.ASTEROID;
    frame = 0;
}
