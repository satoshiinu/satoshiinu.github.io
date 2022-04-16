//初期化
onminus = false;
placeholder = false;
selectmath = "";

function input(input) {
  placeholderdisabled();
  var input_field = document.getElementById('input_field');
  if (onminus && !(input_field.value.test)) {
    input_field.value = "" + input_field.value + "." + input;
  } else {
    input_field.value = "" + input_field.value + input;
  }
}

function char_delete(type) {
  var input_field = document.getElementById('input_field');
  if ( input_field[input_field.value.length-2] == "." ) {
    input_field.value = input_field.value.slice(0,input_field.value.length-1);
  } else {
    input_field.value = input_field.value.slice(0,input_field.value.length-2);
  }
}

function math(math) {
  if ( math == "=" ) {
    math2(selectmath);
  } else {
    math2(selectmath);
    selectmath = math;
  }
}

function math2(math) {
  var input_field = document.getElementById('input_field');
  var input_field2 = document.getElementById('input_field2');
  input_field.value = eval(input_field2.value + math + input_field.value);
  input_field2.value = input_field.value;
}

function minus(minus) {
  onminus= !(minus);
  alert(onminus);
}

function placeholderdisabled() {
  if ( placeholder == true ) {
    placeholder = false;
    var input_field = document.getElementById('input_field');
    input_field.value = "";
  }
}
