// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoqE3X2VJCAOlR4WXshLBlwymvbfgiXAk",
    authDomain: "pinball-e5dfe.firebaseapp.com",
    projectId: "pinball-e5dfe",
    storageBucket: "pinball-e5dfe.firebasestorage.app",
    messagingSenderId: "793412671654",
    appId: "1:793412671654:web:d3fd53b2175ca4220bbc67"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Pinball
class Bouncer {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.bouncing = false;
        this.coolDown = 0;
    }

    draw() {
        if (this.bouncing) {
            fill(80, 80, 200);
            stroke(20, 20, 100);
        } else {
            fill(solid.r, solid.g, solid.b);
            stroke(100, 20, 20);
        }
        strokeWeight(this.bouncing ? 4 : 5);
        ellipse(this.x, this.y, this.bouncing ? this.r * 2 - 10 : this.r * 2 - 5);
    }

    bounce(ball) {
        let d = dist(ball.x, ball.y, this.x, this.y);
        if (d < ball.radius + this.r) {
            this.coolDown = 400;
            this.bouncing = true;
            score += 100;
            // paddle collision code adapted for circular bouncers
            let nx = (ball.x - this.x) / d;
            let ny = (ball.y - this.y) / d;

            let overlap = ball.radius + this.r - d;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            let dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
                ball.vx -= 2.5 * dot * nx + random(-1, 1);
                ball.vy -= 2.5 * dot * ny + random(-1, 1);
            }
        } else {
            if (this.coolDown > 0) {
                this.coolDown--;
            } else {
                this.bouncing = false;
            }
        }

    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    mirror() {
        return new Point(400 - this.x, this.y)
    }
}

class RollOver {
    constructor(x, y) {
        this.point = new Point(x, y);
        this.active = false;
    }

    draw() {
        if (!this.active) {
            fill(220, 180, 30)
            strokeWeight(2)
            stroke(255)
        } else {
            strokeWeight(2)
            fill(80)
            stroke(2)
        }
        rectAt(this.point.x, this.point.y, 0, 20, 20, 2)
    }
}

class RollOverGroup {
    constructor(rollOvers) {
        this.rollOvers = rollOvers;
    }

    allActive() {
        for (let rollOver of this.rollOvers) {
            if (!rollOver.active) {
                return false;
            }
        }
        return true;
    }

    draw() {
        for (let r of this.rollOvers) {
            r.draw();
        }
    }

    checkIfAnyActive() {
        for (let r of this.rollOvers) {
            if (!r.active && (abs(r.point.x - ball.x) < 20 && abs(r.point.y - ball.y) < 20)) {
                score += 20
                r.active = true;
            }
        }
    }

    allActiveEffect() {
        if (this.allActive()) {
            for (let r of this.rollOvers) {
                r.active = false;
            }
            score += 1000;
        }
    }
}

let RollOvers = new RollOverGroup([
    new RollOver(280, 400),
    new RollOver(280, 360),
    new RollOver(280, 320),
    new RollOver(280, 280),
    new RollOver(100, 400),
    new RollOver(100, 360),
    new RollOver(100, 320),
    new RollOver(100, 280),
    new RollOver(140, 360),
    new RollOver(240, 360),
    new RollOver(190, 400),
    new RollOver(140, 440),
    new RollOver(240, 440),
])

class Track {
    constructor(path) {
        this.path = path;
        this.ballInPath = false;
        this.ballProgress = 0;
        this.goingUp = true;
        this.timeout = 0;
    }

    mirror() {
        let path2 = [];
        for (let i = 0; i < this.path.length; i++) {
            path2[i] = this.path[i].mirror();
        }
        return new Track(path2);
    }

    draw() {
        if (this.path.length < 2) {
            return;
        }
        stroke(150);
        strokeWeight(30); // Track thickness
        strokeCap(ROUND);  // Smooth joint ends and corners
        strokeJoin(ROUND);

        for (let i = 1; i < this.path.length; i++) {
            let x1 = this.path[i - 1].x;
            let x2 = this.path[i].x;
            let y1 = this.path[i - 1].y;
            let y2 = this.path[i].y;
            stroke(70);
            strokeWeight(35); // Track thickness

            line(x1, y1, x2, y2);
            stroke(150);
            strokeWeight(25); // Track thickness

            line(x1, y1, x2, y2);
        }
    }

