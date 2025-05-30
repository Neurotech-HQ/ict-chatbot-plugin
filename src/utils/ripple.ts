const rippleEffect = (e: { currentTarget: any; clientX: number }) => {
  const element = e.currentTarget;

  const circle = document.createElement("span");
  const diameter = Math.max(element.clientWidth, element.clientHeight);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - element.offsetLeft - radius}px`;
  circle.style.top = `-40px`;
  circle.classList.add("animate-ripple");
  circle.classList.add("absolute");

  const ripple = element.getElementsByClassName("animate-ripple")[0];

  if (ripple) {
    ripple.remove();
  }

  element.appendChild(circle);
};

export { rippleEffect };
