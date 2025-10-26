import Text from "./Text.js";

const DataFrame = (dataframe) => {
    const dataframe = Text(dataframe);
    dataframe.classList.add("data-frame");
    return dataframe;
}

export default DataFrame;