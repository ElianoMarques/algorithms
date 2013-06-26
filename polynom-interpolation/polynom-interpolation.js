'use strict';

/** global variables */
var STRETCH_X = 1;
var STRETCH_Y = 1;
var X_MIN = -10;
var X_MAX = +10;
var Y_MIN = -10;
var Y_MAX = +10;
var X_OFFSET = 256;
var Y_OFFSET = 100;
var points = [];
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

function setCursorByID(id, cursorStyle) {
    var elem = document.getElementById(id);
    elem.style.cursor = cursorStyle;
}


/* calculate coordinates */

function c(x, isX) {
    if (isX) {
        return STRETCH_X * (x + X_OFFSET);
    }

    return STRETCH_Y * (-x + Y_OFFSET);
}

/* calculate coordinates - reversed */

function r(x, isX) {
    if (isX) {
        return x / STRETCH_X - X_OFFSET;
    }

    return -x / STRETCH_Y + Y_OFFSET;
}

function drawBoard(canvas) {
    var context = canvas.getContext('2d');
    X_MIN = parseInt(document.getElementById("X_MIN").value, 10);
    X_MAX = parseInt(document.getElementById("X_MAX").value, 10);
    Y_MIN = parseInt(document.getElementById("Y_MIN").value, 10);
    Y_MAX = parseInt(document.getElementById("Y_MAX").value, 10);

    // make canvas as big as possible
    context.canvas.width = window.innerWidth - 50;
    context.canvas.height = window.innerHeight - 100;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // stretch
    STRETCH_X = context.canvas.width / Math.abs(X_MAX - X_MIN);
    STRETCH_Y = context.canvas.height / Math.abs(Y_MAX - Y_MIN);

    // Adjust general settings to canvas size
    X_OFFSET = context.canvas.width / (STRETCH_X * 2);
    Y_OFFSET = context.canvas.height / (STRETCH_Y * 2);

    // grid
    context.strokeStyle = "#CDCDCD";
    for (var x = 0; x < X_MAX; x += 10) {
        context.beginPath();
        context.moveTo(c(x, true), c(Y_MIN, false));
        context.lineTo(c(x, true), c(Y_MAX, false));
        context.stroke();
    }
    for (var x = 0; x > X_MIN; x -= 10) {
        context.beginPath();
        context.moveTo(c(x, true), c(Y_MIN, false));
        context.lineTo(c(x, true), c(Y_MAX, false));
        context.stroke();
    }
    for (var y = 0; y < Y_MAX; y += 10) {
        context.beginPath();
        context.moveTo(c(X_MIN, true), c(y, false));
        context.lineTo(c(X_MAX, true), c(y, false));
        context.stroke();
    }
    for (var y = 0; y > Y_MIN; y -= 10) {
        context.beginPath();
        context.moveTo(c(X_MIN, true), c(y, false));
        context.lineTo(c(X_MAX, true), c(y, false));
        context.stroke();
    }
    context.strokeStyle = "#000000";

    // x-axis
    context.beginPath();
    context.moveTo(c(X_MIN, true), c(0, false));
    context.lineTo(c(X_MAX, true), c(0, false));
    context.closePath();
    context.stroke();

    // y-axis
    context.beginPath();
    context.moveTo(c(0, true), c(Y_MIN));
    context.lineTo(c(0, true), c(Y_MAX));
    context.closePath();
    context.stroke();

    // x-ticks
    var X_TICKS_STEPS = parseFloat(document.getElementById("X_TICKS_STEPS").value);
    if (X_TICKS_STEPS > 0) {
        for (var x = 0; x < X_MAX; x += X_TICKS_STEPS) {
            context.beginPath();
            context.moveTo(c(x, true), c(0) + 10);
            context.lineTo(c(x, true), c(0) - 10);
            context.closePath();
            context.stroke();
        }
        for (var x = 0; x > X_MIN; x -= X_TICKS_STEPS) {
            context.beginPath();
            context.moveTo(c(x, true), c(0) + 10);
            context.lineTo(c(x, true), c(0) - 10);
            context.closePath();
            context.stroke();
        }
    }

    // y-ticks
    var Y_TICKS_STEPS = parseFloat(document.getElementById("Y_TICKS_STEPS").value);
    if (Y_TICKS_STEPS > 0) {
        for (var y = 0; y > Y_MIN; y -= Y_TICKS_STEPS) {
            context.beginPath();
            context.moveTo(c(0, true) - 10, c(y, false));
            context.lineTo(c(0, true) + 10, c(y, false));
            context.closePath();
            context.stroke();
        }
        for (var y = 0; y < Y_MAX; y += Y_TICKS_STEPS) {
            context.beginPath();
            context.moveTo(c(0, true) - 10, c(y, false));
            context.lineTo(c(0, true) + 10, c(y, false));
            context.closePath();
            context.stroke();
        }
    }

    // arrow x
    context.beginPath();
    context.moveTo(context.canvas.width - 15, context.canvas.height / 2 - 15);
    context.lineTo(context.canvas.width, context.canvas.height / 2);
    context.lineTo(context.canvas.width - 15, context.canvas.height / 2 + 15);
    context.closePath();
    context.stroke();
    context.fill();


    // arrow y
    context.beginPath();
    context.moveTo(context.canvas.width / 2 - 15, 15);
    context.lineTo(context.canvas.width / 2, 0);
    context.lineTo(context.canvas.width / 2 + 15, 15);
    context.closePath();
    context.stroke();
    context.fill();

    drawPoints(canvas);
    writePointList();
    var polynomial = {};
    for (var power = 0; power < points.length; power++) {
        polynomial[power] = 0;
    }

    // calculate coefficients for monom
    {
        var A = setGauss(points);
        var x = gauss(A);

        for (var power = 0; power < points.length; power++) {
            polynomial[power] = x[power];
        }

        drawPolynomial(canvas, polynomial, 'blue');
        var f = document.getElementById("function").value;
        drawFunction(f, 'red');
    }

    // equally spaced
    if (document.getElementById("SHOW_EQUALLY_SPACED").checked) {
        var pointList = drawEquallySpacedPoints(f, 'lime');
        var A = setGauss(pointList);
        var x = gauss(A);

        for (var power = 0; power < pointList.length; power++) {
            polynomial[power] = x[power];
        }

        drawPolynomial(canvas, polynomial, 'lime');
    }

    // tschebyscheff spaced
    if (document.getElementById("SHOW_TSCHEBYSCHEFF_SPACED").checked) {
        var pointList = drawTschebyscheffSpacedPoints(f, '#FF00FF');
        var A = setGauss(pointList);
        var x = gauss(A);

        for (var power = 0; power < pointList.length; power++) {
            polynomial[power] = x[power];
        }

        drawPolynomial(canvas, polynomial, '#FF00FF');
    }
}