    ballEntering() {
        if (this.timeout > 0 || this.ballInPath) {
            this.timeout--;
            return;
        }
        if (abs(this.path[0].x - ball.x) < 12 && abs(this.path[0].y - ball.y) < 12 && ball.vy < 0) {
            this.ballInPath = true;
            this.ballProgress = 0;
            this.goingUp = true;
        }

        if (abs(this.path[this.path.length - 1].x - ball.x) < 12 && abs(this.path[this.path.length - 1].y - ball.y) < 12 && ball.vy < 0) {
            this.ballInPath = true;
            this.ballProgress = 0;
            this.goingUp = false;
        }
    }

    ballMove() {
        score += 3;
        let targetIndex = this.goingUp ? this.ballProgress + 1 : this.path.length - 2 - this.ballProgress;
        // Check if path complete
        if (targetIndex < 0 || targetIndex >= this.path.length) {
            this.ballInPath = false;
            this.timeout = 20; // Increased to compensate for 16x substeps
            ball.vx;
            ball.vy = 20;
            return;
        }

        let nextPoint = this.path[targetIndex];

        let d = dist(ball.x, ball.y, nextPoint.x, nextPoint.y);
        if (d < 8) {
            this.ballProgress++;
        } else {
            ball.x = lerp(ball.x, nextPoint.x, 0.5);
            ball.y = lerp(ball.y, nextPoint.y, 0.5);
        }
    }

}

let LTrack = new Track([new Point(50, 450), new Point(20, 400), new Point(20, 120), new Point(180, 20), new Point(300, 40), new Point(320, 120)]);

let RTrack = LTrack.mirror();

class Paddle {
    constructor(x, y, w, h, theta) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.theta = theta;
        this.targetTheta = theta;
    }
}

let bouncers = [
    new Bouncer(200, 100, 20),
    new Bouncer(130, 220, 20),
    new Bouncer(250, 180, 20),
];

class Ball {
    constructor(x, y, r, bouncyness) {
        this.x = x;
        this.y = y;
        this.radius = r;
        this.bouncyness = bouncyness;
        this.vx = 0;
        this.vy = 0;
    }
}

let ball = new Ball(300, 50, 10, .6)

let paddleDefault = .2;
let paddleup = -.2;
let paddleSpeed = .8;
let g = 0.55;

let score = 0;
let balls = 0;

let solid = {
    r: 255,
    g: 80,
    b: 80
}

let paddleLeft = new Paddle(0, 550, 170, 20, paddleDefault);
let paddleRight = new Paddle(400, 550, -170, 20, -paddleDefault);

let shooter = {
    relaxedHeight: 250,
    h: 250,
    w: 100
};

let launcher = true;

function setup() {
    if (windowWidth > 450) {
        createCanvas(450, 650);
    } else if (windowWidth > 420) {
        createCanvas(windowWidth, 650)
    } else if (windowWidth > 400) {
        launcher = false;
        // No Launcher Mode?
        createCanvas(windowWidth, 650)
    } else {
        launcher = false;
        // No Launcher Mode?

        createCanvas(400, 650);
    }
}
let launching = true;
let launchingTimout = 2;
let haveLost = false;
let nameInput;
function lost() {
    background(20);
    fill(250);
    textSize(32);
    textAlign(LEFT, TOP);
    text("Name:", 0, 20)

    nameInput = createInput('')
    nameInput.position(windowWidth / 2 - width / 2, 80)

    button = createButton(`Submit`)
    button.position(windowWidth / 2 - width / 2, 120)
    button.mousePressed(submit)

    textSize(32);
    textAlign(RIGHT, TOP)
    text("High Scores:", width, 20)
    db.collection("Scores").orderBy("Score", "desc").limit(10).get()
        .then((snapshot) => {
            let yOffset = 62;

            snapshot.forEach((doc) => {
                let scoreData = doc.data();

                fill(255);
                textSize(26);
                textAlign(RIGHT, TOP)
                text(`${scoreData.Name}: ${scoreData.Score}`, width, yOffset);

                yOffset += 36;
            });
        })
        .catch((error) => {
            console.error("Error fetching scores: ", error);
        });
}

