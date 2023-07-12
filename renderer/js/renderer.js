const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const loadImage = (e) => {
    const file = e.target.files[0];

    if (!isFileImage(file)) {
        alertError("Please select an image file");
        return
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
        widthInput.value = image.width;
        heightInput.value = image.height;
    };

    form.style.display = "block";
    filename.innerText = file.name;
    outputPath.innerText = path.join(os.homedir(), "imageresizer");
}

const resizeImage = e => {
    e.preventDefault();

    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = img.files[0].path;

    if (!img.files[0]) {
        alertError("Please upload an image");
        return;
    }

    if (widthInput.value === +"" || heightInput.value === +"") {
        alertError("Please fill in a height & width");
        return;
    }

    ipcRenderer.send("image:resize", {imgPath, width, height});
}

ipcRenderer.on("image:done", () => {
    alertSuccess(`Image resized to to ${widthInput.value} x ${heightInput.value}`);
})

const isFileImage = file => {
    const acceptedImageTypes = ["image/gif", "image/png", "image/jpg"];
    return file && acceptedImageTypes.includes(file["type"]);
}

const alertError = message => {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: "red",
            color: "white",
            textAlign: "center"
        }
    })
};

const alertSuccess = message => {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: "green",
            color: "white",
            textAlign: "center"
        }
    })
};


img.addEventListener("change", loadImage);
form.addEventListener("submit", resizeImage);
