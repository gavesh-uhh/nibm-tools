# nibm-tools
**Current Live Version :- [Click Here](http://nibm.gavesh.live)**

`Work in Progress` Say goodbye to the original website’s hideous, eye-searing design! Now you can effortlessly view lectures, download past papers in bulk, and apply for exams without suffering through that visual nightmare.

------------
Built with Svelte 5, TailwindCSS, TypeScript.
`Heads up - The Code is bad, dont expect much`

## Features
- **Lecture Viewer **- View today and 2 days worth of lectures and where they are happening
- **Past Paper Downloader** - Download past paper on bulk
- **Exam Viewer** - Easily scroll through pages of Exam Dates and apply to them easily.
- **PWA Support** - Install as an App in your Mobile Phone!

## API Endpoints
`Idk why i made them endpoints but`

#### Lectures
`date` - (**Required**) The date to pull data from
`limit` - Number of days to fetch starting from the given date (default is 3)
```markdown
"/api/lectures?date=2025-10-05"
```
#### Exams
`limit` - Number of exams to be pulled
```markdown
"/api/exams"
```
`Note!  - Sorted relative to today's date`
#### Papers

`q` - **(Required)** search query
```markdown
"/api/papers?q=CN"
```

## Installation 
```bash
git clone https://github.com/gavesh-uhh/nibm-tools
cd nibm-tools
npm install
npm run dev
```

## Licence
This project is licensed under the `MIT` License. It is provided "as is," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. The authors are not liable for any claim, damages, or other liability arising from the use of this software. For full details, see the LICENSE file in the repository.
