let font;
let input;
let myText = [];

function setup() {
    createCanvas(700, 700);
    
    input = createInput('');
    input.position(10, 10);
    input.input(buildArray);
    
    textSize(32);
    textAlign(CENTER, CENTER);

}
let frame = 0;
function draw() {
    frame ++;
    background(220);
    fill(0);
    translate(width / 2, height / 2);
    rotate (frame / 20);
    for (let i = 0; i< myText.length; i++){
        text(myText[myText.length-i - 1], 10+4*i, 5+4*i)
        rotate(.5)
    }
}

function buildArray() {
    myText = input.value() + "       ";
}