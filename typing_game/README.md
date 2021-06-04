<html>
<body>
<canvas id="sample" width="400" height="300">
図形を表示するには、canvasタグをサポートしたブラウザが必要です。
</canvas>
<script>
  var canvas = document.getElementById('sample');
  var context = canvas.getContext('2d');
  
  context.fillrect(math.random()*1000,math.random()*1000);
  
  
  
  
  
  
  
  requestAnimationFrame(main);
  }
  main();
</script>
</body>
</html>
