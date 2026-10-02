const H = (h, m = 0) => h * 60 + m;
const BEATS = [
  { id: "d1-bugle", day: 1, from: H(6, 10), fx: "bugle", text: "A bull bugles somewhere below the knob. High and thin, then a grunt like a man lifting something heavy." },
  { id: "d1-hush", day: 1, from: H(16, 50), fx: "gust", text: "The birds quit all at once, the way a room goes quiet when someone walks in." },
  { id: "n1-scream", day: 1, from: H(19, 40), fx: "scream", heart: -6, pressure: 4, journal: true, text: "Something screams up the drainage. Not an elk. Not a cat. It stops like a door closing." },
  { id: "n1-knocks", day: 1, from: H(20, 50), fx: "knocks", heart: -3, journal: true, text: "Three knocks, wood on wood, out in the timber. Then three more, farther off. Answering." },
  { id: "d2-tracks", day: 2, from: H(5, 40), pressure: 4, journal: true, text: "Tracks circle the stones. Long, narrow, too far apart. They come to the edge of where the firelight was, and stop." },
  { id: "d2-bugle", day: 2, from: H(16, 20), fx: "bugle", near: true, text: "He bugles from close by, close enough to feel in your teeth. He is moving at last light. So is something else." },
  { id: "n2-rock", grp: "n2r", where: "camp", day: 2, from: H(20, 10), fx: "rock", heart: -8, pressure: 6, journal: true, where: "camp", text: "A stone the size of a fist drops into the coals. Sparks. Nothing moves out there. Then something does." },
  { id: "n2-rock-away", grp: "away", where: "n2r", day: 2, from: H(20, 10), fx: "rock", heart: -10, pressure: 8, journal: true, where: "away", text: "A stone cracks off a trunk a yard from your head. Thrown. From the dark, by something that can see you." },
  { id: "n2-snap", day: 2, from: H(21, 30), fx: "snap", heart: -4, text: "A branch breaks behind you. Big. Then the quiet that comes after something decides to stand still." },
  { id: "d3-ridge", day: 3, from: H(16, 55), heart: -4, journal: true, text: "On the far ridge, against the last light, a shape stands where there was no tree this morning." },
  { id: "n3-eyes", grp: "n3e", where: "camp", day: 3, from: H(19, 50), fx: "snap", near: true, heart: -8, pressure: 6, journal: true, text: "Two points of green at the edge of the firelight. Low, where a face would be. They do not blink. They go out." },
  { id: "n3-scream", day: 3, from: H(21, 20), fx: "scream", near: true, heart: -6, journal: true, text: "The scream again. Closer. At the end it sounds like it is trying out a word." },
  { id: "n4-flash", day: 4, from: H(19, 30), fx: "flash", pressure: 4, text: "A pale flash up on the knob. Your camera took something." },
  { id: "n4-knocks", grp: "n4k", where: "camp", day: 4, from: H(21, 0), fx: "knocks", heart: -6, text: "Knocks all around the camp now. Not answering each other. Counting." },
  { id: "n5-wall", grp: "n5w", where: "camp", day: 5, from: H(20, 20), fx: "snap", near: true, heart: -8, journal: true, text: "Something walks the outside of the wall. You hear the logs take its weight and give it back." },
  { id: "n5-scream", grp: "n5s", where: "camp", day: 5, from: H(21, 40), fx: "scream", near: true, heart: -8, text: "It screams from right behind the wall. Your ears ring after." },
  { id: "n6-chorus", day: 6, from: H(19, 20), fx: "chorus", heart: -10, pressure: 8, journal: true, text: "More than one. The screams come from three places on the mountain, and then from one." },
  { id: "n6-rock", grp: "n6r", where: "camp", day: 6, from: H(21, 0), fx: "rock", heart: -8, text: "Stones rain into camp. One rings off the rifle barrel. They want you to run." },
  { id: "n3-eyes-away", grp: "n3e", where: "away", day: 3, from: H(19, 50), fx: "snap", near: true, heart: -8, pressure: 6, journal: true, text: "Two points of green in the timber, past the reach of the lamp. Level with your face, and higher than they should be. They do not blink. They go out." },
  { id: "n4-knocks-away", grp: "n4k", where: "away", day: 4, from: H(21, 0), fx: "knocks", heart: -6, text: "Knocks in the timber all around you. Not answering each other. Counting. The fire is a long way off." },
  { id: "n5-wall-away", grp: "n5w", where: "away", day: 5, from: H(20, 20), fx: "snap", near: true, heart: -8, journal: true, text: "Something walks beside you, step for step, just outside the lamp. When you stop, it takes one more." },
  { id: "n5-scream-away", grp: "n5s", where: "away", day: 5, from: H(21, 40), fx: "scream", near: true, heart: -8, text: "It screams from right behind you. Your ears ring after. When you swing the lamp there is only snow coming down." },
  { id: "n6-rock-away", grp: "n6r", where: "away", day: 6, from: H(21, 0), fx: "rock", heart: -8, text: "Stones come out of the dark and crack off the trunks around you. One rings off the rifle barrel. They want you to run." },
  { id: "d7-still", day: 7, from: H(6, 30), journal: true, text: "No birds. No wind. The whole mountain is holding its breath to see what you will do." },
  { id: "n7-chorus", day: 7, from: H(18, 40), fx: "chorus", heart: -10, journal: true, text: "They are all around you now. Walk out, or stay and be kept." }
];
function dueBeat(day, minutes, fired, atFire) {
  for (const b of BEATS) {
    if (b.day !== day || fired.includes(b.id)) continue;
    if (minutes < b.from || minutes > b.from + 180) continue;
    if (b.where === "camp" && !atFire) continue;
    if (b.where === "away" && atFire) continue;
    return b;
  }
  return null;
}
export {
  BEATS,
  dueBeat
};
