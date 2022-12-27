import Theme from "./theme.js"
import Pompom from "./pompom.ts"

const theme = new Theme();        
theme.install(document.body);
theme.start();

const app = new Pompom();
app.install(document.body);
