//初期化
ondot = false;
placeholder = false;
selectmath = "";

function input(input) {
  placeholderdisabled();
  var input_field = document.getElementById('input_field');
  if ( ondot && input_field.value.indexOf(".") == -1 ) {
    input_field.value = "" + input_field.value + "." + input;
  } else {
    input_field.value = "" + input_field.value + input;
  }
  ondot= false;
  
  var dod = document.getElementById('dod');
  dod.value = ondot;
}

function char_delete(type) {
  if ( type == 0) {
    if (ondot) {
      ondot= false;
    } else {
      var input_field = document.getElementById('input_field');
      if ( input_field.value[input_field.value.length-2] == "." ) {
        input_field.value = input_field.value.slice(0,input_field.value.length-2);
      } else {
        input_field.value = input_field.value.slice(0,input_field.value.length-1);
      }
    }
  }
  if ( type == 1) {
     var input_field = document.getElementById('input_field');
     input_field = 0 ;
  }
  if ( type == 2) {
     var input_field = document.getElementById('input_field');
     input_field = 0 ;
     var input_field2 = document.getElementById('input_field2');
     input_field2 = 0 ;
  }
  var dod = document.getElementById('dod');
  dod.value = ondot;
}

function math(smath) {
  if ( smath == "=" ) {
    if (placeholder == false ) math2(selectmath);
    if (placeholder == false ) selectmath = "";
  } else {
    math2(selectmath);
    selectmath = smath; 
  }
  placeholder = true
  input_field2.value = input_field.value;
  
  var pld = document.getElementById('pld');
  pld.value = placeholder;
  var sld = document.getElementById('sld');
  sld.value = selectmath;
}

function math2(smath) {
  if (smath !== "") {
    var input_field = document.getElementById('input_field');
    var input_field2 = document.getElementById('input_field2');
    if ( smath !== "**" ) {
    input_field.value = eval(input_field2.value + smath + input_field.value);
    } else {
      Math.pow( input_field2.value , input_field.value );
    }
  }
}

function inputdot(dot) {
  ondot= true;
  
  var dod = document.getElementById('dod');
  dod.value = ondot;
}

function placeholderdisabled() {
  if ( placeholder == true ) {
    placeholder = false;
    var input_field = document.getElementById('input_field');
    input_field.value = "";
    
    var pld = document.getElementById('pld');
    pld.value = placeholder;
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
  input_field = 3.141592653589793;
}
