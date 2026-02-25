![alt text](moco.jpg "intro")

# Step-by-step instructions to build an exact copy of the add-on source code

Requirements

- Operating System: Linux, macOS, or Windows
- Node.js version: ≥ 24.x.x
- npm version: ≥ 11.x.x

1. Clone repository
   `git clone https://github.com/mkoeppen/MocoTicketChecker.git`

2. Install dependancies
   `npm install`

3. Start dev mode with file watcher
   `npm run dev`

4. Build folders
   `npm run build`

5. Build and create zip packages
   `npm run publish`

## Versions

### 1.0.1

- fix "start"-button width
- dont mark rows in fav table

### 1.0.2

- remove not needed host_permissions
- translate to german
