const Subtitle = (text) => {
    const subtitleElement = document.createElement('h2');
    subtitleElement.textContent = text;
    subtitleElement.classList.add('subtitle');
    return subtitleElement;
}
export default Subtitle;