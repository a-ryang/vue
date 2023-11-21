let count = 0;

const countHeader = document.querySelector("#count");
const subtractButton = document.querySelector("#subtract");
const addButton = document.querySelector("#add");

countHeader.innerText = count;

addButton.addEventListener("click", () => {
  count++;
  countHeader.innerText = count;
});

subtractButton.addEventListener("click", () => {
  count--;
  countHeader.innerText = count;
});
