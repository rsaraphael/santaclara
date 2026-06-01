import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const distPath = path.resolve(__dirname, '../d')
const adminPath = path.join(distPath, 'admin')
const mainIndexPath = path.join(distPath, 'index.html')
const adminIndexPath = path.join(adminPath, 'index.html')

// Read main index.html to extract asset paths
const mainHtml = fs.readFileSync(mainIndexPath, 'utf8')

// Extract JS and CSS file paths using regex
const jsMatch = mainHtml.match(/src="\.\/assets\/(index-[^"]+\.js)"/)
const cssMatch = mainHtml.match(/href="\.\/assets\/(index-[^"]+\.css)"/)

if (!jsMatch) {
  console.error('Could not find JS bundle in main index.html')
  process.exit(1)
}

const jsFile = jsMatch[1]
const cssFile = cssMatch ? cssMatch[1] : null

console.log('Found assets:', { jsFile, cssFile })

// Ensure admin directory exists
if (!fs.existsSync(adminPath)) {
  fs.mkdirSync(adminPath, { recursive: true })
}

// Write admin index.html with relative paths to assets
const adminHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quermesse Caixa - Admin</title>
    <script type="module" crossorigin src="../assets/${jsFile}"></script>
    ${cssFile ? `<link rel="stylesheet" crossorigin href="../assets/${cssFile}">` : ''}
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`

fs.writeFileSync(adminIndexPath, adminHtml)
console.log('Updated d/admin/index.html')
