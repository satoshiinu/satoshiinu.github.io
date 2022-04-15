function input(input) {
  var input_field = document.getElementById('input_field');
  input_field.value =""+input_field.value+input
}
function char_delete(type) {
  var input_field = document.getElementById('input_field');
  input_field.value=input_field.value.slice(0,input_field.value.length-1)
}
