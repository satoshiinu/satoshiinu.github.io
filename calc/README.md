# 電卓
<html>
  <body>
    <input type="number" id="button_field"><br>
      <button type="button" onclick="char_delete(0)">⌫</button>
      <button type="button" onclick="char_delete(1)">CE</button>
      <button type="button" onclick="char_delete(2)">C</button>
      <button type="button" onclick="math('/')">÷</button>
      <button type="button" onclick="math('%')">%</button>
    <br>
      <button type="button" onclick="input(7)">7</button>
      <button type="button" onclick="input(8)">8</button>
      <button type="button" onclick="input(9)">9</button>
      <button type="button" onclick="math('*')">×</button>
      <button type="button" onclick="math('**')">𝑥²</button>
    <br>
      <button type="button" onclick="input(4)">4</button>
      <button type="button" onclick="input(5)">5</button>
      <button type="button" onclick="input(6)">6</button>
      <button type="button" onclick="math('-')">-</button>
    <br>
      <button type="button" onclick="input(1)">1</button>
      <button type="button" onclick="input(2)">2</button>
      <button type="button" onclick="input(3)">3</button>
      <button type="button" onclick="math('+')">+</button>
    <br>
      <button type="button" onclick="minus()">-</button>
      <button type="button" onclick="input(0)">0</button>
      <button type="button" onclick="inputdot(ondot)">.</button>
      <button type="button" onclick="math('=')">=</button>
    <br>
    <!--デバック-->
    <h3>デバック</h3>
    button_field2<input type="number" id="button_field2" disabled>
    <br>
    selectmath<input type="text" id="sld">
    <br>
    placeholder<input type="text" id="pld">
    <br>
    ondot<input type="text" id="dod">
    
    <script src="script.js"></script>
  </body>
<html>
