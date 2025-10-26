const TextInput = (placeholder,value) => {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.value = value;
  input.classList.add("input-bar");

  return input;
}

export default TextInput;