function drawEquallySpacedPoints(f, color) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    f = 'y=' + f;
    var n = parseInt(document.getElementById("n").value, 10);
    var X_FROM = parseInt(document.getElementById("X_FROM").value, 10);
    var X_TO = parseInt(document.getElementById("X_TO").value, 10);
    var evaluationSteps = (X_TO - X_FROM) / n;
    var pointList = new Array(n + 1);
    if (evaluationSteps > 0) {
        var i = 0;
        var y = 0;
        for (var x = X_FROM; x <= X_TO; x += evaluationSteps) {
            eval(f);
            pointList[i] = {
                "x": x,
                "y": y
            };
            i++;
        }
        drawPointsGeneral(pointList, color);
    }
    return pointList;
}

function drawTschebyscheffSpacedPoints(f, color) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    f = 'y=' + f;
    var n = parseInt(document.getElementById("n").value, 10);
    var evaluationSteps = (X_MAX - X_MIN) / n;
    var pointList = new Array(n + 1);
    if (evaluationSteps > 0) {
        var i = 0;
        for (var i = 0; i <= n; i++) {
            var x = Math.cos((2.0 * i + 1) / (2 * n + 2) * Math.PI);
            x = affineTransformation(x, parseInt(document.getElementById("X_FROM").value, 10), parseInt(document.getElementById("X_TO").value, 10));
            var y = 0;
            eval(f);
            pointList[i] = {
                "x": x,
                "y": y
            };
        }
        drawPointsGeneral(pointList, color);
    }
    return pointList;
}

function affineTransformation(y, a, b) {
    return (0.5 * y) * (b - a); // - (a+b)/(b-a);
}

function drawPointsGeneral(pointList, color) {
    for (var i = 0; i < pointList.length; i++) {
        context.beginPath();
        context.arc(c(pointList[i]["x"], true),
            c(pointList[i]["y"], false),
            2, /*radius*/
            0, 2 * Math.PI, false);
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.fillStyle = color;
        context.fill();
        context.stroke();
    }
}

function setGauss(points) {
    var n = points.length - 1;
    var A = new Array(n + 1);
    for (var i = 0; i < n + 1; i++) {
        A[i] = new Array(n + 2);
        var x = points[i]["x"];
        for (var j = 0; j < n + 1; j++) {
            A[i][j] = Math.pow(x, j);
        }
        A[i][n + 1] = points[i]["y"];
    }
    return A;
}

