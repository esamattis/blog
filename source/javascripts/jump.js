
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
    velocityDown = 10;
    velocityRight = 3;
    acceleration = 1.02;

    mario.style.top = top + "px";
    mario.style.left = left + "px";
    mario.style.cursor = "pointer";
    mario.title = "Jump!";

  }

  function initAnimation(){
    console.log("anim");
    var value = rotate.shift();
    if (typeof value !== "number") return;

    mario.style.webkitTransform = "rotate("+ value + "deg)";
    mario.style.MozTransform = "rotate("+ value + "deg)";
    mario.style.transform = "rotate("+ value + "deg)";

    setTimeout(initAnimation, 100);
  }



  function drop(){
    mario.style.cursor = "default";

    if (top > 2000) {
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
    mario.addEventListener("mousedown", drop , true);
  }, 2000);
};

