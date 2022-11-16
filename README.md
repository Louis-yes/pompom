![the pom pom logo](/desktop/src-tauri/icons/Square142x142Logo.png)
# Pompom
Pompom is a pomodoro method desktop app, with a focus on calm design and minimalism.

- Pompom uses visuals, not sound, to indicate the end of a round. 
- Pompom sits above all your other windows, usually in the corner.
- Pompom fits comfortably into about 120px x 120px, and functionally into much less.
- Pompom supports the [Hundred Rabbits Theming framework](https://github.com/hundredrabbits/Themes)
  
Pompom is built along the principles of [calm design](https://en.wikipedia.org/wiki/Calm_technology)

> It seems contradictory to say, in the face of frequent complaints about information overload, that more information could be encalming. It seems almost nonsensical to say that the way to become attuned to more information is to attend to it less. It is these apparently bizarre features that may account for why so few designs properly take into account center and periphery to achieve an increased sense of locatedness. But such designs are crucial. Once we are located in a world, the door is opened to social interactions among shared things in that world. As we learn to design calm technology, we will enrich not only our space of artifacts, but also our opportunities for being with other people. Thus may design of calm technology come to play a central role in a more humanly empowered twenty-first century. - [Designing Calm Technology by Mark Weiser and John Seely Brown](https://people.csail.mit.edu/rudolph/Teaching/weiser.pdf)

## Tech details
Pompom is built with typescript, css and html and bundled with Tauri.
It will be released soon, in the meantime you can use [Tauri](https://tauri.app/) to build it, from the desktop folder.
I've written it in a [functional](https://en.wikipedia.org/wiki/Functional_programming)-ish way, which was a good exercise and imo makes it easier to write and maintain.

### known debt
- no tests
- round editing isn't as user friendly as it could be (and not documented)
