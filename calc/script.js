//初期化
ondot = false;
placeholder = false;
selectmath = "";
initial = true;
update_debug();

function input(input) {
  placeholderdisabled();
  var input_field = document.getElementById('input_field');
  if ( ondot && input_field.value.indexOf(".") == -1 ) {
    input_field.value = "" + input_field.value + "." + input;
  } else {
    input_field.value = "" + input_field.value + input;
  }
  ondot= false;
  update_debug();
}

function char_delete(type) {
  if ( type == 0) {
    if (ondot) {
      ondot= false;
    } else {
      var input_field = document.getElementById('input_field');
      if ( input_field.value[input_field.value.length-2] == "." ) {
        input_field.value = input_field.value.slice( 0,input_field.value.length-2 );
      } else {
        input_field.value = input_field.value.slice( 0,input_field.value.length-1 );
      }
    }
  }
  if ( type == 1) {
    var input_field = document.getElementById('input_field');
    input_field.value = 0 ;
  }
  if ( type == 2) {
    var input_field = document.getElementById('input_field');
    input_field.value = 0 ;
    var input_field2 = document.getElementById('input_field2');
    input_field2.value = 0 ;
    initial = true;
  }
  update_debug();
}

function math(smath) {
  if ( initial ) input_field2.value = input_field.value;
  if ( smath == "=" ) {
    if (placeholder == false ) math2(selectmath);
    if (placeholder == false ) selectmath = "";
  } else {
    math2(selectmath);
    selectmath = smath; 
  }
  placeholder = true;
  initial = false;
  input_field2.value = input_field.value;
  update_debug()
}

function math2(smath) {
  if (smath !== "") {
    var input_field = document.getElementById('input_field');
    var input_field2 = document.getElementById('input_field2');
    if ( smath !== "**" ) {
    } else {
    input_field.value = Math.pow( input_field2.value , input_field.value );
    }
  }
}

function inputdot(dot) {
  ondot= true;
  update_debug();
}

function placeholderdisabled() {
  if ( placeholder == true ) {
    placeholder = false;
    var input_field = document.getElementById('input_field');
    input_field.value = "";
    update_debug();
  }
}

function minus() {
  placeholderdisabled();
  var input_field = document.getElementById('input_field');
  if ( input_field.value.indexOf("-") !== -1 ) {
    input_field.value = input_field.value.slice(1,input_field.value.length);
  } else {
    input_field.value = "-" + input_field.value;
  }
}

function PI() {
  var input_field = document.getElementById('input_field');
  input_field.value = Math.PI;
}

function update_debug() {
var sld = document.getElementById('sld');
sld.value = selectmath;
var pld = document.getElementById('pld');
pld.value = placeholder;
var dod = document.getElementById('dod');
dod.value = ondot;
var ind = document.getElementById('ind');
ind.value = ondot;
}

/**
* タッチ操作での拡大縮小禁止
*/
function no_scaling() {
    document.addEventListener("touchmove", mobile_no_scroll, { passive: false });
}

/**
* タッチ操作での拡大縮小禁止解除
*/
function return_scaling() {
    document.removeEventListener('touchmove', mobile_no_scroll, { passive: false });
}

//https://javascript.programmer-reference.com/js-onselectstart/
/**
* 拡大縮小禁止
*/
function mobile_no_scroll(event) {
    // ２本指での操作の場合
    if (event.touches.length >= 2) {
        // デフォルトの動作をさせない
        event.preventDefault();
    }
}
