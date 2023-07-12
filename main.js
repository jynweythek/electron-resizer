const path = require("path");
const os = require("os");
const fs = require("fs");
const resizeImg = require("resize-img");
const {app, BrowserWindow, Menu, ipcMain, shell} = require("electron");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;
let aboutWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: "Image Resizer",
        width: isDev ? 1000 : 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),

        }
    });

    isDev && mainWindow.webContents.openDevTools();

    mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: "About Image Resizer",
        width: 500,
        height: 400,
    });

    aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

app.on("ready", () => {
    createMainWindow();
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    mainWindow.on("closed", () => mainWindow = null);
});

const menu = [
    ...(isMac ? [{
            label: app.name,
            submenu: [
                {
                    label: "About",
                    click: createAboutWindow
                }
            ],
        }] : []
    ),
    {
        role: "fileMenu"
    },
    ...(!isMac ? [{
        label: "Help",
        submenu: [
            {
                label: "About",
                click: createAboutWindow
            }
        ]
    }] : []),
    ...(isDev
        ? [
            {
                label: 'Developer',
                submenu: [
                    {role: 'reload'},
                    {role: 'forcereload'},
                    {type: 'separator'},
                    {role: 'toggledevtools'},
                ],
            },
        ]
        : []),
];

ipcMain.on("image:resize", (e, options) => {
    options.dest = path.join(os.homedir(), "imageresizer");
    resizeImage(options);
});

const resizeImage = async ({imgPath, width, height, dest}) => {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height,
        });

        const filename = path.basename(imgPath);
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        fs.writeFileSync(path.join(dest, filename), newPath);
        mainWindow.webContents.send("image:done");
        shell.openPath(dest);
    } catch (error) {
        console.log(error);
    }
}

app.on("window-all-closed", () => !isMac && app.quit());
app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createMainWindow());
