cls

cd "C:\Program Files\Google\Chrome\Application"
start /B cmd.exe /c chrome.exe --profile-directory="Default"

cd "C:\Users\nicol\OneDrive\dev\repositories\express-server"
start cmd.exe /k npm run sass
start .
start /B code .
start cmd.exe /k npm run debug