# 電卓
<html>
  <body>
    <input type="number" id="input_field"><br>
  <button type="button" onclick="char_delete(0)" class="button" >⌫</button>
      <button type="button" onclick="char_delete(1)" class="button" >CE</button>
      <button type="button" onclick="char_delete(2)" class="button" >C</button>
      <button type="button" onclick="math('/')" class="button" >÷</button>
      <button type="button" onclick="math('%')" class="button" >%</button>
    <br>
      <button type="button" onclick="input(7)" class="button" >7</button>
      <button type="button" onclick="input(8)" class="button" >8</button>
      <button type="button" onclick="input(9)" class="button" >9</button>
      <button type="button" onclick="math('*')" class="button" >×</button>
      <button type="button" onclick="math('**')" class="button" >𝑥²</button>
    <br>
      <button type="button" onclick="input(4)" class="button" >4</button>
      <button type="button" onclick="input(5)" class="button" >5</button>
      <button type="button" onclick="input(6)" class="button" >6</button>
      <button type="button" onclick="math('-')" class="button" >-</button>
    <br>
      <button type="button" onclick="input(1)" class="button" >1</button>
      <button type="button" onclick="input(2)" class="button" >2</button>
      <button type="button" onclick="input(3)" class="button" >3</button>
      <button type="button" onclick="math('+')" class="button" >+</button>
    <br>
      <button type="button" onclick="minus()" class="button" >-</button>
      <button type="button" onclick="input(0)" class="button" >0</button>
      <button type="button" onclick="inputdot(ondot)" class="button" >.</button>
      <button type="button" onclick="math('=')" class="button" >=</button>
    <br>
    <!--デバック-->
    <h3>デバック</h3>
    button_field2<input type="number" id="input_field2" disabled>
    <br>
    selectmath<input type="text" id="sld">
    <br>
    placeholder<input type="text" id="pld">
    <br>
    ondot<input type="text" id="dod">
    
    <script src="script.js"></script>
    <link rel="stylesheet" href="style.css">
  </body>
<html>
  
