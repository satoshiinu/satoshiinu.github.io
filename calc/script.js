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
  dod.value = ondot
}

function char_delete(type) {
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
  
  var dod = document.getElementById('dod');
  dod.value = ondot
}

function math(math) {
  if ( math == "=" ) {
    if (placeholder == false ) math2(selectmath);
    if (placeholder == false ) selectmath = "";
  } else {
    math2(selectmath);
    selectmath = math; 
  }
  placeholder = true
  
  var pld = document.getElementById('pld');
  pld.value = placeholder
  var sld = document.getElementById('sld');
  sld.value = selectmath
}

function math2(math) {
  if (!(math == "")) {
    var input_field = document.getElementById('input_field');
    var input_field2 = document.getElementById('input_field2');
    input_field.value = eval(input_field2.value + selectmath + input_field.value);
    input_field2.value = input_field.value;
  }
}

function inputdot(dot) {
  ondot= true;
  //alert(onminus);
  
  var dod = document.getElementById('dod');
  dod.value = ondot
}

function placeholderdisabled() {
  if ( placeholder == true ) {
    placeholder = false;
    var input_field = document.getElementById('input_field');
    input_field.value = "";
    
    var pld = document.getElementById('pld');
    pld.value = placeholder
  }
}