/** Solve a linear system of equations given by a n×n matrix 
    with a result vector n×1. */

function gauss(A) {
    var n = A.length;

    for (var i = 0; i < n; i++) {
        // Search for maximum in this column
        var maxEl = Math.abs(A[i][i]);
        var maxRow = i;
        for (var k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) {
                maxEl = Math.abs(A[k][i]);
                maxRow = k;
            }
        }

        // Swap maximum row with current row (column by column)
        for (var k = i; k < n + 1; k++) {
            var tmp = A[maxRow][k];
            A[maxRow][k] = A[i][k];
            A[i][k] = tmp;
        }

        // Make all rows below this one 0 in current column
        for (k = i + 1; k < n; k++) {
            var c = -A[k][i] / A[i][i];
            for (var j = i; j < n + 1; j++) {
                if (i == j) {
                    A[k][j] = 0;
                } else {
                    A[k][j] += c * A[i][j];
                }
            }
        }
    }

    // Solve equation Ax=b for an upper triangular matrix A
    var x = new Array(n);
    for (var i = n - 1; i > -1; i--) {
        x[i] = A[i][n] / A[i][i];
        for (var k = i - 1; k > -1; k--) {
            A[k][n] -= A[k][i] * x[i];
        }
    }
    return x;
}

function drawFunction(f, color) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    f = 'y=' + f;
    var evaluationSteps = parseFloat(document.getElementById("evaluationSteps").value);
    if (evaluationSteps > 0) {
        var y = 0;
        for (var x = X_MIN; x < X_MAX; x += evaluationSteps) {
            eval(f);
            if (x == X_MIN) {
                context.moveTo(c(x, true), c(y, false));
            } else {
                context.lineTo(c(x, true), c(y, false));
            }
        }
        context.stroke();
    }
}

function evaluatePolynomial(polynomial) {
    var y = 0;
    for (var power in polynomial) {
        y += polynomial[power] * Math.pow(x, power);
    }
    return y;
}

function drawPolynomial(canvas, polynomial, color) {
    var context = canvas.getContext('2d');
    context.beginPath();
    context.strokeStyle = color;
    var evaluationSteps = parseFloat(document.getElementById("evaluationSteps").value);
    if (evaluationSteps > 0) {
        for (var x = X_MIN; x < X_MAX; x += evaluationSteps) {
            var y = 0;
            for (var power in polynomial) {
                y += polynomial[power] * Math.pow(x, power);
            }
            if (x == X_MIN) {
                context.moveTo(c(x, true), c(y, false));
            } else {
                context.lineTo(c(x, true), c(y, false));
            }
        }
        context.stroke();
    }

    // Write polynomial to document
    var mathEl = document.getElementById("polynomial");
    mathEl.innerHTML = '$p(x) = ';
    for (var power in polynomial) {
        if (polynomial[power] !== 0) {
            if (polynomial[power] == 1) {
                mathEl.innerHTML += '+x^' + power + ' ';
            } else {
                mathEl.innerHTML += '+' + polynomial[power] + 'x^' + power + ' ';
            }
        }
    }
    mathEl.innerHTML += '$';
}

function euklideanDist(p1, p2) {
    return Math.sqrt(
        Math.pow(p1["x"] - p2["x"], 2) + Math.pow(p1["y"] - p2["y"], 2));
}

/** add or remove a point */

function addPoint(event, canvas, mouseCoords, radius) {
    if (event.ctrlKey) {
        // remove point that is nearest to mouse coords
        if (points.length >= 1) {
            nearestMouseCIndex = 0;
            nearestDist = euklideanDist(mouseCoords, points[0]);
            var mCoords = {
                "x": r(mouseCoords["x"], true),
                "y": r(mouseCoords["y"], false)
            };
            for (var i = 1; i < points.length; i++) {
                var tmpDist = euklideanDist(mCoords, points[i]);
                if (tmpDist < nearestDist) {
                    nearestDist = tmpDist;
                    nearestMouseCIndex = i;
                }
            }
            points.splice(nearestMouseCIndex, 1);
        }
    } else {
        points.push({
            "x": r(mouseCoords["x"], true),
            "y": r(mouseCoords["y"], false)
        });
    }
}

/** draw all permanently added points */

