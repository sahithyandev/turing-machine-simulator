const app = document.querySelector<HTMLDivElement>("#app");

if (!(app instanceof HTMLDivElement)) {
  throw new Error("App element not found");
}

app.innerHTML = `
  <div>
    <h1> Hello World!</h1>
  </div>
`;