function submit() {
    let playerName = nameInput.value().trim() || "Anonymous";

    db.collection("Scores").add({
        Score: score,
        Name: playerName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then((docRef) => {
            console.log("Score saved with ID: ", docRef.id);
            button.attribute('disabled', 'true'); // Disable button after submission
        })
        .catch((error) => {
            console.error("Error saving score: ", error);
        });
}
function draw() {
    if (haveLost) {

        return;
    }
    background(20);

    let prevLeftTheta = paddleLeft.theta;
    let prevRightTheta = paddleRight.theta;
    let touching = false;
    let touchingL = false;
    let touchingR = false;
    for (var i = 0; i < touches.length; i++) {
        touching = true
        if (touches[i].x > 200 && touches[i].x < 400) {
            touchingR = true;
        }
        if (touches[i].x < 200 && touches[i].x > 0) {
            touchingL = true;
        }
    }
    if (keyIsDown(LEFT_ARROW) || (mouseIsPressed && mouseX < 200 && mouseX > 0 && !touching) || (touching && touchingL)) {
        paddleLeft.targetTheta = paddleup;
    } else {
        paddleLeft.targetTheta = paddleDefault;
    }

    if (keyIsDown(RIGHT_ARROW) || (mouseIsPressed && mouseX > 200 && mouseX < 400 && !touching) || (touching && touchingR)) {
        paddleRight.targetTheta = -paddleup;
    } else {
        paddleRight.targetTheta = -paddleDefault;
    }

    if (mouseIsPressed && mouseX > 400 && mouseX < 500 && mouseY > 650 - shooter.relaxedHeight) {
        shooter.h = mouseY < 650 ? 650 - mouseY : 0;
        launchingTimout = 2;
    } else {
        launchingTimout--;
        if (shooter.h < shooter.relaxedHeight && launching && launchingTimout > 0) {
            ball.vy = -(shooter.relaxedHeight - shooter.h) / 9
        }
        shooter.h = lerp(shooter.h, shooter.relaxedHeight, .35);
    }
    if (launching) {
        ball.x = 425;
        ball.vx = 0
        if (ball.y < 40) {
            ball.vy = -7;
            ball.y = 40;
            ball.x = 400;
            ball.vx = -15;
            launching = false;
            return;
        }
        else if (ball.vy >= 0 && ball.y >= 650 - shooter.h - ball.radius) {
            ball.y = 650 - shooter.h - ball.radius;
            ball.vy = 0;
        }
        if (ball.y >= 650 - shooter.h - ball.radius) {
            ball.y = 650 - shooter.h - ball.radius;

        }
    }

    // High sub-stepping loop (16 steps) for fast tip speeds
    let substeps = 16;
    for (let i = 0; i < substeps; i++) {

        RollOvers.checkIfAnyActive();
        RollOvers.allActiveEffect();

        LTrack.ballEntering();
        RTrack.ballEntering();
        let t = (i + 1) / substeps;

        if (LTrack.ballInPath) {
            LTrack.ballMove();
            paddleLeft.theta = lerp(prevLeftTheta, lerp(prevLeftTheta, paddleLeft.targetTheta, paddleSpeed), t * 16);
            paddleRight.theta = lerp(prevRightTheta, lerp(prevRightTheta, paddleRight.targetTheta, paddleSpeed), t * 16);
            break;

        }
        if (RTrack.ballInPath) {
            RTrack.ballMove();
            paddleLeft.theta = lerp(prevLeftTheta, lerp(prevLeftTheta, paddleLeft.targetTheta, paddleSpeed), t * 16);
            paddleRight.theta = lerp(prevRightTheta, lerp(prevRightTheta, paddleRight.targetTheta, paddleSpeed), t * 16);
            break;
        }


        // Sub-step flipper rotation so collision line updates continuously
        paddleLeft.theta = lerp(prevLeftTheta, lerp(prevLeftTheta, paddleLeft.targetTheta, paddleSpeed), t);
        paddleRight.theta = lerp(prevRightTheta, lerp(prevRightTheta, paddleRight.targetTheta, paddleSpeed), t);

        ball.vy += g / substeps;
        const MaxSpeed = 25
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

        if (currentSpeed > MaxSpeed) {
            const scaleFactor = MaxSpeed / currentSpeed;
            ball.vx *= scaleFactor;
            ball.vy *= scaleFactor;
        }
        ball.x += ball.vx / substeps;
        ball.y += ball.vy / substeps;

        if (ball.y - ball.radius > height) {
            balls -= 1;
            launching = true;
            for (let r of RollOvers.rollOvers) {
                r.active = false;
            }

            if (balls < 0) {
                haveLost = true;
                lost()
                return;
            }
            ball.x = 425;
            ball.y = 800;
            ball.vx = 0;
            ball.vy = 0;
            break;
        }

        if (ball.x + ball.radius > 400 && !launching) {
            ball.x = 400 - ball.radius;
            ball.vx *= -ball.bouncyness;
        }

        if (ball.x - ball.radius < 0) {
            ball.x = 0 + ball.radius;
            ball.vx *= -ball.bouncyness;
        }

        checkPaddleCollision(paddleLeft, true);
        checkPaddleCollision(paddleRight, false);

        for (let b of bouncers) {
            b.bounce(ball);
        }
    }

    //bouncers
    for (let b of bouncers) {
        b.draw();
    }

    RollOvers.draw();

    RTrack.draw();
    LTrack.draw();

    //paddles
    noStroke();
    fill(solid.r, solid.g, solid.b);
    rectAt(paddleLeft.x, paddleLeft.y, paddleLeft.theta, paddleLeft.w, paddleLeft.h, 7);
    rectAt(paddleRight.x, paddleRight.y, paddleRight.theta, paddleRight.w, paddleRight.h, 7);

    //Shooter
    if (launcher) {
        fill(80);
        rectAt(400, 0, 0, 100, 650);
        fill(80, 20, 20);
        rectAt(400, 650 - shooter.h, 0, 100, shooter.h);
    }
    //Score
    fill(250);
    textSize(32);
    textAlign(LEFT, TOP);
    text(score, 0, 10);
    let ballDisplay = "";
    for (let j = 0; j < balls; j++) {
        ballDisplay = ballDisplay.concat("O");
    }
    text(ballDisplay, 0, 50)

    //ball
    noStroke();
    fill(255);
    ellipse(ball.x, ball.y, ball.radius * 2);
}

function rectAt(x, y, theta, w, h, r = 0) {
    push();
    translate(x, y);
    rotate(theta);
    rect(0, 0, w, h, r, r, r, r);
    pop();
}

function checkPaddleCollision(p, isLeft) {
    let tipX = p.x + cos(p.theta) * p.w;
    let tipY = p.y + sin(p.theta) * p.w;

    let lineDistSq = distSq(p.x, p.y, tipX, tipY);
    if (lineDistSq === 0) return;

    let u = ((ball.x - p.x) * (tipX - p.x) + (ball.y - p.y) * (tipY - p.y)) / lineDistSq;
    u = constrain(u, 0, 1);

    let closestX = p.x + u * (tipX - p.x);
    let closestY = p.y + u * (tipY - p.y);

    let d = dist(ball.x, ball.y, closestX, closestY);

    if (d < ball.radius) {
        let nx = -(tipY - p.y);
        let ny = (tipX - p.x);
        let len = sqrt(nx * nx + ny * ny);
        if (len === 0) return;
        nx /= len;
        ny /= len;

        if (ny > 0) {
            nx = -nx;
            ny = -ny;
        }

        let overlap = ball.radius - d;
        ball.x += nx * overlap;
        ball.y += ny * overlap;

        let dot = ball.vx * nx + ball.vy * ny;
        if (dot < 0) {
            ball.vx -= (1 + ball.bouncyness) * dot * nx;
            ball.vy -= (1 + ball.bouncyness) * dot * ny;

            let isFlipping = isLeft ? (p.targetTheta < p.theta) : (p.targetTheta > p.theta);
            if (isFlipping) {
                // Calculate position fraction relative to pivot (0 = pivot, 1 = tip)
                let distFromPivot = dist(ball.x, ball.y, p.x, p.y);
                let distFraction = constrain(distFromPivot / abs(p.w), 0, 1);

                // Tip gives max kick launch
                ball.vy = -23 * (0.3 + 0.7 * distFraction);
            }
        }
    }
}

function distSq(x1, y1, x2, y2) {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}