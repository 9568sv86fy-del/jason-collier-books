/* I-Spy: pick any book illustration, five random targets a round, fading marks, synthesized ambience */
const ISPY_BOOKS = [
 {
  "id": "jang",
  "name": "Jang & Tom",
  "sound": "prairie",
  "pics": [
   {
    "id": "wagon-masters-cover",
    "src": "images/jang-and-tom-wagon-masters.jpg",
    "title": "Wagon Masters",
    "credit": "Cover · Jang & Tom · Wagon Masters",
    "items": [
     {
      "n": "Snowy peak",
      "b": [
       52.0,
       6.0,
       34.0,
       14.0
      ]
     },
     {
      "n": "Wagon canvas",
      "b": [
       26.0,
       18.0,
       42.0,
       16.0
      ]
     },
     {
      "n": "Red lantern",
      "b": [
       30.0,
       20.0,
       10.0,
       10.0
      ]
     },
     {
      "n": "Driver",
      "b": [
       56.0,
       14.0,
       18.0,
       18.0
      ]
     },
     {
      "n": "Whip",
      "b": [
       70.0,
       6.0,
       18.0,
       18.0
      ]
     },
     {
      "n": "Left white horse",
      "b": [
       4.0,
       36.0,
       28.0,
       30.0
      ]
     },
     {
      "n": "Right white horse",
      "b": [
       28.0,
       34.0,
       26.0,
       28.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       12.0,
       52.0,
       16.0,
       16.0
      ]
     },
     {
      "n": "Tom's hat",
      "b": [
       38.0,
       62.0,
       16.0,
       12.0
      ]
     },
     {
      "n": "Red shirt",
      "b": [
       36.0,
       70.0,
       18.0,
       16.0
      ]
     },
     {
      "n": "Rifle",
      "b": [
       56.0,
       66.0,
       16.0,
       24.0
      ]
     },
     {
      "n": "Dust cloud",
      "b": [
       0.0,
       78.0,
       32.0,
       18.0
      ]
     }
    ]
   },
   {
    "id": "wagonmasters-poster",
    "src": "media/wagonmasters_part1of6_poster.jpg",
    "title": "Dust on the Trail",
    "credit": "Audiobook art · Jang & Tom · Wagon Masters",
    "items": [
     {
      "n": "Wooden sign",
      "b": [
       2.0,
       4.0,
       32.0,
       28.0
      ]
     },
     {
      "n": "Distant mountains",
      "b": [
       48.0,
       2.0,
       48.0,
       16.0
      ]
     },
     {
      "n": "Canvas top",
      "b": [
       66.0,
       16.0,
       20.0,
       16.0
      ]
     },
     {
      "n": "Stagecoach",
      "b": [
       58.0,
       20.0,
       34.0,
       48.0
      ]
     },
     {
      "n": "Coach lantern",
      "b": [
       60.0,
       28.0,
       8.0,
       10.0
      ]
     },
     {
      "n": "Driver",
      "b": [
       72.0,
       20.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "Raised whip",
      "b": [
       82.0,
       12.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "White horse",
      "b": [
       40.0,
       36.0,
       22.0,
       38.0
      ]
     },
     {
      "n": "Brown horse",
      "b": [
       54.0,
       40.0,
       18.0,
       34.0
      ]
     },
     {
      "n": "Coach wheel",
      "b": [
       74.0,
       50.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "Dust cloud",
      "b": [
       0.0,
       48.0,
       34.0,
       42.0
      ]
     },
     {
      "n": "Desert scrub",
      "b": [
       14.0,
       68.0,
       22.0,
       22.0
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s01",
    "src": "images/scenes/transcon-s01.jpg",
    "title": "Stagecoach at Sunset",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Orange sun",
      "b": [
       2.0,
       4.0,
       16.0,
       18.0
      ]
     },
     {
      "n": "Mountain ridge",
      "b": [
       0.0,
       12.0,
       42.0,
       20.0
      ]
     },
     {
      "n": "Red stagecoach",
      "b": [
       4.0,
       36.0,
       30.0,
       40.0
      ]
     },
     {
      "n": "Coach driver",
      "b": [
       12.0,
       38.0,
       14.0,
       16.0
      ]
     },
     {
      "n": "Coach wheel",
      "b": [
       14.0,
       58.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "Team of horses",
      "b": [
       30.0,
       40.0,
       24.0,
       34.0
      ]
     },
     {
      "n": "Dust behind the coach",
      "b": [
       0.0,
       62.0,
       22.0,
       28.0
      ]
     },
     {
      "n": "Hanging saloon sign",
      "b": [
       54.0,
       14.0,
       18.0,
       18.0
      ]
     },
     {
      "n": "Saloon porch",
      "b": [
       50.0,
       30.0,
       30.0,
       34.0
      ]
     },
     {
      "n": "Water trough",
      "b": [
       58.0,
       64.0,
       18.0,
       16.0
      ]
     },
     {
      "n": "Horse at the trough",
      "b": [
       68.0,
       46.0,
       16.0,
       24.0
      ]
     },
     {
      "n": "Covered wagon",
      "b": [
       74.0,
       40.0,
       22.0,
       28.0
      ]
     }
    ]
   },
   {
    "id": "scene-philly-s09",
    "src": "images/scenes/philly-s09.jpg",
    "title": "Sunday Promenade",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Brick facade",
      "b": [
       0.0,
       0.0,
       32.0,
       28.0
      ]
     },
     {
      "n": "Tall window",
      "b": [
       6.0,
       2.0,
       16.0,
       18.0
      ]
     },
     {
      "n": "Black top hat",
      "b": [
       4.0,
       18.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Man in a dark coat",
      "b": [
       2.0,
       30.0,
       20.0,
       50.0
      ]
     },
     {
      "n": "Woman's wide hat",
      "b": [
       24.0,
       12.0,
       16.0,
       14.0
      ]
     },
     {
      "n": "Blue dress",
      "b": [
       22.0,
       28.0,
       22.0,
       52.0
      ]
     },
     {
      "n": "Pink parasol",
      "b": [
       46.0,
       4.0,
       18.0,
       22.0
      ]
     },
     {
      "n": "Pink dress",
      "b": [
       44.0,
       28.0,
       18.0,
       50.0
      ]
     },
     {
      "n": "Brown top hat",
      "b": [
       64.0,
       14.0,
       12.0,
       14.0
      ]
     },
     {
      "n": "Man in a brown suit",
      "b": [
       62.0,
       26.0,
       18.0,
       48.0
      ]
     },
     {
      "n": "Child in yellow",
      "b": [
       78.0,
       44.0,
       16.0,
       32.0
      ]
     },
     {
      "n": "Street lamp",
      "b": [
       84.0,
       2.0,
       12.0,
       36.0
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s10",
    "src": "images/scenes/transcon-s10.jpg",
    "title": "The Freight Stop",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Hanging sign",
      "b": [
       0.0,
       4.0,
       16.0,
       20.0
      ]
     },
     {
      "n": "Bowler hat",
      "b": [
       14.0,
       8.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Man in a bowler hat",
      "b": [
       8.0,
       12.0,
       22.0,
       34.0
      ]
     },
     {
      "n": "Canvas wagon cover",
      "b": [
       36.0,
       6.0,
       26.0,
       28.0
      ]
     },
     {
      "n": "Pair of oxen",
      "b": [
       64.0,
       8.0,
       30.0,
       34.0
      ]
     },
     {
      "n": "Green wagon",
      "b": [
       70.0,
       4.0,
       28.0,
       44.0
      ]
     },
     {
      "n": "Red stagecoach",
      "b": [
       2.0,
       50.0,
       28.0,
       34.0
      ]
     },
     {
      "n": "Coach driver",
      "b": [
       8.0,
       48.0,
       14.0,
       16.0
      ]
     },
     {
      "n": "Stack of barrels",
      "b": [
       0.0,
       74.0,
       20.0,
       22.0
      ]
     },
     {
      "n": "Red bandana",
      "b": [
       40.0,
       54.0,
       12.0,
       12.0
      ]
     },
     {
      "n": "White apron",
      "b": [
       38.0,
       60.0,
       18.0,
       26.0
      ]
     },
     {
      "n": "Red bucket",
      "b": [
       44.0,
       68.0,
       16.0,
       18.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       64.0,
       54.0,
       18.0,
       26.0
      ]
     }
    ]
   },
   {
    "id": "scene-philly-s21",
    "src": "images/scenes/philly-s21.jpg",
    "title": "The Horse Race",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Grandstand",
      "b": [
       0.0,
       2.0,
       32.0,
       38.0
      ]
     },
     {
      "n": "Top hat in the crowd",
      "b": [
       4.0,
       6.0,
       12.0,
       14.0
      ]
     },
     {
      "n": "Spectator crowd",
      "b": [
       2.0,
       10.0,
       28.0,
       26.0
      ]
     },
     {
      "n": "Shade trees",
      "b": [
       36.0,
       0.0,
       58.0,
       28.0
      ]
     },
     {
      "n": "White rail fence",
      "b": [
       32.0,
       24.0,
       64.0,
       16.0
      ]
     },
     {
      "n": "Jockey in red",
      "b": [
       4.0,
       50.0,
       18.0,
       22.0
      ]
     },
     {
      "n": "Brown racehorse",
      "b": [
       0.0,
       56.0,
       32.0,
       32.0
      ]
     },
     {
      "n": "Jockey in blue",
      "b": [
       36.0,
       50.0,
       18.0,
       20.0
      ]
     },
     {
      "n": "Black racehorse",
      "b": [
       32.0,
       56.0,
       32.0,
       32.0
      ]
     },
     {
      "n": "Dirt track",
      "b": [
       0.0,
       78.0,
       100.0,
       22.0
      ]
     },
     {
      "n": "Riding crop",
      "b": [
       12.0,
       48.0,
       10.0,
       12.0
      ]
     },
     {
      "n": "Rail post",
      "b": [
       34.0,
       22.0,
       8.0,
       18.0
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s21",
    "src": "images/scenes/transcon-s21.jpg",
    "title": "The River Bridge",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Snowy mountains",
      "b": [
       0.0,
       2.0,
       52.0,
       24.0
      ]
     },
     {
      "n": "Pine trees",
      "b": [
       64.0,
       6.0,
       32.0,
       32.0
      ]
     },
     {
      "n": "Lead covered wagon",
      "b": [
       12.0,
       30.0,
       26.0,
       28.0
      ]
     },
     {
      "n": "Wagon canvas",
      "b": [
       18.0,
       28.0,
       18.0,
       14.0
      ]
     },
     {
      "n": "Ox team",
      "b": [
       0.0,
       40.0,
       20.0,
       22.0
      ]
     },
     {
      "n": "Man with a whip",
      "b": [
       34.0,
       26.0,
       14.0,
       20.0
      ]
     },
     {
      "n": "Raised whip",
      "b": [
       30.0,
       18.0,
       12.0,
       16.0
      ]
     },
     {
      "n": "Second wagon",
      "b": [
       44.0,
       32.0,
       22.0,
       24.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       24.0,
       46.0,
       12.0,
       16.0
      ]
     },
     {
      "n": "Wooden bridge",
      "b": [
       4.0,
       44.0,
       84.0,
       20.0
      ]
     },
     {
      "n": "River water",
      "b": [
       0.0,
       64.0,
       100.0,
       24.0
      ]
     },
     {
      "n": "Rocks in the river",
      "b": [
       54.0,
       70.0,
       20.0,
       16.0
      ]
     }
    ]
   },
   {
    "id": "scene-philly-s45",
    "src": "images/scenes/philly-s45.jpg",
    "title": "The Ballroom",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Crystal chandelier",
      "b": [
       34.0,
       0.0,
       26.0,
       22.0
      ]
     },
     {
      "n": "Candle flames",
      "b": [
       40.0,
       4.0,
       12.0,
       10.0
      ]
     },
     {
      "n": "Marble column",
      "b": [
       0.0,
       6.0,
       14.0,
       52.0
      ]
     },
     {
      "n": "Gold mirror",
      "b": [
       4.0,
       14.0,
       16.0,
       24.0
      ]
     },
     {
      "n": "Green ball gown",
      "b": [
       12.0,
       28.0,
       20.0,
       50.0
      ]
     },
     {
      "n": "Folding fan",
      "b": [
       16.0,
       38.0,
       10.0,
       12.0
      ]
     },
     {
      "n": "Man in a tailcoat",
      "b": [
       28.0,
       24.0,
       16.0,
       48.0
      ]
     },
     {
      "n": "Pink ball gown",
      "b": [
       44.0,
       28.0,
       18.0,
       50.0
      ]
     },
     {
      "n": "Man in a black suit",
      "b": [
       56.0,
       26.0,
       16.0,
       46.0
      ]
     },
     {
      "n": "Violin",
      "b": [
       72.0,
       32.0,
       12.0,
       20.0
      ]
     },
     {
      "n": "Cello",
      "b": [
       82.0,
       36.0,
       14.0,
       26.0
      ]
     },
     {
      "n": "Dance floor",
      "b": [
       16.0,
       74.0,
       52.0,
       22.0
      ]
     }
    ]
   },
   {
    "id": "transcon-s46",
    "src": "images/scenes/transcon-s46.jpg",
    "title": "The Goat and the Top Hat",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Top hat",
      "b": [
       8.0,
       14.0,
       11.0,
       17.0
      ]
     },
     {
      "n": "Walrus mustache",
      "b": [
       14.5,
       31.0,
       5.0,
       4.0
      ]
     },
     {
      "n": "Goat",
      "b": [
       2.0,
       59.0,
       34.0,
       41.0
      ]
     },
     {
      "n": "Goat horns",
      "b": [
       25.0,
       59.0,
       9.0,
       7.0
      ]
     },
     {
      "n": "Watch chain",
      "b": [
       16.0,
       66.0,
       8.0,
       7.0
      ]
     },
     {
      "n": "Hat in the air",
      "b": [
       45.0,
       4.0,
       9.0,
       15.0
      ]
     },
     {
      "n": "Red bandana",
      "b": [
       55.0,
       36.0,
       7.0,
       12.0
      ]
     },
     {
      "n": "Brown cowboy hat",
      "b": [
       55.0,
       18.0,
       11.0,
       10.0
      ]
     },
     {
      "n": "Hat in the goat’s mouth",
      "b": [
       36.0,
       66.0,
       9.0,
       10.0
      ]
     },
     {
      "n": "Notepad",
      "b": [
       71.0,
       49.0,
       5.0,
       5.0
      ]
     },
     {
      "n": "Second notepad",
      "b": [
       27.5,
       46.0,
       6.0,
       5.0
      ]
     },
     {
      "n": "Plaid shirt",
      "b": [
       75.0,
       40.0,
       24.0,
       45.0
      ]
     },
     {
      "n": "Black hat",
      "b": [
       83.0,
       15.0,
       13.0,
       11.0
      ]
     },
     {
      "n": "Open hand",
      "b": [
       68.0,
       58.0,
       5.0,
       9.0
      ]
     },
     {
      "n": "Wrecked trestle",
      "b": [
       65.0,
       9.0,
       18.0,
       19.0
      ]
     },
     {
      "n": "Surprised face",
      "b": [
       45.0,
       52.0,
       6.0,
       11.0
      ]
     },
     {
      "n": "Laughing woman",
      "b": [
       1.0,
       30.0,
       5.0,
       11.0
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s57",
    "src": "images/scenes/transcon-s57.jpg",
    "title": "The Pacific",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Seagulls",
      "b": [
       34.0,
       6.0,
       26.0,
       16.0
      ]
     },
     {
      "n": "Setting sun",
      "b": [
       60.0,
       16.0,
       18.0,
       20.0
      ]
     },
     {
      "n": "Ship sails",
      "b": [
       70.0,
       20.0,
       18.0,
       20.0
      ]
     },
     {
      "n": "Tall ship",
      "b": [
       64.0,
       28.0,
       28.0,
       32.0
      ]
     },
     {
      "n": "Sun on the water",
      "b": [
       54.0,
       44.0,
       20.0,
       24.0
      ]
     },
     {
      "n": "Cliff edge",
      "b": [
       0.0,
       38.0,
       34.0,
       32.0
      ]
     },
     {
      "n": "Cowboy hat",
      "b": [
       4.0,
       36.0,
       12.0,
       12.0
      ]
     },
     {
      "n": "Two men on the cliff",
      "b": [
       2.0,
       44.0,
       26.0,
       32.0
      ]
     },
     {
      "n": "Wagon at the cliff",
      "b": [
       0.0,
       48.0,
       16.0,
       22.0
      ]
     },
     {
      "n": "Whitecaps",
      "b": [
       28.0,
       54.0,
       40.0,
       16.0
      ]
     },
     {
      "n": "Rocky shore",
      "b": [
       0.0,
       70.0,
       36.0,
       26.0
      ]
     },
     {
      "n": "Ocean",
      "b": [
       30.0,
       40.0,
       70.0,
       28.0
      ]
     }
    ]
   },
   {
    "id": "art-philly-s01",
    "src": "images/art/philly-s01.jpg",
    "title": "The Study",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Heavy curtains",
      "b": [
       0.0,
       2.0,
       16.0,
       42.0
      ]
     },
     {
      "n": "Paned window",
      "b": [
       8.0,
       4.0,
       22.0,
       32.0
      ]
     },
     {
      "n": "World globe",
      "b": [
       2.0,
       34.0,
       20.0,
       22.0
      ]
     },
     {
      "n": "Black top hat",
      "b": [
       36.0,
       26.0,
       20.0,
       22.0
      ]
     },
     {
      "n": "Stack of papers",
      "b": [
       48.0,
       16.0,
       18.0,
       18.0
      ]
     },
     {
      "n": "Bookcase",
      "b": [
       66.0,
       2.0,
       32.0,
       46.0
      ]
     },
     {
      "n": "Row of books",
      "b": [
       70.0,
       10.0,
       24.0,
       28.0
      ]
     },
     {
      "n": "Red chair",
      "b": [
       4.0,
       52.0,
       26.0,
       40.0
      ]
     },
     {
      "n": "Quill pen",
      "b": [
       40.0,
       50.0,
       14.0,
       26.0
      ]
     },
     {
      "n": "Inkwell",
      "b": [
       50.0,
       58.0,
       14.0,
       16.0
      ]
     },
     {
      "n": "Pocket watch",
      "b": [
       36.0,
       68.0,
       16.0,
       16.0
      ]
     },
     {
      "n": "Wooden desk",
      "b": [
       28.0,
       54.0,
       44.0,
       32.0
      ]
     }
    ]
   },
   {
    "id": "art-philly-s03",
    "src": "images/art/philly-s03.jpg",
    "title": "Philadelphia Street",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Gas street lamp",
      "b": [
       2.0,
       4.0,
       14.0,
       48.0
      ]
     },
     {
      "n": "Brick row houses",
      "b": [
       18.0,
       2.0,
       72.0,
       36.0
      ]
     },
     {
      "n": "Shop sign",
      "b": [
       42.0,
       8.0,
       20.0,
       16.0
      ]
     },
     {
      "n": "Flower box",
      "b": [
       24.0,
       20.0,
       16.0,
       14.0
      ]
     },
     {
      "n": "Carriage horse",
      "b": [
       24.0,
       38.0,
       22.0,
       34.0
      ]
     },
     {
      "n": "Carriage driver",
      "b": [
       46.0,
       32.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "Horse-drawn carriage",
      "b": [
       36.0,
       40.0,
       32.0,
       32.0
      ]
     },
     {
      "n": "Carriage wheel",
      "b": [
       52.0,
       56.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "Woman in a bonnet",
      "b": [
       4.0,
       40.0,
       18.0,
       36.0
      ]
     },
     {
      "n": "Bonnet",
      "b": [
       6.0,
       38.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Man in a top hat",
      "b": [
       62.0,
       34.0,
       18.0,
       36.0
      ]
     },
     {
      "n": "Cobblestones",
      "b": [
       0.0,
       72.0,
       100.0,
       26.0
      ]
     }
    ]
   },
   {
    "id": "transcon-s07",
    "src": "images/art/transcon-s07.jpg",
    "title": "The Stage-Line Livery",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Stage-Line Livery sign",
      "b": [
       10.0,
       0.0,
       39.0,
       24.0
      ]
     },
     {
      "n": "Horseshoe",
      "b": [
       28.5,
       18.5,
       4.5,
       6.0
      ]
     },
     {
      "n": "Windmill",
      "b": [
       86.0,
       8.0,
       7.5,
       26.0
      ]
     },
     {
      "n": "Basket of apples",
      "b": [
       14.0,
       80.0,
       11.5,
       20.0
      ]
     },
     {
      "n": "Apples on the ground",
      "b": [
       23.0,
       95.0,
       6.5,
       5.0
      ]
     },
     {
      "n": "Ladder",
      "b": [
       2.0,
       60.0,
       9.5,
       28.0
      ]
     },
     {
      "n": "“To all points west” poster",
      "b": [
       0.5,
       29.0,
       10.5,
       28.0
      ]
     },
     {
      "n": "Mule",
      "b": [
       36.0,
       42.0,
       21.0,
       52.0
      ]
     },
     {
      "n": "Straw hat",
      "b": [
       26.5,
       38.0,
       8.5,
       8.0
      ]
     },
     {
      "n": "Brown cowboy hat",
      "b": [
       17.0,
       29.5,
       8.0,
       9.0
      ]
     },
     {
      "n": "Rag",
      "b": [
       10.0,
       48.0,
       5.0,
       14.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       83.5,
       60.0,
       13.0,
       32.0
      ]
     },
     {
      "n": "Lead rope",
      "b": [
       32.0,
       62.0,
       12.0,
       10.0
      ]
     },
     {
      "n": "Concord coach",
      "b": [
       35.5,
       28.0,
       17.0,
       21.0
      ]
     },
     {
      "n": "Red coach",
      "b": [
       55.0,
       22.0,
       17.0,
       38.0
      ]
     },
     {
      "n": "White beard",
      "b": [
       29.0,
       44.0,
       5.5,
       7.0
      ]
     },
     {
      "n": "Kneeling man’s hat",
      "b": [
       75.5,
       46.0,
       9.0,
       9.0
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s15",
    "src": "images/art/transcon-s15.jpg",
    "title": "The River Crossing",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Cottonwood trees",
      "b": [
       0.0,
       4.0,
       32.0,
       38.0
      ]
     },
     {
      "n": "Far bank",
      "b": [
       6.0,
       16.0,
       58.0,
       18.0
      ]
     },
     {
      "n": "Wagon on the bank",
      "b": [
       70.0,
       22.0,
       24.0,
       22.0
      ]
     },
     {
      "n": "Canvas top",
      "b": [
       30.0,
       26.0,
       20.0,
       16.0
      ]
     },
     {
      "n": "Wagon in the river",
      "b": [
       20.0,
       32.0,
       34.0,
       30.0
      ]
     },
     {
      "n": "Ox team",
      "b": [
       4.0,
       40.0,
       24.0,
       26.0
      ]
     },
     {
      "n": "Cowboy hat",
      "b": [
       58.0,
       18.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Rider",
      "b": [
       54.0,
       24.0,
       20.0,
       24.0
      ]
     },
     {
      "n": "Saddle horse",
      "b": [
       52.0,
       36.0,
       24.0,
       30.0
      ]
     },
     {
      "n": "Splash",
      "b": [
       12.0,
       52.0,
       18.0,
       16.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       32.0,
       48.0,
       14.0,
       16.0
      ]
     },
     {
      "n": "River",
      "b": [
       0.0,
       58.0,
       100.0,
       34.0
      ]
     }
    ]
   },
   {
    "id": "philly-s15",
    "src": "images/art/philly-s15.jpg",
    "title": "The Pink Dress",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Feathered hat",
      "b": [
       11.0,
       0.0,
       18.0,
       19.0
      ]
     },
     {
      "n": "Beard",
      "b": [
       19.0,
       16.0,
       7.0,
       13.0
      ]
     },
     {
      "n": "Pink dress",
      "b": [
       7.0,
       26.0,
       30.0,
       68.0
      ]
     },
     {
      "n": "Lace cuff",
      "b": [
       30.0,
       52.0,
       5.5,
       9.0
      ]
     },
     {
      "n": "Boy’s straw hat",
      "b": [
       37.0,
       49.0,
       10.0,
       15.0
      ]
     },
     {
      "n": "Pointing finger",
      "b": [
       46.0,
       39.0,
       5.0,
       7.0
      ]
     },
     {
      "n": "Second pointing finger",
      "b": [
       49.0,
       57.0,
       5.0,
       6.0
      ]
     },
     {
      "n": "Lace bonnet",
      "b": [
       66.0,
       22.0,
       11.0,
       16.0
      ]
     },
     {
      "n": "Dark bonnet",
      "b": [
       78.5,
       21.0,
       8.5,
       15.0
      ]
     },
     {
      "n": "Straw bonnet",
      "b": [
       91.0,
       26.0,
       9.0,
       14.0
      ]
     },
     {
      "n": "Laughing boy’s hat",
      "b": [
       61.5,
       56.0,
       9.0,
       14.0
      ]
     },
     {
      "n": "Black hat",
      "b": [
       74.5,
       55.0,
       8.5,
       12.0
      ]
     },
     {
      "n": "Shop window",
      "b": [
       44.5,
       0.0,
       15.0,
       38.0
      ]
     },
     {
      "n": "Veranda",
      "b": [
       80.0,
       5.0,
       20.0,
       18.0
      ]
     },
     {
      "n": "Blue shirt",
      "b": [
       35.5,
       65.0,
       14.0,
       35.0
      ]
     },
     {
      "n": "Child peeking",
      "b": [
       76.0,
       34.0,
       4.5,
       7.0
      ]
     },
     {
      "n": "Plank",
      "b": [
       3.0,
       86.0,
       34.0,
       14.0
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s26",
    "src": "images/art/transcon-s26.jpg",
    "title": "Snowbound",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Snowy mountains",
      "b": [
       0.0,
       0.0,
       68.0,
       28.0
      ]
     },
     {
      "n": "Pine trees",
      "b": [
       0.0,
       14.0,
       38.0,
       56.0
      ]
     },
     {
      "n": "Chimney smoke",
      "b": [
       68.0,
       2.0,
       18.0,
       18.0
      ]
     },
     {
      "n": "Stone chimney",
      "b": [
       72.0,
       8.0,
       14.0,
       20.0
      ]
     },
     {
      "n": "Log cabin",
      "b": [
       62.0,
       12.0,
       36.0,
       36.0
      ]
     },
     {
      "n": "Canvas cover",
      "b": [
       34.0,
       46.0,
       20.0,
       18.0
      ]
     },
     {
      "n": "Covered wagon",
      "b": [
       30.0,
       48.0,
       32.0,
       34.0
      ]
     },
     {
      "n": "Draft horse",
      "b": [
       32.0,
       58.0,
       18.0,
       24.0
      ]
     },
     {
      "n": "Fur hat",
      "b": [
       66.0,
       48.0,
       16.0,
       16.0
      ]
     },
     {
      "n": "Man in a fur coat",
      "b": [
       64.0,
       52.0,
       22.0,
       34.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       74.0,
       64.0,
       16.0,
       20.0
      ]
     },
     {
      "n": "Deep snow",
      "b": [
       0.0,
       78.0,
       100.0,
       22.0
      ]
     }
    ]
   },
   {
    "id": "art-philly-s32",
    "src": "images/art/philly-s32.jpg",
    "title": "Market Day",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Hanging shop sign",
      "b": [
       14.0,
       4.0,
       20.0,
       16.0
      ]
     },
     {
      "n": "Brick storefront",
      "b": [
       0.0,
       0.0,
       38.0,
       28.0
      ]
     },
     {
      "n": "Striped awning",
      "b": [
       42.0,
       12.0,
       26.0,
       18.0
      ]
     },
     {
      "n": "Market awning",
      "b": [
       4.0,
       18.0,
       34.0,
       20.0
      ]
     },
     {
      "n": "Bonnet",
      "b": [
       34.0,
       24.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Woman in a bonnet",
      "b": [
       32.0,
       32.0,
       18.0,
       40.0
      ]
     },
     {
      "n": "Baskets of fruit",
      "b": [
       4.0,
       40.0,
       28.0,
       24.0
      ]
     },
     {
      "n": "Red apples",
      "b": [
       8.0,
       44.0,
       16.0,
       16.0
      ]
     },
     {
      "n": "Wicker basket",
      "b": [
       52.0,
       42.0,
       16.0,
       18.0
      ]
     },
     {
      "n": "Man with a basket",
      "b": [
       48.0,
       28.0,
       20.0,
       40.0
      ]
     },
     {
      "n": "Flower cart",
      "b": [
       66.0,
       34.0,
       24.0,
       30.0
      ]
     },
     {
      "n": "Child by the cart",
      "b": [
       78.0,
       44.0,
       14.0,
       28.0
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s37",
    "src": "images/art/transcon-s37.jpg",
    "title": "The Stampede",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Distant mountains",
      "b": [
       0.0,
       2.0,
       42.0,
       20.0
      ]
     },
     {
      "n": "Cowboy hat",
      "b": [
       60.0,
       12.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Cowboy",
      "b": [
       56.0,
       16.0,
       20.0,
       26.0
      ]
     },
     {
      "n": "Cow horse",
      "b": [
       52.0,
       30.0,
       24.0,
       30.0
      ]
     },
     {
      "n": "Thrown lasso",
      "b": [
       70.0,
       18.0,
       20.0,
       20.0
      ]
     },
     {
      "n": "Second rider",
      "b": [
       76.0,
       22.0,
       18.0,
       26.0
      ]
     },
     {
      "n": "Wagon on the horizon",
      "b": [
       40.0,
       22.0,
       16.0,
       14.0
      ]
     },
     {
      "n": "Dust cloud",
      "b": [
       24.0,
       28.0,
       38.0,
       30.0
      ]
     },
     {
      "n": "The herd",
      "b": [
       34.0,
       34.0,
       40.0,
       32.0
      ]
     },
     {
      "n": "Longhorn horns",
      "b": [
       2.0,
       32.0,
       24.0,
       16.0
      ]
     },
     {
      "n": "Foreground steer",
      "b": [
       0.0,
       40.0,
       36.0,
       42.0
      ]
     },
     {
      "n": "Steer's tail",
      "b": [
       26.0,
       54.0,
       14.0,
       16.0
      ]
     }
    ]
   },
   {
    "id": "art-philly-s37",
    "src": "images/art/philly-s37.jpg",
    "title": "The Depot",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Steam cloud",
      "b": [
       16.0,
       2.0,
       32.0,
       22.0
      ]
     },
     {
      "n": "Station clock",
      "b": [
       34.0,
       4.0,
       16.0,
       20.0
      ]
     },
     {
      "n": "Smokestack",
      "b": [
       10.0,
       16.0,
       14.0,
       20.0
      ]
     },
     {
      "n": "Locomotive",
      "b": [
       0.0,
       28.0,
       46.0,
       38.0
      ]
     },
     {
      "n": "Iron column",
      "b": [
       48.0,
       12.0,
       12.0,
       36.0
      ]
     },
     {
      "n": "Passenger car",
      "b": [
       42.0,
       32.0,
       32.0,
       32.0
      ]
     },
     {
      "n": "Conductor's cap",
      "b": [
       66.0,
       34.0,
       10.0,
       12.0
      ]
     },
     {
      "n": "Conductor",
      "b": [
       64.0,
       38.0,
       16.0,
       30.0
      ]
     },
     {
      "n": "Woman with a trunk",
      "b": [
       74.0,
       38.0,
       16.0,
       30.0
      ]
     },
     {
      "n": "Steamer trunk",
      "b": [
       76.0,
       58.0,
       16.0,
       18.0
      ]
     },
     {
      "n": "Pile of luggage",
      "b": [
       84.0,
       48.0,
       14.0,
       22.0
      ]
     },
     {
      "n": "Station platform",
      "b": [
       0.0,
       68.0,
       100.0,
       26.0
      ]
     }
    ]
   },
   {
    "id": "transcon-s53",
    "src": "images/art/transcon-s53.jpg",
    "title": "Camp Supper",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Cowboy hat",
      "b": [
       20.0,
       6.0,
       8.5,
       9.0
      ]
     },
     {
      "n": "Horse",
      "b": [
       11.0,
       25.0,
       21.0,
       55.0
      ]
     },
     {
      "n": "Barrel of lobsters",
      "b": [
       61.0,
       3.0,
       13.0,
       17.0
      ]
     },
     {
      "n": "Barrel of ice",
      "b": [
       83.0,
       12.0,
       16.0,
       30.0
      ]
     },
     {
      "n": "Apron",
      "b": [
       51.0,
       34.0,
       12.0,
       40.0
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       57.5,
       32.0,
       5.0,
       6.0
      ]
     },
     {
      "n": "Frying pan",
      "b": [
       53.0,
       76.0,
       23.0,
       12.0
      ]
     },
     {
      "n": "Fork",
      "b": [
       67.0,
       72.0,
       6.0,
       10.0
      ]
     },
     {
      "n": "Campfire",
      "b": [
       59.0,
       88.0,
       14.0,
       12.0
      ]
     },
     {
      "n": "Cooking pot",
      "b": [
       37.0,
       82.0,
       11.0,
       18.0
      ]
     },
     {
      "n": "Longhorn steer",
      "b": [
       0.0,
       40.0,
       13.0,
       20.0
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       42.0,
       50.0,
       9.0,
       28.0
      ]
     },
     {
      "n": "Plaid shirt",
      "b": [
       72.0,
       42.0,
       26.0,
       40.0
      ]
     },
     {
      "n": "Cook’s hat",
      "b": [
       57.0,
       19.0,
       9.0,
       9.0
      ]
     },
     {
      "n": "Bearded man’s hat",
      "b": [
       76.0,
       31.0,
       12.0,
       11.0
      ]
     },
     {
      "n": "Metal bowl",
      "b": [
       90.0,
       89.0,
       10.0,
       11.0
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s58",
    "src": "images/art/transcon-s58.jpg",
    "title": "Journey's End",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Low sun",
      "b": [
       72.0,
       2.0,
       16.0,
       18.0
      ]
     },
     {
      "n": "Seagulls",
      "b": [
       54.0,
       6.0,
       24.0,
       16.0
      ]
     },
     {
      "n": "Ship sails",
      "b": [
       62.0,
       18.0,
       18.0,
       20.0
      ]
     },
     {
      "n": "Ship on the bay",
      "b": [
       54.0,
       26.0,
       30.0,
       30.0
      ]
     },
     {
      "n": "Ocean",
      "b": [
       44.0,
       38.0,
       56.0,
       34.0
      ]
     },
     {
      "n": "Jang's hat",
      "b": [
       2.0,
       30.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Jang",
      "b": [
       0.0,
       38.0,
       18.0,
       34.0
      ]
     },
     {
      "n": "Tom's hat",
      "b": [
       16.0,
       32.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Tom",
      "b": [
       14.0,
       40.0,
       20.0,
       36.0
      ]
     },
     {
      "n": "Celebrating crowd",
      "b": [
       30.0,
       42.0,
       24.0,
       32.0
      ]
     },
     {
      "n": "Parked wagon",
      "b": [
       0.0,
       46.0,
       16.0,
       26.0
      ]
     },
     {
      "n": "Bonfire",
      "b": [
       6.0,
       60.0,
       22.0,
       26.0
      ]
     }
    ]
   },
   {
    "id": "art-philly-s59",
    "src": "images/art/philly-s59.jpg",
    "title": "Curtain Call",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Red curtain",
      "b": [
       0.0,
       2.0,
       20.0,
       64.0
      ]
     },
     {
      "n": "Spotlight",
      "b": [
       26.0,
       0.0,
       26.0,
       22.0
      ]
     },
     {
      "n": "Jang on stage",
      "b": [
       22.0,
       26.0,
       18.0,
       38.0
      ]
     },
     {
      "n": "Tom on stage",
      "b": [
       40.0,
       24.0,
       20.0,
       40.0
      ]
     },
     {
      "n": "Bouquet",
      "b": [
       34.0,
       50.0,
       14.0,
       14.0
      ]
     },
     {
      "n": "Footlights",
      "b": [
       18.0,
       56.0,
       46.0,
       12.0
      ]
     },
     {
      "n": "Woman in a box",
      "b": [
       70.0,
       18.0,
       18.0,
       32.0
      ]
     },
     {
      "n": "Playbill",
      "b": [
       76.0,
       46.0,
       14.0,
       18.0
      ]
     },
     {
      "n": "Audience top hats",
      "b": [
       0.0,
       64.0,
       34.0,
       18.0
      ]
     },
     {
      "n": "Orchestra pit",
      "b": [
       14.0,
       72.0,
       56.0,
       20.0
      ]
     },
     {
      "n": "Violin in the pit",
      "b": [
       20.0,
       74.0,
       12.0,
       14.0
      ]
     },
     {
      "n": "Stage",
      "b": [
       16.0,
       22.0,
       52.0,
       40.0
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "rusty",
  "name": "The Rusty Stack",
  "sound": "airship",
  "pics": [
   {
    "id": "rusty-stack",
    "src": "images/rusty-stack-game.jpg",
    "title": "The Rusty Stack",
    "credit": "Game art · The Rusty Stack Adventures",
    "items": [
     {
      "n": "Storm clouds",
      "b": [
       0.0,
       0.0,
       40.0,
       34.0
      ]
     },
     {
      "n": "Lightning bolt",
      "b": [
       68.0,
       0.0,
       30.0,
       44.0
      ]
     },
     {
      "n": "Black smoke",
      "b": [
       44.0,
       0.0,
       20.0,
       16.0
      ]
     },
     {
      "n": "Smokestack",
      "b": [
       40.0,
       2.0,
       16.0,
       24.0
      ]
     },
     {
      "n": "Envelope patches",
      "b": [
       12.0,
       8.0,
       22.0,
       18.0
      ]
     },
     {
      "n": "Gas envelope",
      "b": [
       2.0,
       4.0,
       60.0,
       34.0
      ]
     },
     {
      "n": "Rigging",
      "b": [
       16.0,
       24.0,
       38.0,
       16.0
      ]
     },
     {
      "n": "Propeller",
      "b": [
       0.0,
       34.0,
       18.0,
       26.0
      ]
     },
     {
      "n": "Gondola",
      "b": [
       22.0,
       40.0,
       30.0,
       22.0
      ]
     },
     {
      "n": "Running light",
      "b": [
       28.0,
       44.0,
       10.0,
       12.0
      ]
     },
     {
      "n": "Rust streak",
      "b": [
       38.0,
       38.0,
       14.0,
       22.0
      ]
     },
     {
      "n": "Hull plates",
      "b": [
       10.0,
       36.0,
       64.0,
       34.0
      ]
     },
     {
      "n": "Tail fin",
      "b": [
       80.0,
       46.0,
       16.0,
       28.0
      ]
     }
    ]
   }
  ]
 }
];
const ISPY_PICS = ISPY_BOOKS.flatMap(book => book.pics.map(p => Object.assign({ book: book.name, sound: book.sound }, p)));
const ROUND = 5;

const Ambience = (() => {
  let ctx, master, alive = [], clock = null, kind = null, muted = false, noise = null;
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.42;
      master.connect(ctx.destination);
      const len = ctx.sampleRate * 2;
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function keep(node) { alive.push(node); return node; }
  function silence() {
    if (clock) { clearInterval(clock); clock = null; }
    alive.forEach(n => { try { n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
    alive = [];
  }
  function wind(freq, gain) {
    const c = ac();
    const src = keep(c.createBufferSource());
    src.buffer = noise;
    src.loop = true;
    const filter = keep(c.createBiquadFilter());
    filter.type = "lowpass";
    filter.frequency.value = freq;
    const amp = keep(c.createGain());
    amp.gain.value = gain;
    const lfo = keep(c.createOscillator());
    lfo.frequency.value = 0.07 + Math.random() * 0.05;
    const lfoGain = keep(c.createGain());
    lfoGain.gain.value = freq * 0.28;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    const swell = keep(c.createOscillator());
    swell.frequency.value = 0.13;
    const swellGain = keep(c.createGain());
    swellGain.gain.value = gain * 0.35;
    swell.connect(swellGain);
    swellGain.connect(amp.gain);
    src.connect(filter);
    filter.connect(amp);
    amp.connect(master);
    src.start();
    lfo.start();
    swell.start();
  }
  function hum(freq, type, gain) {
    const c = ac();
    const osc = keep(c.createOscillator());
    osc.type = type;
    osc.frequency.value = freq;
    const filter = keep(c.createBiquadFilter());
    filter.type = "lowpass";
    filter.frequency.value = 220;
    const amp = keep(c.createGain());
    amp.gain.value = gain;
    const lfo = keep(c.createOscillator());
    lfo.frequency.value = 0.18;
    const lfoGain = keep(c.createGain());
    lfoGain.gain.value = freq * 0.01;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(master);
    osc.start();
    lfo.start();
  }
  function chirp() {
    const c = ac();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "square";
    osc.frequency.value = 3800 + Math.random() * 600;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 4200;
    filter.Q.value = 12;
    const amp = c.createGain();
    amp.gain.value = 0;
    osc.connect(filter);
    filter.connect(amp);
    amp.connect(master);
    const bursts = 3 + (Math.random() * 3 | 0);
    for (let i = 0; i < bursts; i++) {
      const t = now + i * 0.08;
      amp.gain.setValueAtTime(0.0001, t);
      amp.gain.linearRampToValueAtTime(0.045, t + 0.01);
      amp.gain.linearRampToValueAtTime(0.0001, t + 0.035);
    }
    osc.start(now);
    osc.stop(now + bursts * 0.08 + 0.05);
  }
  function bird() {
    const c = ac();
    if (!c) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = "sine";
    const base = 1300 + Math.random() * 700;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(base * 0.82, now + 0.28);
    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(0.035, now + 0.03);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    osc.connect(amp);
    amp.connect(master);
    osc.start(now);
    osc.stop(now + 0.36);
  }
  function creak() {
    const c = ac();
    if (!c) return;
    const now = c.currentTime;
    const src = c.createBufferSource();
    src.buffer = noise;
    const filter = c.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 8;
    filter.frequency.setValueAtTime(180 + Math.random() * 220, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + 0.5);
    const amp = c.createGain();
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.linearRampToValueAtTime(0.06, now + 0.04);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    src.connect(filter);
    filter.connect(amp);
    amp.connect(master);
    src.start(now);
    src.stop(now + 0.58);
  }
  function start(next) {
    if (!ac()) return;
    if (kind === next && alive.length) return;
    silence();
    kind = next;
    if (next === "airship") {
      hum(49, "sine", 0.09);
      hum(73.5, "triangle", 0.045);
      hum(98, "sine", 0.02);
      wind(260, 0.055);
      clock = setInterval(() => { if (kind === "airship" && Math.random() < 0.8) creak(); }, 3200);
    } else {
      wind(480, 0.11);
      wind(1200, 0.03);
      clock = setInterval(() => {
        if (kind !== "prairie") return;
        if (Math.random() < 0.62) chirp();
        else bird();
      }, 2400);
    }
  }
  return {
    unlock() { ac(); },
    play(next) { start(next); },
    stop() { silence(); kind = null; },
    toggle() {
      muted = !muted;
      if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.42, ctx.currentTime, 0.04);
      else if (master) master.gain.value = muted ? 0 : 0.42;
      return muted;
    },
    get muted() { return muted; },
    get running() { return !!kind; },
    get kind() { return kind; }
  };
})();

(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const gal = $("#ispy-gallery"), game = $("#ispy-game"), img = $("#ispy-img"), pic = $("#ispy-pic"), view = $("#ispy-view"), marks = $("#ispy-marks");
  const list = $("#ispy-items"), fEl = $("#is-found"), ofEl = $("#is-of"), tEl = $("#is-time"), sEl = $("#is-score"), win = $("#ispy-win");
  const muteBtn = $("#is-mute");
  let P = null, targets = [], found = new Set(), misses = 0, hints = 0, start = 0, clock = null, over = false, zoom = 1, armed = false;

  gal.innerHTML = ISPY_BOOKS.map(book => {
    const cards = book.pics.map(p => {
      const i = ISPY_PICS.indexOf(ISPY_PICS.find(q => q.id === p.id));
      return `<button type="button" class="ispy-card" role="listitem" data-i="${i}">
        <span class="ispy-card-img"><img src="${p.src}" alt="" loading="lazy"></span>
        <span class="ispy-card-t"><strong>${esc(p.title)}</strong><em>${p.items.length} things hidden · ${esc(p.credit)}</em></span>
      </button>`;
    }).join("");
    return `<section class="ispy-book"><h2 class="ispy-book-h">${esc(book.name)}</h2><div class="ispy-cards" role="list">${cards}</div></section>`;
  }).join("");

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const secs = () => start ? (performance.now() - start) / 1000 : 0;
  const score = () => Math.max(0, found.size * 100 - misses * 10 - hints * 50);
  const shuffle = a => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  function hud() { fEl.textContent = found.size; sEl.textContent = score(); }
  function renderList() {
    list.innerHTML = targets.map((t, i) => `<li class="${found.has(i) ? "done" : ""}">${esc(t.n)}</li>`).join("");
  }
  function box(t, cls) {
    const [x, y, w, h] = t.b, el = document.createElement("div");
    el.className = cls;
    el.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%`;
    marks.appendChild(el);
    return el;
  }
  function markFound(t) {
    const flash = box(t, "mk-flash");
    setTimeout(() => flash.remove(), 1000);
    const [x, y, w, h] = t.b;
    const dot = document.createElement("div");
    dot.className = "mk-dot";
    dot.style.left = (x + w / 2) + "%";
    dot.style.top = (y + h / 2) + "%";
    dot.textContent = "✓";
    marks.appendChild(dot);
  }
  function setZoom(z) {
    const cx = (view.scrollLeft + view.clientWidth / 2) / (view.scrollWidth || 1);
    const cy = (view.scrollTop + view.clientHeight / 2) / (view.scrollHeight || 1);
    zoom = Math.min(3, Math.max(1, z));
    pic.style.width = (zoom * 100) + "%";
    view.classList.toggle("zoomed", zoom > 1);
    view.scrollLeft = cx * view.scrollWidth - view.clientWidth / 2;
    view.scrollTop = cy * view.scrollHeight - view.clientHeight / 2;
  }
  function newRound() {
    const n = Math.min(ROUND, P.items.length);
    targets = shuffle(P.items).slice(0, n);
    found = new Set();
    misses = 0;
    hints = 0;
    start = 0;
    over = false;
    clearInterval(clock);
    tEl.textContent = "0:00";
    ofEl.textContent = String(n);
    marks.innerHTML = "";
    win.hidden = true;
    renderList();
    hud();
  }
  function arm() {
    if (armed) return;
    armed = true;
    Ambience.unlock();
    if (P && !game.hidden) Ambience.play(P.sound);
  }
  function paintMute() {
    const off = Ambience.muted;
    muteBtn.textContent = off ? "Sound off" : "Sound on";
    muteBtn.setAttribute("aria-pressed", off ? "true" : "false");
    muteBtn.classList.toggle("is-muted", off);
  }
  function open(i, fromUser) {
    P = ISPY_PICS[i];
    img.src = P.src;
    img.alt = P.title + ", " + P.credit;
    $("#ispy-credit").textContent = P.title + " · " + P.credit;
    gal.hidden = true;
    game.hidden = false;
    setZoom(1);
    newRound();
    if (fromUser) armed = true;
    if (armed) {
      Ambience.unlock();
      Ambience.play(P.sound);
    }
    history.replaceState(null, "", "#" + P.id);
    game.scrollIntoView({ block: "start" });
  }
  function close() {
    game.hidden = true;
    gal.hidden = false;
    clearInterval(clock);
    Ambience.stop();
    history.replaceState(null, "", location.pathname);
  }
  document.addEventListener("pointerdown", arm);
  gal.addEventListener("click", e => {
    const b = e.target.closest(".ispy-card");
    if (b) open(+b.dataset.i, true);
  });
  pic.addEventListener("click", e => {
    if (over) return;
    const r = pic.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width * 100;
    const py = (e.clientY - r.top) / r.height * 100;
    if (!start) {
      start = performance.now();
      clock = setInterval(() => { tEl.textContent = fmt(secs()); }, 250);
    }
    const tol = 2.4;
    const hits = targets.map((t, i) => ({ t, i })).filter(({ t, i }) => !found.has(i) && px >= t.b[0] - tol && px <= t.b[0] + t.b[2] + tol && py >= t.b[1] - tol && py <= t.b[1] + t.b[3] + tol)
      .sort((a, b) => a.t.b[2] * a.t.b[3] - b.t.b[2] * b.t.b[3]);
    if (hits.length) {
      const { t, i } = hits[0];
      found.add(i);
      markFound(t);
      renderList();
      hud();
      if (found.size === targets.length) {
        over = true;
        clearInterval(clock);
        $("#ispy-win-h").textContent = targets.length === 5 ? "All five found" : `All ${targets.length} found`;
        $("#ispy-win-text").textContent = `Time ${fmt(secs())} · Score ${score()} · ${misses} miss${misses === 1 ? "" : "es"}${hints ? ` · ${hints} hint${hints === 1 ? "" : "s"}` : ""}`;
        win.hidden = false;
      }
    } else {
      misses++;
      hud();
      const m = document.createElement("div");
      m.className = "mk-miss";
      m.style.cssText = `left:${px}%;top:${py}%`;
      marks.appendChild(m);
      setTimeout(() => m.remove(), 800);
    }
  });
  $("#is-hint").addEventListener("click", () => {
    if (over) return;
    const left = targets.map((t, i) => i).filter(i => !found.has(i));
    if (!left.length) return;
    hints++;
    hud();
    const t = targets[left[Math.floor(Math.random() * left.length)]];
    const [x, y, w, h] = t.b, pad = Math.max(w, h) * 0.6;
    const el = box({ b: [Math.max(0, x - pad), Math.max(0, y - pad), Math.min(100, w + pad * 2), Math.min(100, h + pad * 2)] }, "mk-hint");
    setTimeout(() => el.remove(), 2200);
    if (zoom > 1) {
      view.scrollLeft = (x + w / 2) / 100 * view.scrollWidth - view.clientWidth / 2;
      view.scrollTop = (y + h / 2) / 100 * view.scrollHeight - view.clientHeight / 2;
    }
  });
  $("#is-new").addEventListener("click", newRound);
  $("#is-again").addEventListener("click", newRound);
  $("#is-back").addEventListener("click", close);
  $("#is-other").addEventListener("click", close);
  muteBtn.addEventListener("click", () => {
    arm();
    Ambience.toggle();
    paintMute();
  });
  $("#is-zin").addEventListener("click", () => setZoom(zoom + 0.5));
  $("#is-zout").addEventListener("click", () => setZoom(zoom - 0.5));
  const hash = location.hash.slice(1);
  const hashed = ISPY_PICS.findIndex(p => p.id === hash);
  if (hashed >= 0) open(hashed);
  window.__ispy = {
    open,
    close,
    newRound,
    pics: ISPY_PICS,
    get targets() { return targets; },
    get found() { return found.size; },
    pic,
    ambience: Ambience
  };
})();
