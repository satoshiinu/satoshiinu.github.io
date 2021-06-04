<html>
<body>
<canvas id="sample" width="400" height="300">
図形を表示するには、canvasタグをサポートしたブラウザが必要です。
</canvas>
<script>
  //変数作り
  var canvas = document.getElementById('sample');
  var context = canvas.getContext('2d');
  key="";
  context.font="50px MS Mincho";
  
  
  
  
  function main() {  
  //毎回の初期化
  key="";
  
  
  
  window.addEventListener('DOMContentLoaded', function(){
  window.addEventListener("keydown", function(e){
  e.preventDefault();
  console.log(e.key);
  key=e.key;
  
  
  //描画
  context.fillText(key,Math.random()*400,Math.random()*400);
  
  
  });
});
  
  
  
  
  //次のフレームへ（ループ）
  requestAnimationFrame(main);
  };
  main();
</script>
</body>
</html>
