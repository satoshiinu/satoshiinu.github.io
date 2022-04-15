# 電卓
<html>
  <body>
    <script src="script.js"></script>
    <input type="number" id="input_field2" disabled><br>
    <input type="number" id="input_field"><br>
    <input type="button" value="🗙" onclick="char_delete(0)">
    <input type="button" value="c" onclick="char_delete(1)">
    <input type="button" value="ac" onclick="char_detele(2)">
    <input type="button" value="÷" onclick="math('÷')">
    <br>
    <input type="button" value="7" onclick="input(7)">
    <input type="button" value="8" onclick="input(8)">
    <input type="button" value="9" onclick="input(9)">
    <input type="button" value="×" onclick="math('×')">
    <br>
    <input type="button" value="4" onclick="input(4)">
    <input type="button" value="3" onclick="input(5)">
    <input type="button" value="6" onclick="input(6)">
    <input type="button" value="-" onclick="math('-')">
    <br>
    <input type="button" value="1" onclick="input(1)">
    <input type="button" value="2" onclick="input(2)">
    <input type="button" value="3" onclick="input(3)">
    <input type="button" value="+" onclick="math('+')">
    <br>
    <input type="button" value="-" onclick="input(-)">
    <input type="button" value="0" onclick="input(0)">
    <input type="button" value="." onclick="minus(onminus)">
    <input type="button" value="=" onclick="math('=')">
  </body>
<html>
