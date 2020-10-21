var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');


var standard_axis = true;
var startup = true;

var theta = 10;
var theta_rad = undefined;
var mass = 10;
var mu_static = 0.5;
var mu_kintic = 0.4;
var rect_height = 45;
var rect_width = 60;
var origin_x = canvas.width / 8;
var text_origin_x = canvas.width / 2 + 100;
var origin_y = 100;
var SLOPE_LEN = Math.min(canvas.width / 3, canvas.height/1.4);


window.addEventListener('resize', function () {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
});

let mouse = {
    x: undefined,
    y: undefined,
    x_click: undefined,
    y_click: undefined,
    x_up: undefined,
    y_up: undefined,
};

window.addEventListener('mousemove', function (e) {
    mouse.x = event.offsetX;
    mouse.y = event.offsetY;
});

window.addEventListener('mousedown', e => {
    mouse.x_click = e.offsetX;
    mouse.y_click = e.offsetY;
});

window.addEventListener('mouseup', e => {
    mouse.x_up = e.offsetX;
    mouse.y_up = e.offsetY;
    draw();
});

var drawButton = document.getElementById('solveButton');
drawButton.addEventListener('click', draw);


draw();


function draw() {
    if (startup) {
        startup = false;
    } else {
        mass = Number(document.getElementById('mass').value);
        theta = Number(document.getElementById('theta').value);
        mu_static = Number(document.getElementById('mu_static').value);
        mu_ke = Number(document.getElementById('mu_ke').value);
        
    }
    
    c.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid(c, canvas.width, canvas.height, '#eee', 20)
    c.strokeStyle = "#000000"
    draw_block_ramp(theta);
    
}
function draw_block_ramp() {
    theta_rad = theta * Math.PI / 180;
    c.rotate(theta_rad);
    c.fillStyle = 'rgba(255, 0, 0, 0.5)';

    c.beginPath();

    var y_base = origin_y + SLOPE_LEN * Math.sin(theta_rad);
    var x_base = origin_x + SLOPE_LEN * Math.cos(theta_rad);

    //if (mouse.x_click - 10 < x_base && mouse.x_click + 10 > x_base
    //    && mouse.y_click - 10 < y_base && mouse.y_click + 10 > y_base) {
    //    if (Math.abs(y_base - mouse.y_up) > 20) {
    //        y_base = mouse.y_up;
    //        x_base = mouse.x_up;
    //        theta_rad = Math.atan((y_base - origin_y) / (x_base - origin_x));
    //    }
       
    //}

    c.moveTo(get_x(origin_x, origin_y), get_y(origin_x, origin_y));
    c.lineTo(get_x(x_base, y_base), get_y(x_base, y_base));
    c.moveTo(get_x(origin_x, y_base), get_y(origin_x, y_base));
    c.lineTo(get_x(x_base, y_base), get_y(x_base, y_base));
    

    var x_rect = get_x(origin_x, origin_y) + SLOPE_LEN/6;
    var y_rect = get_y(origin_x, origin_y) - rect_height;
    c.fillRect(x_rect, y_rect, rect_width, rect_height);

    //arc theta measure
    c.arc(get_x(x_base, y_base), get_y(x_base, y_base), 80, Math.PI - theta_rad, Math.PI);

    //arc label
    c.font = "10px Comic Sans MS";
    c.lineWidth = 1;
    c.strokeText("\u03F4 = " + theta.toString(), 
        get_x(x_base, y_base) - 70,
        get_y(x_base, y_base) + 10);

    rec_center_x = x_rect + rect_width / 2;
    rec_center_y = y_rect + rect_height / 2; 

    if (mouse.x_click - 10 < x_base && mouse.x_click + 10 > x_base
        && mouse.y_click - 10 < y_base && mouse.y_click + 10 > y_base) {
        if (standard_axis) {
            standard_axis = false;
        } else {
            standard_axis = true;
        }
    }
 
    x_base = get_x(x_base, y_base);
    y_base = get_y(x_base, y_base);

    draw_forces(rec_center_x, rec_center_y, x_base, y_base);

    c.rotate(-theta_rad);
}
function draw_forces(rec_center_x, rec_center_y, x_base, y_base) {

    MAX_LEN = 60;
    //forces
    var Fg = mass * 9.81;
    var Fn = Math.cos(theta_rad) * Fg;
    var Ff = Math.min(Fn * mu_static, Math.sin(theta_rad) *Fg);

    var norm = Math.max(Fg, Fn, Ff);
    c.stroke();
    //friction
    drawArrow(c, rec_center_x - MAX_LEN * Ff / norm, rec_center_y, rec_center_x, rec_center_y,
        2, 2, 10, 5, 'black', 2);
    c.lineWidth = 1;
    c.strokeText("Ff = " + Ff.toFixed(1).toString() + " N", rec_center_x - 80 * Ff / norm, rec_center_y - 10);
    //normal
    drawArrow(c, rec_center_x, rec_center_y, rec_center_x, rec_center_y - MAX_LEN * Fn / norm,
        2, 1, 10, 5, 'black', 2);
    c.lineWidth = 1;
    c.strokeText("Fn = " + Fn.toFixed(1).toString() + " N", rec_center_x + 10, rec_center_y - MAX_LEN * Fn / norm);
    //gravity
    drawArrow(c, rec_center_x, rec_center_y,
        rec_center_x + Math.sin(theta_rad) * MAX_LEN * Fg / norm,
        rec_center_y + Math.cos(theta_rad) * MAX_LEN * Fg / norm,
        2, 1, 10, 5, 'black', 2);
    c.lineWidth = 1;
    c.strokeText("Fg = " + Fg.toFixed(1).toString() + " N",
        rec_center_x + Math.sin(theta_rad) * 70 * Fg / norm,
        rec_center_y + Math.cos(theta_rad) * 70 * Fg / norm);

    // draw FOR point
    c.fillStyle = 'black';
    c.beginPath();
    c.arc(x_base, y_base, 5, 0, 2 * Math.PI);
    c.fill();


    // draw compoenent forces
    if (standard_axis) {
        Ffx = Ff * Math.cos(theta_rad);
        Ffy = Ff * Math.sin(theta_rad);
        Fnx = Fn * Math.sin(theta_rad);
        Fny = Fn * Math.cos(theta_rad);
        c.setLineDash([5, 5]);
        drawArrow(c, rec_center_x, rec_center_y,
            rec_center_x - Math.sin(theta_rad) * MAX_LEN * Fny/norm, 
            rec_center_y - Math.cos(theta_rad) * MAX_LEN * Fny / norm,
            1, 1, 10, 4, 'blue', 1);
        c.setLineDash([5, 5]);
        drawArrow(c, 
            rec_center_x - Math.sin(theta_rad) * MAX_LEN * Fny/norm, 
            rec_center_y - Math.cos(theta_rad) * MAX_LEN * Fny / norm,
            rec_center_x,
            rec_center_y - MAX_LEN * Fn / norm,
            1, 1, 10, 4, 'blue', 1);
        c.setLineDash([5, 5]);
        drawArrow(c, rec_center_x, rec_center_y,
            rec_center_x - Math.cos(theta_rad) * MAX_LEN * Ffx / norm,
            rec_center_y + Math.sin(theta_rad) * MAX_LEN * Ffx / norm,
            1, 1, 10, 4, 'blue', 1);
        c.setLineDash([5, 5]);
        drawArrow(c,
            rec_center_x - Math.cos(theta_rad) * MAX_LEN * Ffx / norm,
            rec_center_y + Math.sin(theta_rad) * MAX_LEN * Ffx / norm,
            rec_center_x - Ff * MAX_LEN /norm,
            rec_center_y,
            1, 1, 10, 4, 'blue', 1);
        c.stroke();
        c.setLineDash([]);
        c.strokeStyle = 'black';

        // draw FOR
        start_x = x_base;
        start_y = y_base;
        c.lineWidth = 1;
        c.strokeText("y", start_x - 50 *Math.sin(theta_rad) - 10,
            start_y - 40 * Math.cos(theta_rad));
        drawArrow(c, start_x, start_y,
            start_x - 50*Math.sin(theta_rad),
            start_y - 50 * Math.cos(theta_rad),
            1, 1, 10, 4, 'blue', 1);
        c.lineWidth = 1;
        c.strokeStyle = 'black';
        c.strokeText("x", start_x + 40 * Math.cos(theta_rad),
            start_y - 50 * Math.sin(theta_rad) + 10);
        drawArrow(c, start_x, start_y,
            start_x + 50*Math.cos(theta_rad),
            start_y - 50 * Math.sin(theta_rad),
            1, 1, 10, 4, 'blue', 1);
        c.strokeStyle = 'black';


        c.rotate(-theta_rad);
        c.strokeStyle = 'black';
        c.font = "12px Comic Sans MS";

        var Net_fx = Fn * Math.sin(theta_rad) - Ff * Math.cos(theta_rad);
        var Net_fy = Fn * Math.cos(theta_rad) + Ff * Math.sin(theta_rad)- Fg;
        //Fx
        c.strokeText("\u2211 Fx = Fnx - Ffx = Fn (sin(\u03B8)) - Ff (cos(\u03B8)) = ma_x ",
            text_origin_x, origin_y-40);
        
        c.strokeText("\u2211 Fx = " + Net_fx.toFixed(2).toString() 
            + " N = (" + mass.toString() + " kg)a_x ", text_origin_x, origin_y -20);
        c.strokeText("a_x = " + (Net_fx / mass).toFixed(2).toString() + "m/s*s", text_origin_x, origin_y);

        c.strokeText("\u2211 Fy = Fny + Ffy - Fg = Fn (cos(\u03B8)) - Fg = ma_y ",
            text_origin_x, origin_y + 40);

        c.strokeText("\u2211 Fy = " + Net_fy.toFixed(2).toString()
            + " N = (" + mass.toString() + " kg)a_x ", text_origin_x, origin_y +60);
        c.strokeText("a_y = " + (Net_fy / mass).toFixed(2).toString() + "m/s*s", text_origin_x, origin_y + 80);

        c.strokeText("a = (ax^2 + ay^2)^0.5 = " + (Math.sqrt(Net_fy * Net_fy + Net_fx * Net_fx)/mass).toFixed(2).toString() + " m/ s*s"  , text_origin_x, origin_y + 120);
        c.stroke();
        c.rotate(theta_rad);


    } else {
        c.setLineDash([5, 5]);
        drawArrow(c, rec_center_x, rec_center_y,
            rec_center_x, rec_center_y + Math.cos(theta_rad) * MAX_LEN * Fg / norm,
            1, 1, 10, 4, 'red', 1);
        c.setLineDash([5, 5]);
        drawArrow(c, rec_center_x, 
            rec_center_y + Math.cos(theta_rad) * MAX_LEN * Fg / norm,
            rec_center_x + Math.sin(theta_rad) * MAX_LEN * Fg / norm, 
            rec_center_y + Math.cos(theta_rad) * MAX_LEN * Fg / norm,
            1, 1, 10, 4, 'red', 1);
        //c.lineTo(rec_center_x + MAX_LEN * Fg * Math.cos(theta_rad)/norm,
        //    rec_center_y + MAX_LEN * Math.cos(theta_rad)/norm);
        c.stroke();
        c.setLineDash([]);
        c.strokeStyle = 'black';

        // draw FOR
        start_x = x_base;
        start_y = y_base;
        c.lineWidth = 1;
        c.strokeText("y", start_x - 10, start_y - 40);
        drawArrow(c, start_x, start_y,
            start_x, start_y - 50,
            1, 1, 10, 4, 'red', 1);
        c.lineWidth = 1;
        c.strokeStyle = 'black';
        c.strokeText("x", start_x + 40, start_y - 7);
        drawArrow(c, start_x, start_y,
            start_x + 50, start_y,
            1, 1, 10, 4, 'red', 1);
        c.strokeStyle = 'black';
        c.rotate(-theta_rad);
        c.strokeStyle = 'black';
        c.font = "12px Comic Sans MS";

        var Net_fx = Fg * Math.sin(theta_rad) - Ff;
        var Net_fy = Fn - Fg * Math.cos(theta_rad);
        //Fx
        c.strokeText("\u2211 Fx = Fgx - Ff = Fg (sin(\u03B8)) - Ff  = ma ",
            text_origin_x, origin_y - 40);

        c.strokeText("\u2211 Fx = " + Net_fx.toFixed(2).toString()
            + " N = (" + mass.toString() + " kg)a ", text_origin_x, origin_y -20);
        c.strokeText("a = " + (Net_fx / mass).toFixed(2).toString() + "m/s*s", text_origin_x, origin_y);

        c.strokeText("\u2211 Fy = Fn - Fgy = Fn - Fg (cos(\u03B8))= 0 ",
            text_origin_x, origin_y + 40);

        c.stroke();
        c.rotate(theta_rad);
    }
}
function get_x (x, y) {
    return y * Math.sin(theta_rad) + x * Math.cos(theta_rad);
}
function get_y(x, y) {
    return -x * Math.sin(theta_rad) + y * Math.cos(theta_rad);
}

