# 電卓
<html>
  <body>
    <script src="script.js"></script>
    <input type="number" id="button_field"><br>
      <button type="button" value="" onclick="char_delete(0)">⌫</button>
      <button type="button" value="" onclick="char_delete(1)">CE</button>
      <button type="button" value="" onclick="char_delete(2)">C</button>
      <button type="button" value="" onclick="math('/')">÷</button>
      <button type="button" value="" onclick="math('%')">%</button>
    <br>
      <button type="button" value="" onclick="button(7)">7</button>
      <button type="button" value="" onclick="button(8)">8</button>
      <button type="button" value="" onclick="button(9)">9</button>
      <button type="button" value="" onclick="math('*')">×</button>
      <button type="button" value="" onclick="math('**')">𝑥²</button>
    <br>
      <button type="button" value="" onclick="button(4)">4</button>
      <button type="button" value="" onclick="button(5)">5</button>
      <button type="button" value="" onclick="button(6)">6</button>
      <button type="button" value="" onclick="math('-')">-</button>
    <br>
      <button type="button" value="" onclick="button(1)">1</button>
      <button type="button" value="" onclick="button(2)">2</button>
      <button type="button" value="" onclick="button(3)">3</button>
      <button type="button" value="" onclick="math('+')">+</button>
    <br>
      <button type="button" value="" onclick="minus()">-</button>
      <button type="button" value="" onclick="button(0)">0</button>
      <button type="button" value="" onclick="buttondot(ondot)">.</button>
      <button type="button" value="" onclick="math('=')">=</button>
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
    
  </body>
<html>
