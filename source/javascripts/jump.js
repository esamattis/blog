
window.onload = function() {

  var top,
      left,
      startTop,
      startLeft,
      velocityDown,
      velocityRight,
      acceleration;

  var rotate = [0, -5, 0, 5, 0];

  // Global hahaha!
  window.mario = document.querySelectorAll(".mario")[0];


  function init(){

    top = startTop = 100;
    left = startLeft = 87;
    velocityDown = 8;
    velocityRight = 3;
    acceleration = 1.02;

    mario.style.top = top + "px";
    mario.style.left = left + "px";
    mario.style.visibility = "visible";
    mario.title = "Jump!";

  }

  function initAnimation(){
    var value = rotate.shift();
    if (typeof value !== "number") return;

    mario.style.webkitTransform = "rotate("+ value + "deg)";
    mario.style.MozTransform = "rotate("+ value + "deg)";
    mario.style.transform = "rotate("+ value + "deg)";

    setTimeout(initAnimation, 100);
  }



  function drop(){

    if (top > window.innerHeight+5000) {
      mario.style.visibility = "hidden";
      setTimeout(init, 5000);
      return;
    }

    velocityDown = velocityDown * acceleration;

    top += velocityDown;
    left += velocityRight;

    mario.style.top = top + "px";
    mario.style.left = left + "px";

    setTimeout(drop , 10);
  }

  setTimeout(function(){
    initAnimation();
    init();
    console.log("ready set go!");
    mario.addEventListener("mouseout", drop , true);
    mario.addEventListener("touchstart", drop , true);
  }, 5000);
};