function drawGrid(ctx, w, h, strokeStyle, step) {
    for (var x = 0.5; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
    }

    for (var y = 0.5; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
    }

    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}

// From: http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
// Draw arrow head
function drawHead(ctx, x0, y0, x1, y1, x2, y2, style, color, width) {
    c.setLineDash([]);
    if (typeof (x0) == 'string') {
        x0 = parseInt(x0);
    }
    if (typeof (y0) == 'string') {
        y0 = parseInt(y0);
    }
    if (typeof (x1) == 'string') {
        x1 = parseInt(x1);
    }
    if (typeof (y1) == 'string') {
        y1 = parseInt(y1);
    }
    if (typeof (x2) == 'string') {
        x2 = parseInt(x2);
    }
    if (typeof (y2) == 'string') {
        y2 = parseInt(y2);
    }

    var radius = 3,
        twoPI = 2 * Math.PI;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);

    switch (style) {
        case 0:
            var backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
            ctx.arcTo(x1, y1, x0, y0, .55 * backdist);
            ctx.fill();
            break;
        case 1:
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x0, y0);
            ctx.fill();
            break;
        case 2:
            ctx.stroke();
            break;
        case 3:
            var cpx = (x0 + x1 + x2) / 3;
            var cpy = (y0 + y1 + y2) / 3;
            ctx.quadraticCurveTo(cpx, cpy, x0, y0);
            ctx.fill();
            break;
        case 4:
            var cp1x, cp1y, cp2x, cp2y, backdist;
            var shiftamt = 5;
            if (x2 == x0) {
                backdist = y2 - y0;
                cp1x = (x1 + x0) / 2;
                cp2x = (x1 + x0) / 2;
                cp1y = y1 + backdist / shiftamt;
                cp2y = y1 - backdist / shiftamt;
            } else {
                backdist = Math.sqrt(((x2 - x0) * (x2 - x0)) + ((y2 - y0) * (y2 - y0)));
                var xback = (x0 + x2) / 2;
                var yback = (y0 + y2) / 2;
                var xmid = (xback + x1) / 2;
                var ymid = (yback + y1) / 2;
                var m = (y2 - y0) / (x2 - x0);
                var dx = (backdist / (2 * Math.sqrt(m * m + 1))) / shiftamt;
                var dy = m * dx;
                cp1x = xmid - dx;
                cp1y = ymid - dy;
                cp2x = xmid + dx;
                cp2y = ymid + dy;
            }
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
            ctx.fill();
            break;
    }
    ctx.restore();
}

