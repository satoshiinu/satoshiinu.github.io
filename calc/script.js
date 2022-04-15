//初期化
onminis=false

function input(input) {
  var input_field = document.getElementById('input_field');
  if (input_field.value[input_field.value.length] ==".") {
    input_field.value =""+input_field.value+"."+input
  } else {
    input_field.value =""+input_field.value+input
  }
}

function char_delete(type) {
  var input_field = document.getElementById('input_field');
  input_field.value=input_field.value.slice(0,input_field.value.length-1)
}

function math(math) {
  var input_field = document.getElementById('input_field');
  var input_field2 = document.getElementById('input_field2');
  input_field2.value =input_field.value
}

function minus(minus) {
  onminis=!minis
}