function drawPoints(canvas) {
    for (var i = 0; i < points.length; i++) {
        context.beginPath();
        context.arc(c(points[i]["x"], true),
            c(points[i]["y"], false),
            2, /*radius*/
            0, 2 * Math.PI, false);
        context.lineWidth = 1;
        context.strokeStyle = 'black';
        context.fillStyle = "rgb(0,0,0)";
        context.fill();
        context.stroke();
    }
}

function writePointList() {
    var tArea = document.getElementById("pointlist");
    tArea.value = '';
    for (var i = 0; i < points.length; i++) {
        tArea.value += "(" + points[i]["x"] + "|" + points[i]["y"] + "), ";
    }
}

/** get the current position of the mouse */

function getMouseCoords(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        "x": evt.clientX - rect.left,
        "y": evt.clientY - rect.top
    };
}

function modifyURL() {
    var f = encodeURIComponent(document.getElementById("function").value);
    var e = encodeURIComponent(document.getElementById("evaluationSteps").value);
    var l = encodeURIComponent(document.getElementById("X_MIN").value);
    var r = encodeURIComponent(document.getElementById("X_MAX").value);
    var t = encodeURIComponent(document.getElementById("Y_MAX").value);
    var b = encodeURIComponent(document.getElementById("Y_MIN").value);
    var xt = encodeURIComponent(document.getElementById("X_TICKS_STEPS").value);
    var yt = encodeURIComponent(document.getElementById("Y_TICKS_STEPS").value);
    document.getElementById("newWindow").href = "polynom-interpolation.htm?f=" + f + "&e=" + e + "&l=" + l + "&r=" + r + "&t=" + t + "&b=" + b + "&xt=" + xt + "&yt=" + yt + "&points=" + encodeURIComponent(JSON.stringify(points));
}

window.onload = function WindowLoad(event) {
    var qs = (function (a) {
        if (a === ""){
            return {};
        }

        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2){
                continue;
            }

            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    if (qs["f"] != undefined) {
        document.getElementById("function").value = qs["f"];
    }
    if (qs["l"] != undefined) {
        document.getElementById("X_MIN").value = qs["l"];
    }
    if (qs["r"] != undefined) {
        document.getElementById("X_MAX").value = qs["r"];
    }
    if (qs["t"] != undefined) {
        document.getElementById("Y_MAX").value = qs["t"];
    }
    if (qs["b"] != undefined) {
        document.getElementById("Y_MIN").value = qs["b"];
    }
    if (qs["xt"] != undefined) {
        document.getElementById("X_TICKS_STEPS").value = qs["xt"];
    }
    if (qs["yt"] != undefined) {
        document.getElementById("Y_TICKS_STEPS").value = qs["yt"];
    }
    if (qs["e"] != undefined) {
        document.getElementById("evaluationSteps").value = qs["e"];
    }
    if (qs["points"] != undefined) {
        points = JSON.parse(qs["points"]);
    }

    drawBoard(canvas, {
        "x": 0,
        "y": 0
    }, 10);
    setCursorByID("myCanvas", "crosshair");

    /** scroll */
    canvas.onmousewheel = function (event) {
        event.preventDefault();

        var mousex = event.clientX - canvas.offsetLeft;
        var mousey = event.clientY - canvas.offsetTop;
        var wheel = parseInt(event.wheelDelta, 10) / 120; //n or -n

        var zoom = 1 + wheel / 2;

        document.getElementById("X_MIN").value = parseInt(document.getElementById("X_MIN").value, 10) + wheel;
        document.getElementById("X_MAX").value = parseInt(document.getElementById("X_MAX").value, 10) - wheel;
        document.getElementById("Y_MIN").value = parseInt(document.getElementById("Y_MIN").value, 10) + wheel;
        document.getElementById("Y_MAX").value = parseInt(document.getElementById("Y_MAX").value, 10) - wheel;
        drawBoard(canvas, {
            "x": 0,
            "y": 0
        }, 10);
    };

    /** event listeners */
    canvas.addEventListener('mousemove',
        function (evt) {
            var mouseCoords = getMouseCoords(canvas, evt);
            drawBoard(canvas, mouseCoords, 10);
            // draw coordinates next to mouse
            context.fillStyle = "blue";
            context.font = "bold 16px Arial";
            var x = r(mouseCoords["x"], true).toFixed(3);
            var y = r(mouseCoords["y"], false).toFixed(3);
            context.fillText("(" + x + ", " + y + ")", mouseCoords["x"] + 5, mouseCoords["y"] - 5);
        }, false);

    canvas.addEventListener("mousedown",
        function (event) {
            var mouseCoords = getMouseCoords(canvas, event);
            addPoint(event, canvas, mouseCoords, 10);
        }, false);
};