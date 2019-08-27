import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function component() {
  const element = document.createElement('div');

  element.innerHTML = 'Hello webpack!';

  return element;
}

document.body.appendChild(component());
