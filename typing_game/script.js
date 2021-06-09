  //変数作り
  var canvas = document.getElementById('sample');
  var context = canvas.getContext('2d');
  key="";
  context.font="50px MS Mincho";
  title=true;
  doplayinggame=false;
  var bg = new Image();
  bg.src = 'bg_1.png';
  
  
function main() {  
	//毎回の初期化
	key="";
	if (title) {
		
		context.drawImage (bg,0,0,512,194,0,0,512,194)
		
	}
	
	if (doplayinggame) {
		window.addEventListener('DOMContentLoaded', function(){
			window.addEventListener("keydown", function(e){
				e.preventDefault();
				console.log(e.key);
				key=e.key;
				
				
				//描画
				context.fillText(key,Math.random()*512,Math.random()*512);
				
			});
		});
	}
	
	//次のフレームへ（ループ）
	requestAnimationFrame(main);
};
addEventListener("load", main(), false);