// draw arrow
function drawArrow(ctx, x1, y1, x2, y2, style, which, angle, d, color, width) {
    if (typeof (x1) == 'string') {
        x1 = parseInt(x1);
    }
    if (typeof (y1) == 'string') {
        y1 = parseInt(y1);
    }
    if (typeof (x2) == 'string') {
        x2 = parseInt(x2);
    }
    if (typeof (y2) == 'string') {
        y2 = parseInt(y2);
    }
    style = typeof (style) != 'undefined' ? style : 3;
    which = typeof (which) != 'undefined' ? which : 1;
    angle = typeof (angle) != 'undefined' ? angle : Math.PI / 9;
    d = typeof (d) != 'undefined' ? d : 10;
    color = typeof (color) != 'undefined' ? color : '#000';
    width = typeof (width) != 'undefined' ? width : 1;
    var toDrawHead = typeof (style) != 'function' ? drawHead : style;
    var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    var ratio = (dist - d / 3) / dist;
    var tox, toy, fromx, fromy;
    if (which & 1) {
        tox = Math.round(x1 + (x2 - x1) * ratio);
        toy = Math.round(y1 + (y2 - y1) * ratio);
    } else {
        tox = x2;
        toy = y2;
    }

    if (which & 2) {
        fromx = x1 + (x2 - x1) * (1 - ratio);
        fromy = y1 + (y2 - y1) * (1 - ratio);
    } else {
        fromx = x1;
        fromy = y1;
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();

    var lineangle = Math.atan2(y2 - y1, x2 - x1);
    var h = Math.abs(d / Math.cos(angle));
    if (which & 1) {
        var angle1 = lineangle + Math.PI + angle;
        var topx = x2 - Math.cos(angle1) * h;
        var topy = y2 - Math.sin(angle1) * h;
        var angle2 = lineangle + Math.PI - angle;
        var botx = x2 - Math.cos(angle2) * h;
        var boty = y2 - Math.sin(angle2) * h;
        toDrawHead(ctx, topx, topy, x2, y2, botx, boty, style, color, width);
    }

    if (which & 2) {
        var angle1 = lineangle + angle;
        var topx = x1 - Math.cos(angle1) * h;
        var topy = y1 - Math.sin(angle1) * h;
        var angle2 = lineangle - angle;
        var botx = x1 - Math.cos(angle2) * h;
        var boty = y1 - Math.sin(angle2) * h;
        toDrawHead(ctx, topx, topy, x1, y1, botx, boty, style, color, width);
    }
}

// draw arced arrow
function drawArcedArrow(ctx, x, y, r, startangle, endangle, anticlockwise, style, which, angle, d, color, width) {
    style = typeof (style) != 'undefined' ? style : 3;
    which = typeof (which) != 'undefined' ? which : 1;
    angle = typeof (angle) != 'undefined' ? angle : Math.PI / 8;
    d = typeof (d) != 'undefined' ? d : 10;
    color = typeof (color) != 'undefined' ? color : '#000';
    width = typeof (width) != 'undefined' ? width : 1;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.arc(x, y, r, startangle, endangle, anticlockwise);
    ctx.stroke();
    var sx, sy, lineangle, destx, desty;
    ctx.strokeStyle = 'rgba(0,0,0,0)';
    if (which & 1) {
        sx = Math.cos(startangle) * r + x;
        sy = Math.sin(startangle) * r + y;
        lineangle = Math.atan2(x - sx, sy - y);
        if (anticlockwise) {
            destx = sx + 10 * Math.cos(lineangle);
            desty = sy + 10 * Math.sin(lineangle);
        } else {
            destx = sx - 10 * Math.cos(lineangle);
            desty = sy - 10 * Math.sin(lineangle);
        }
        drawArrow(ctx, sx, sy, destx, desty, style, 2, angle, d, color, width);
    }

    if (which & 2) {
        sx = Math.cos(endangle) * r + x;
        sy = Math.sin(endangle) * r + y;
        lineangle = Math.atan2(x - sx, sy - y);
        if (anticlockwise) {
            destx = sx - 10 * Math.cos(lineangle);
            desty = sy - 10 * Math.sin(lineangle);
        } else {
            destx = sx + 10 * Math.cos(lineangle);
            desty = sy + 10 * Math.sin(lineangle);
        }
        drawArrow(ctx, sx, sy, destx, desty, style, 2, angle, d, color, width);
    }
    ctx.restore();
}





class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
    };

    draw = () => {
        // this is where we control the shape's appearance
    };

    update = () => {
        // this is where we control movement and interactivity
        this.draw();
    };
};

class Line {
    constructor(x, y, offset) {
        this.x = x;
        this.y = y;
        this.offset = offset;
        this.radians = 0;
        this.velocity = 0.01;
    }
    draw = () => {
        c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        c.fillStyle = 'rgba(255, 255, 255, 0.3)';
        c.beginPath();
        c.arc(this.x, this.y, 1, 0, Math.PI * 2, false);
        c.fill();
        c.moveTo(this.x, this.y);
        c.lineTo(this.x + 300, this.y - 1000);
        c.stroke();
        c.closePath();
        this.update();
    }
    update = () => {
        // this is where we control movement and interactivity
    }
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);

    /* this is where we call our animation methods, such as  
    Shape.draw() */
};



