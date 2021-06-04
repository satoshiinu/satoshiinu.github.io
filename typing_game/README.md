<html>
<body>
<canvas id="sample" width="400" height="300">
図形を表示するには、canvasタグをサポートしたブラウザが必要です。
</canvas>
<script>
  var canvas = document.getElementById('sample');
  var context = canvas.getContext('2d');
  key="";
  
  
  
  
  function main() {  
  context.fillText(key,Math.random()*400,Math.random()*400);
  
  window.addEventListener('DOMContentLoaded', function(){
  window.addEventListener("keydown", function(e){
  e.preventDefault();
  console.log(e.key);
  key=e.key;
  });
});
  
  
  
  
  
  requestAnimationFrame(main);
  }
  main();
</script>
</body>
</html>
