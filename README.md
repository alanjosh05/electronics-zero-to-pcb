# Electronics, from zero to PCB

An interactive 21-lesson course, from "what is voltage?" to designing, ordering and powering up your own board.

**Open the course:** https://alanjosh05.github.io/electronics-zero-to-pcb/

Plain HTML, Tailwind (Play CDN) and vanilla JavaScript. No build step: open `index.html`, or serve the folder with `python3 -m http.server`.

- `lessons/`: the lessons
- `reference/`: the component field guide and PCB checklist
- `assets/`: shared styles, the lesson renderer, quizzes and widgets
- `tools/build-field-guide.js`: rebuilds the field guide from the lesson cards (`node tools/build-field-guide.js .`)

Values are typical figures for learning. Always check the datasheet of the exact part you use, and never experiment with mains electricity.

The visual style is inspired by [System Design](https://designed-to-scale.vercel.app/) by Dilum Sanjaya.
