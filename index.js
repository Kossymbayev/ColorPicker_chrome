const pickerBtn = document.querySelector("#picker-btn");
const clearBtn = document.querySelector("#clear-btn");
const colorList = document.querySelector(".colors-list");
const exportBtn = document.querySelector("#export-btn");

let pickedColors = JSON.parse(localStorage.getItem("kos-colorpicker-list")) || [];

let currentPopup = null;

const copyToClipboard = async (text, element) => {
    try {
        await navigator.clipboard.writeText(text);
        element.innerText = "Copied!";
        setTimeout(() => { element.innerText = text }, 1000);
    } catch (error) {
        alert("Failed to copy text!");
    }
};

const exportColors = () => {
    const colorText = pickedColors.join("\n");
    const blob = new Blob([colorText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Colors.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const createColorPopup = (color) => {
    const popup = document.createElement("div");

    popup.classList.add("color-detail");
    popup.innerHTML = `
        <div class="color-preview" style="background: ${color};"></div>
        <div class="color-details">
            <div class="color-params">
                <span class="label">Hex:</span>
                <span class="value hex" data-color="${color}">${color}</span>
            </div>
            <div class="color-params">
                <span class="label">RGB:</span>
                <span class="value rgb" data-color="${color}">${hexToRgb(color)}</span>
            </div>
        </div>
    `;

    /*const closePopup = popup.querySelector(".close-popup");
    closePopup.addEventListener('click', () => {
        document.body.removeChild(popup);
        currentPopup = null;
    });*/

    const colorValues = popup.querySelectorAll(".value");
    colorValues.forEach((value) => {
        value.addEventListener('click', (e) => {
            const text = e.currentTarget.innerText;
            copyToClipboard(text, e.currentTarget);
        });
    });

    return popup;
};

const showColors = () => {
    colorList.innerHTML = pickedColors.map((color) =>
        `
            <li class="color">
                <span class="rect" style="background: ${color}; border: 1px solid ${color === "#ffffff" ? "#ccc" : color}"></span>
                <span class="value hex" data-color="${color}">${color}</span>
            </li>
        `
    ).join("");

    const colorElements = document.querySelectorAll(".color");
    if (colorElements.length === 0) {
        if (currentPopup) {
            document.body.querySelector('.picker-container').removeChild(currentPopup);
            currentPopup = null;
        }
    }
    colorElements.forEach((li) => {
        const colorHex = li.querySelector(".value.hex");
        colorHex.addEventListener('click', (e) => {
            const color = e.currentTarget.dataset.color;
            if (currentPopup) {
                document.body.querySelector('.picker-container').removeChild(currentPopup);
            }
            const popup = createColorPopup(color);
            document.body.querySelector('.picker-container').appendChild(popup);
            currentPopup = popup;
        });
    });

    const pickedColorsContainer = document.querySelector(".colors");
    pickedColorsContainer.classList.toggle("hide", pickedColors.length === 0);
};

const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
};

const activateEyeDropper = async () => {
    document.body.style.display = "none";
    try {
        const { sRGBHex } = await new EyeDropper().open();

        if (!pickedColors.includes(sRGBHex)) {
            pickedColors.push(sRGBHex);
            localStorage.setItem("kos-colorpicker-list", JSON.stringify(pickedColors));
        }

        showColors();
    } catch (error) {
        alert("Failed to copy the color code!");
    } finally {
        document.body.style.display = "block";
    }
};

const clearAllColors = () => {
    pickedColors = [];
    localStorage.removeItem("kos-colorpicker-list");
    showColors();
};

clearBtn.addEventListener('click', clearAllColors);
pickerBtn.addEventListener('click', activateEyeDropper);
exportBtn.addEventListener('click', exportColors);

showColors();