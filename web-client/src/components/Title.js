const Title = (text) => {
    const titleElement = document.createElement('h1');
    titleElement.textContent = text;
    titleElement.classList.add('title');
    return titleElement;
}

export default Title;