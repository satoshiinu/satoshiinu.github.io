<html>

<head>
    <link href="style.css" rel="stylesheet">
</head>

<body>
    <canvas id="canvas" width=1280 height=720></canvas>
    <input type="button" value="btnUp" id="btnUp" class="buttonUp" onmousedown="btnUpDown()" onmouseup="btnUpUp()"
        onmousemove="btnUpUp()">
    <input type="button" value="btnLeft" id="btnLeft" class="buttonLeft" onmousedown="btnLeftDown()"
        onmouseup="btnLeftUp()" onmousemove="btnLeftUp()">
    <input type="button" value="btnRight" id="btnRight" class="buttonRight" onmousedown="btnRightDown()"
        onmouseup="btnRightUp()" onmousemove="btnRightUp()">
    <input type="button" value="btnDown" id="btnDown" class="buttonDown" onmousedown="btnDownDown()"
        onmouseup="btnDownUp()" onmousemove="btnDownUp()">
</body>
<script src="script.js"></script>

</html>
