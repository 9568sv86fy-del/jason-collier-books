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
      "n": "Grizzly bear",
      "b": [
       68.3,
       31.3,
       17,
       14.2
      ]
     },
     {
      "n": "Running cowboy",
      "b": [
       86.2,
       33.2,
       11.8,
       12.7
      ]
     },
     {
      "n": "Cows in a whirlpool",
      "b": [
       9.3,
       30.8,
       17,
       8.3
      ]
     },
     {
      "n": "Chicken in a crate",
      "b": [
       20.2,
       34.2,
       14.8,
       8.6
      ]
     },
     {
      "n": "Covered wagon",
      "b": [
       12.4,
       47.4,
       22.5,
       22.4
      ]
     },
     {
      "n": "Laughing man in plaid",
      "b": [
       28.7,
       39.5,
       22,
       32
      ]
     },
     {
      "n": "Man with arms crossed",
      "b": [
       51.2,
       43,
       18,
       30
      ]
     },
     {
      "n": "Goat with a garland",
      "b": [
       11.6,
       67.9,
       18.6,
       17.1
      ]
     },
     {
      "n": "Three alpacas",
      "b": [
       33.4,
       75.2,
       28,
       14.1
      ]
     },
     {
      "n": "Stagecoach and horses",
      "b": [
       68.3,
       68.4,
       27.4,
       14.8
      ]
     },
     {
      "n": "Jang & Tom title",
      "b": [
       16.3,
       4.4,
       50,
       8
      ]
     },
     {
      "n": "Jason Collier name",
      "b": [
       22.5,
       88.9,
       50,
       6.4
      ]
     }
    ]
   },
   {
    "id": "wagonmasters-poster",
    "src": "media/wagonmasters_part1of6_poster.jpg",
    "title": "Beside the Wagon",
    "credit": "Audiobook art · Jang & Tom · Wagon Masters",
    "items": [
     {
      "n": "Laughing bearded face",
      "b": [
       13,
       0,
       10,
       17
      ]
     },
     {
      "n": "Smiling man's face",
      "b": [
       57,
       4,
       9,
       18
      ]
     },
     {
      "n": "Raised hand",
      "b": [
       38.5,
       15,
       8.5,
       20
      ]
     },
     {
      "n": "Cowboy hat",
      "b": [
       60,
       0,
       13,
       16
      ]
     },
     {
      "n": "Red bandana",
      "b": [
       59.5,
       19,
       6.5,
       12
      ]
     },
     {
      "n": "Belt buckle",
      "b": [
       20.5,
       53,
       4.5,
       6.5
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       33,
       52,
       14,
       36
      ]
     },
     {
      "n": "Patch on the wagon cover",
      "b": [
       33,
       1.5,
       6.5,
       13.5
      ]
     },
     {
      "n": "Hay bale",
      "b": [
       83,
       55,
       17,
       16
      ]
     },
     {
      "n": "Wooden fence",
      "b": [
       81,
       26,
       19,
       28
      ]
     },
     {
      "n": "Barn",
      "b": [
       73,
       0,
       24,
       36
      ]
     },
     {
      "n": "Holstered pistol",
      "b": [
       10.5,
       61,
       5.5,
       22
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
      "n": "Red stagecoach",
      "b": [
       11.5,
       42,
       30,
       40
      ]
     },
     {
      "n": "Big spoked wheel",
      "b": [
       23.8,
       63,
       9.2,
       24.5
      ]
     },
     {
      "n": "Rear wheel",
      "b": [
       11.5,
       61,
       9,
       26
      ]
     },
     {
      "n": "Front wheel",
      "b": [
       37.5,
       68,
       5,
       16.5
      ]
     },
     {
      "n": "Stagecoach driver",
      "b": [
       33.5,
       37.5,
       6,
       14
      ]
     },
     {
      "n": "Luggage on the roof",
      "b": [
       21,
       42,
       11.5,
       8.5
      ]
     },
     {
      "n": "Team of horses",
      "b": [
       39.5,
       56.5,
       22,
       26
      ]
     },
     {
      "n": "Lead horse",
      "b": [
       54,
       58,
       10.5,
       21
      ]
     },
     {
      "n": "Snow-capped peak",
      "b": [
       77,
       35,
       12,
       15
      ]
     },
     {
      "n": "Upstairs windows",
      "b": [
       5,
       30.5,
       10,
       10
      ]
     },
     {
      "n": "Telegraph pole",
      "b": [
       91.5,
       49,
       2.5,
       21
      ]
     },
     {
      "n": "Townsfolk on the boardwalk",
      "b": [
       1.5,
       61.5,
       11,
       12
      ]
     }
    ]
   },
   {
    "id": "scene-philly-s09",
    "src": "images/scenes/philly-s09.jpg",
    "title": "The Farmyard",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Straw hat with cherries",
      "b": [
       19.5,
       1,
       16.5,
       17.5
      ]
     },
     {
      "n": "Cherries",
      "b": [
       21,
       7,
       4.5,
       7
      ]
     },
     {
      "n": "Brown cowboy hat",
      "b": [
       58.5,
       5.5,
       11,
       12
      ]
     },
     {
      "n": "Broom",
      "b": [
       47.5,
       20,
       10,
       40
      ]
     },
     {
      "n": "Man lying in the manure",
      "b": [
       32,
       64,
       36,
       28
      ]
     },
     {
      "n": "Fallen man's hat",
      "b": [
       29.8,
       62.5,
       13.3,
       12
      ]
     },
     {
      "n": "Red bandana",
      "b": [
       40,
       74,
       4.5,
       12
      ]
     },
     {
      "n": "Screaming woman",
      "b": [
       77,
       8,
       16,
       40
      ]
     },
     {
      "n": "Potted plant",
      "b": [
       92.5,
       45,
       6.5,
       16
      ]
     },
     {
      "n": "Porch steps",
      "b": [
       72,
       64,
       18,
       12
      ]
     },
     {
      "n": "Bearded man's face",
      "b": [
       54,
       16,
       12,
       16
      ]
     },
     {
      "n": "Horse's raised hoof",
      "b": [
       8,
       28,
       14,
       22
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s10",
    "src": "images/scenes/transcon-s10.jpg",
    "title": "The Crash",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Black top hat",
      "b": [
       62.3,
       32.5,
       6.8,
       9.5
      ]
     },
     {
      "n": "Falling man",
      "b": [
       38.5,
       32,
       39,
       45
      ]
     },
     {
      "n": "Yellow waistcoat",
      "b": [
       53.5,
       45.5,
       9.5,
       21
      ]
     },
     {
      "n": "Broken front wheel",
      "b": [
       6.5,
       62,
       13.5,
       27
      ]
     },
     {
      "n": "Rear wheel",
      "b": [
       4.5,
       36,
       8.5,
       22
      ]
     },
     {
      "n": "Luggage on the roof",
      "b": [
       23,
       4.5,
       18.5,
       9
      ]
     },
     {
      "n": "Bearded driver",
      "b": [
       75.5,
       1.5,
       24,
       40
      ]
     },
     {
      "n": "Brown cowboy hat",
      "b": [
       79,
       1.5,
       8.5,
       8
      ]
     },
     {
      "n": "Shouting man",
      "b": [
       61.5,
       6.5,
       17,
       22
      ]
     },
     {
      "n": "Shouting man's hat",
      "b": [
       68,
       7.5,
       7.5,
       7
      ]
     },
     {
      "n": "Second coach front wheel",
      "b": [
       69,
       40,
       5.5,
       17
      ]
     },
     {
      "n": "Second coach rear wheel",
      "b": [
       77,
       43,
       7,
       17
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
      "n": "Red cap",
      "b": [
       39.5,
       4,
       6.5,
       7.5
      ]
     },
     {
      "n": "Red flag",
      "b": [
       3.5,
       17,
       12.5,
       22
      ]
     },
     {
      "n": "Flag post",
      "b": [
       2.5,
       12,
       3.5,
       50
      ]
     },
     {
      "n": "Black riding boot",
      "b": [
       15.8,
       57,
       7,
       11
      ]
     },
     {
      "n": "Stirrup",
      "b": [
       45.5,
       62,
       5.5,
       10
      ]
     },
     {
      "n": "Green-capped jockey",
      "b": [
       57,
       25,
       7,
       16
      ]
     },
     {
      "n": "Black horse",
      "b": [
       54,
       33,
       13.5,
       36
      ]
     },
     {
      "n": "Blue-capped jockey",
      "b": [
       68.8,
       27,
       7.8,
       20
      ]
     },
     {
      "n": "Yellow-capped jockey",
      "b": [
       79.5,
       31,
       6.5,
       15
      ]
     },
     {
      "n": "Purple-capped jockey",
      "b": [
       87.4,
       34,
       5.5,
       13
      ]
     },
     {
      "n": "Lead horse's head",
      "b": [
       28,
       18,
       16,
       18
      ]
     },
     {
      "n": "Bearded rider's face",
      "b": [
       36,
       10,
       10,
       14
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s21",
    "src": "images/scenes/transcon-s21.jpg",
    "title": "Through the Herd",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Brown hat waved in the air",
      "b": [
       32,
       1,
       6,
       11
      ]
     },
     {
      "n": "Man waving his hat",
      "b": [
       32,
       1,
       18,
       32
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       42.5,
       9,
       4,
       7
      ]
     },
     {
      "n": "Bearded driver",
      "b": [
       46,
       7.5,
       16,
       36
      ]
     },
     {
      "n": "Driver's cowboy hat",
      "b": [
       54,
       7.5,
       7.5,
       8.5
      ]
     },
     {
      "n": "Red coach body",
      "b": [
       59,
       14,
       22,
       40
      ]
     },
     {
      "n": "Luggage on the roof",
      "b": [
       61,
       13.5,
       18,
       12
      ]
     },
     {
      "n": "Front wagon wheel",
      "b": [
       58,
       62,
       8,
       20
      ]
     },
     {
      "n": "Rear wagon wheel",
      "b": [
       73.5,
       59,
       10.5,
       28
      ]
     },
     {
      "n": "Lead horse's head",
      "b": [
       9,
       26,
       12,
       28
      ]
     },
     {
      "n": "White spotted longhorn",
      "b": [
       32,
       58,
       26,
       36
      ]
     },
     {
      "n": "Brown longhorn",
      "b": [
       84,
       53,
       15,
       33
      ]
     }
    ]
   },
   {
    "id": "scene-philly-s45",
    "src": "images/scenes/philly-s45.jpg",
    "title": "Tin Cups",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Campfire",
      "b": [
       28.5,
       79,
       10.5,
       16.5
      ]
     },
     {
      "n": "Tin cups",
      "b": [
       45.5,
       48.5,
       6,
       8.5
      ]
     },
     {
      "n": "Left man's cowboy hat",
      "b": [
       29.5,
       36,
       13,
       10
      ]
     },
     {
      "n": "Right man's cowboy hat",
      "b": [
       57,
       34,
       14,
       10
      ]
     },
     {
      "n": "Mustached man",
      "b": [
       22,
       36,
       22,
       42
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       33.5,
       50,
       4.5,
       9
      ]
     },
     {
      "n": "Bearded man in plaid",
      "b": [
       50.5,
       34,
       24,
       48
      ]
     },
     {
      "n": "Long dark beard",
      "b": [
       61,
       44,
       7,
       14
      ]
     },
     {
      "n": "Covered wagons on the left",
      "b": [
       0,
       44,
       26,
       18
      ]
     },
     {
      "n": "Covered wagons on the right",
      "b": [
       75,
       44,
       24,
       18
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
      "n": "White goat",
      "b": [
       2,
       59,
       34,
       38
      ]
     },
     {
      "n": "Hat in the goat's mouth",
      "b": [
       35,
       69,
       11,
       12
      ]
     },
     {
      "n": "Shocked man's face",
      "b": [
       45,
       52,
       8.5,
       16
      ]
     },
     {
      "n": "Black top hat",
      "b": [
       7.5,
       14.5,
       12,
       17
      ]
     },
     {
      "n": "Walrus mustache",
      "b": [
       10.5,
       31,
       8.5,
       7
      ]
     },
     {
      "n": "Watch chain",
      "b": [
       16,
       67,
       9,
       6
      ]
     },
     {
      "n": "Raised brown hat",
      "b": [
       44.5,
       4,
       9.5,
       14
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       55,
       37,
       9,
       17
      ]
     },
     {
      "n": "Bearded man's black hat",
      "b": [
       83,
       18.5,
       13.5,
       12
      ]
     },
     {
      "n": "Wrecked timber",
      "b": [
       65,
       9,
       22,
       24
      ]
     },
     {
      "n": "Reporter's notepad",
      "b": [
       70.5,
       48.5,
       4.5,
       6
      ]
     },
     {
      "n": "Laughing woman",
      "b": [
       0,
       29,
       6.5,
       17
      ]
     }
    ]
   },
   {
    "id": "scene-transcon-s57",
    "src": "images/scenes/transcon-s57.jpg",
    "title": "The Dock",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "White handkerchief",
      "b": [
       17.5,
       16.5,
       11.5,
       14
      ]
     },
     {
      "n": "Red-haired woman",
      "b": [
       9,
       26,
       8,
       18
      ]
     },
     {
      "n": "Left boy's raised cap",
      "b": [
       21.5,
       32.5,
       5,
       8
      ]
     },
     {
      "n": "Right boy's raised cap",
      "b": [
       30.5,
       36,
       5.5,
       8
      ]
     },
     {
      "n": "White goat",
      "b": [
       14.5,
       65,
       24,
       30
      ]
     },
     {
      "n": "Paper in the goat's mouth",
      "b": [
       37.5,
       74.5,
       7.5,
       14
      ]
     },
     {
      "n": "Smokestack",
      "b": [
       69,
       7.5,
       5,
       25
      ]
     },
     {
      "n": "Red paddle wheel",
      "b": [
       80,
       42.5,
       12,
       20
      ]
     },
     {
      "n": "Raised brown hat",
      "b": [
       45.5,
       11,
       5.5,
       8.5
      ]
     },
     {
      "n": "Bearded man waving",
      "b": [
       60,
       24,
       14,
       28
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       54.5,
       30.5,
       4.5,
       9
      ]
     },
     {
      "n": "Dock piling",
      "b": [
       56,
       74,
       4.5,
       22
      ]
     }
    ]
   },
   {
    "id": "art-philly-s01",
    "src": "images/art/philly-s01.jpg",
    "title": "The Street Lamp",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Horse",
      "b": [
       10.5,
       54,
       10,
       32
      ]
     },
     {
      "n": "Enclosed carriage",
      "b": [
       20,
       50.5,
       15,
       29
      ]
     },
     {
      "n": "Rear carriage wheel",
      "b": [
       31,
       61.5,
       5,
       18
      ]
     },
     {
      "n": "Front carriage wheel",
      "b": [
       26.5,
       65.5,
       5,
       14
      ]
     },
     {
      "n": "Man in a top hat",
      "b": [
       73,
       38,
       12,
       48
      ]
     },
     {
      "n": "Top hat",
      "b": [
       76,
       34.5,
       5.5,
       8.5
      ]
     },
     {
      "n": "Lit street lamp",
      "b": [
       81.5,
       6,
       7,
       22
      ]
     },
     {
      "n": "Lamp post",
      "b": [
       83.5,
       28,
       4,
       48
      ]
     },
     {
      "n": "Distant street lamp",
      "b": [
       65.5,
       52,
       2.5,
       6.5
      ]
     },
     {
      "n": "Chimney",
      "b": [
       12.5,
       7,
       4.5,
       11
      ]
     }
    ]
   },
   {
    "id": "art-philly-s03",
    "src": "images/art/philly-s03.jpg",
    "title": "The Pickled Eggs",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Jar of pickled eggs",
      "b": [
       7,
       49,
       24.5,
       51
      ]
     },
     {
      "n": "Pickled egg",
      "b": [
       12.5,
       68,
       9.5,
       13
      ]
     },
     {
      "n": "Pointing finger",
      "b": [
       28,
       71,
       9,
       14
      ]
     },
     {
      "n": "Round spectacles",
      "b": [
       38,
       23.5,
       20,
       13.5
      ]
     },
     {
      "n": "Sly grin",
      "b": [
       43,
       43,
       9,
       6.5
      ]
     },
     {
      "n": "White shirt collar",
      "b": [
       47,
       51,
       13,
       10
      ]
     },
     {
      "n": "Black cravat",
      "b": [
       48.5,
       57,
       9,
       22
      ]
     },
     {
      "n": "Hanging oil lamp",
      "b": [
       82,
       15,
       12,
       28
      ]
     },
     {
      "n": "Glass bottle",
      "b": [
       1,
       25,
       8.5,
       42
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
       8.5,
       0,
       40.5,
       21
      ]
     },
     {
      "n": "To all points west poster",
      "b": [
       1.5,
       29,
       9.5,
       28
      ]
     },
     {
      "n": "Ladder",
      "b": [
       3,
       60,
       8,
       27
      ]
     },
     {
      "n": "Basket of apples",
      "b": [
       14,
       80,
       11.5,
       20
      ]
     },
     {
      "n": "Straw hat",
      "b": [
       26.5,
       38.5,
       9.5,
       8.5
      ]
     },
     {
      "n": "Old man with a white beard",
      "b": [
       22,
       38,
       18,
       59
      ]
     },
     {
      "n": "Mule",
      "b": [
       37,
       42,
       19.5,
       52
      ]
     },
     {
      "n": "Brown cowboy hat",
      "b": [
       17,
       29.5,
       7.5,
       9.5
      ]
     },
     {
      "n": "Concord coach",
      "b": [
       35,
       33,
       17,
       19
      ]
     },
     {
      "n": "Red coach",
      "b": [
       55,
       22,
       19.5,
       42
      ]
     },
     {
      "n": "Kneeling man's hat",
      "b": [
       75,
       46,
       9.5,
       10
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       83.5,
       65,
       13,
       32
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s15",
    "src": "images/art/transcon-s15.jpg",
    "title": "The Race Poster",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Race poster headline",
      "b": [
       19,
       5,
       40,
       12
      ]
     },
     {
      "n": "Pointing man's hat",
      "b": [
       13,
       22,
       16,
       18
      ]
     },
     {
      "n": "Red bandana",
      "b": [
       18,
       43,
       8,
       12
      ]
     },
     {
      "n": "Bearded man's hat",
      "b": [
       60,
       24,
       14,
       12
      ]
     },
     {
      "n": "Painted stagecoach",
      "b": [
       33,
       27,
       22,
       22
      ]
     },
     {
      "n": "Pile of gold coins",
      "b": [
       41,
       61,
       13,
       18
      ]
     },
     {
      "n": "Black hat",
      "b": [
       81,
       26,
       8,
       7
      ]
     },
     {
      "n": "Bottles on the shelves",
      "b": [
       89,
       12,
       10,
       28
      ]
     },
     {
      "n": "Brass goblet",
      "b": [
       92.5,
       51,
       7,
       10
      ]
     },
     {
      "n": "Pointing finger",
      "b": [
       28,
       48,
       8,
       10
      ]
     },
     {
      "n": "Crossed arms",
      "b": [
       54,
       40,
       14,
       16
      ]
     },
     {
      "n": "Bar counter",
      "b": [
       78,
       70,
       20,
       16
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
      "n": "Bearded man in a pink dress",
      "b": [
       6,
       2,
       29,
       90
      ]
     },
     {
      "n": "Feathered hat",
      "b": [
       10.5,
       1,
       18.5,
       21
      ]
     },
     {
      "n": "Boy's straw hat",
      "b": [
       37,
       49.5,
       12,
       13.5
      ]
     },
     {
      "n": "Boy in a blue shirt",
      "b": [
       35,
       50,
       14,
       50
      ]
     },
     {
      "n": "Pointing girl",
      "b": [
       46,
       38.5,
       17,
       61.5
      ]
     },
     {
      "n": "Pointing boy",
      "b": [
       49.5,
       57,
       21,
       43
      ]
     },
     {
      "n": "Lace bonnet",
      "b": [
       69,
       22,
       8,
       12
      ]
     },
     {
      "n": "Dark bonnet",
      "b": [
       78.5,
       21,
       10,
       13
      ]
     },
     {
      "n": "Boy's black hat",
      "b": [
       74,
       54,
       10.5,
       12
      ]
     },
     {
      "n": "Boy in a black hat",
      "b": [
       71,
       54,
       13,
       46
      ]
     },
     {
      "n": "Straw bonnet",
      "b": [
       91,
       26,
       8.5,
       10
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s26",
    "src": "images/art/transcon-s26.jpg",
    "title": "Geese on the Coach",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Standing man's hat",
      "b": [
       62,
       13,
       9,
       7
      ]
     },
     {
      "n": "Seated driver's hat",
      "b": [
       62.5,
       35,
       10,
       8
      ]
     },
     {
      "n": "Bearded driver",
      "b": [
       59,
       35,
       16,
       36
      ]
     },
     {
      "n": "Crates of geese",
      "b": [
       73,
       27,
       22,
       20
      ]
     },
     {
      "n": "Brown horses",
      "b": [
       44,
       59,
       13,
       32
      ]
     },
     {
      "n": "Front wagon wheel",
      "b": [
       73,
       82,
       12,
       16
      ]
     },
     {
      "n": "Rear wagon wheel",
      "b": [
       91,
       76,
       8,
       20
      ]
     },
     {
      "n": "Distant wagon",
      "b": [
       11.5,
       57,
       4.5,
       6
      ]
     },
     {
      "n": "Second distant wagon",
      "b": [
       20.5,
       57,
       4,
       6
      ]
     },
     {
      "n": "Pointing arm",
      "b": [
       70,
       22,
       14,
       12
      ]
     },
     {
      "n": "Knife",
      "b": [
       56,
       48,
       6,
       10
      ]
     }
    ]
   },
   {
    "id": "art-philly-s32",
    "src": "images/art/philly-s32.jpg",
    "title": "Lightning Express",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Lightning Express lettering",
      "b": [
       30,
       26,
       14,
       14
      ]
     },
     {
      "n": "Standing man's hat",
      "b": [
       47.5,
       8,
       8.5,
       8
      ]
     },
     {
      "n": "Red bandana",
      "b": [
       50,
       20,
       5,
       10
      ]
     },
     {
      "n": "Kneeling man's hat",
      "b": [
       13.5,
       31,
       10,
       11
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       21,
       51,
       13,
       32
      ]
     },
     {
      "n": "Wheel hub",
      "b": [
       20,
       61,
       8,
       12
      ]
     },
     {
      "n": "Brown horse's head",
      "b": [
       68,
       9,
       16,
       22
      ]
     },
     {
      "n": "Row of red wagons",
      "b": [
       84,
       36,
       15,
       28
      ]
     },
     {
      "n": "Standing man's boots",
      "b": [
       46,
       70,
       10,
       16
      ]
     },
     {
      "n": "Kneeling man's beard",
      "b": [
       8,
       42,
       8,
       10
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s37",
    "src": "images/art/transcon-s37.jpg",
    "title": "The Alpaca Coach",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Alpacas in the coach window",
      "b": [
       13,
       18,
       16,
       20
      ]
     },
     {
      "n": "Bearded man's hat",
      "b": [
       45,
       18,
       12,
       10
      ]
     },
     {
      "n": "Bucket man's hat",
      "b": [
       62,
       22,
       10,
       8
      ]
     },
     {
      "n": "Bucket",
      "b": [
       57.5,
       39,
       7,
       11
      ]
     },
     {
      "n": "Log cabin",
      "b": [
       67,
       13,
       22,
       26
      ]
     },
     {
      "n": "Alpaca on the roof",
      "b": [
       71.5,
       1,
       7,
       11
      ]
     },
     {
      "n": "Alpaca by the coach",
      "b": [
       17,
       45,
       16,
       28
      ]
     },
     {
      "n": "Front alpaca",
      "b": [
       71,
       57,
       14,
       32
      ]
     },
     {
      "n": "Alpaca near the cabin",
      "b": [
       76,
       40,
       9,
       16
      ]
     },
     {
      "n": "Grain in the air",
      "b": [
       40,
       30,
       12,
       14
      ]
     },
     {
      "n": "Coach window",
      "b": [
       8,
       16,
       12,
       16
      ]
     }
    ]
   },
   {
    "id": "art-philly-s37",
    "src": "images/art/philly-s37.jpg",
    "title": "Tipping His Hat",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Rider's black hat",
      "b": [
       18,
       7.5,
       10.5,
       7
      ]
     },
     {
      "n": "Black horse's head",
      "b": [
       35,
       24,
       9.5,
       24
      ]
     },
     {
      "n": "Holstered revolver",
      "b": [
       15.5,
       40,
       3.5,
       14
      ]
     },
     {
      "n": "Saddle",
      "b": [
       21,
       41.5,
       5.5,
       18
      ]
     },
     {
      "n": "Setting sun",
      "b": [
       47.5,
       39.5,
       4,
       4.5
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       60.5,
       40,
       4.5,
       9.5
      ]
     },
     {
      "n": "Bearded man's brown hat",
      "b": [
       71,
       20.5,
       10.5,
       11.5
      ]
     },
     {
      "n": "Large wagon wheel",
      "b": [
       81.5,
       50.5,
       13,
       32
      ]
     },
     {
      "n": "Small wagon wheel",
      "b": [
       50,
       53.5,
       4.5,
       18
      ]
     },
     {
      "n": "Canvas tarp",
      "b": [
       80.5,
       13.5,
       18,
       14
      ]
     },
     {
      "n": "Pine trees",
      "b": [
       88,
       8,
       12,
       28
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
       20,
       6.5,
       8.5,
       8.5
      ]
     },
     {
      "n": "Horse",
      "b": [
       12,
       24,
       19,
       57
      ]
     },
     {
      "n": "Longhorn steer",
      "b": [
       0,
       44,
       11.5,
       24
      ]
     },
     {
      "n": "Black longhorn",
      "b": [
       34.5,
       41,
       10,
       21.5
      ]
     },
     {
      "n": "Barrel of lobsters",
      "b": [
       61,
       4,
       12.5,
       11
      ]
     },
     {
      "n": "Barrel of ice",
      "b": [
       84,
       10.5,
       14.5,
       25
      ]
     },
     {
      "n": "Apron",
      "b": [
       51,
       37.5,
       12.5,
       44
      ]
     },
     {
      "n": "Red neckerchief",
      "b": [
       58.5,
       31.5,
       4,
       8.5
      ]
     },
     {
      "n": "Frying pan",
      "b": [
       53,
       75.5,
       23,
       14
      ]
     },
     {
      "n": "Campfire",
      "b": [
       60.5,
       87.5,
       13,
       12.5
      ]
     },
     {
      "n": "Cooking pot",
      "b": [
       37,
       81.5,
       11,
       18.5
      ]
     },
     {
      "n": "Wagon wheel",
      "b": [
       42.5,
       50,
       7.5,
       28.5
      ]
     }
    ]
   },
   {
    "id": "art-transcon-s58",
    "src": "images/art/transcon-s58.jpg",
    "title": "The Steamer",
    "credit": "Grok image art · Jang & Tom · Transcontinental",
    "items": [
     {
      "n": "Paddle steamer",
      "b": [
       24.5,
       41.5,
       30,
       32
      ]
     },
     {
      "n": "Smokestack",
      "b": [
       41.5,
       45.5,
       3,
       16
      ]
     },
     {
      "n": "Smoke plume",
      "b": [
       17,
       25.5,
       24,
       18
      ]
     },
     {
      "n": "Front paddlewheel",
      "b": [
       40,
       64,
       7.5,
       12
      ]
     },
     {
      "n": "Rear paddlewheel",
      "b": [
       47.5,
       63.5,
       5.5,
       10
      ]
     },
     {
      "n": "Front mast",
      "b": [
       34,
       41.5,
       2.5,
       18
      ]
     },
     {
      "n": "Rear mast",
      "b": [
       49,
       43,
       2.5,
       18
      ]
     },
     {
      "n": "Large seagull",
      "b": [
       26,
       14.5,
       7,
       6
      ]
     },
     {
      "n": "Seagull",
      "b": [
       4,
       25,
       3.5,
       3.5
      ]
     },
     {
      "n": "Sun",
      "b": [
       76.5,
       43,
       5,
       7.5
      ]
     },
     {
      "n": "Sun on the water",
      "b": [
       75,
       61,
       8,
       22
      ]
     },
     {
      "n": "Rocky headland",
      "b": [
       81,
       50.5,
       16,
       12
      ]
     }
    ]
   },
   {
    "id": "art-philly-s59",
    "src": "images/art/philly-s59.jpg",
    "title": "Wagon Line",
    "credit": "Grok image art · Jang & Tom · Philadelphia Follies",
    "items": [
     {
      "n": "Setting sun",
      "b": [
       71.5,
       56,
       4,
       4.5
      ]
     },
     {
      "n": "Lead covered wagon",
      "b": [
       20,
       58,
       16,
       20
      ]
     },
     {
      "n": "Lead wagon wheel",
      "b": [
       27,
       74,
       4.5,
       9
      ]
     },
     {
      "n": "Two men walking",
      "b": [
       14,
       71,
       6.5,
       11
      ]
     },
     {
      "n": "Man beside the lead wagon",
      "b": [
       34,
       72,
       2.8,
       11
      ]
     },
     {
      "n": "Second covered wagon",
      "b": [
       42.5,
       62.5,
       9.5,
       13
      ]
     },
     {
      "n": "Third covered wagon",
      "b": [
       54,
       64.5,
       6,
       9
      ]
     },
     {
      "n": "Fourth covered wagon",
      "b": [
       61.5,
       65.5,
       4.5,
       7
      ]
     },
     {
      "n": "Oxen",
      "b": [
       37.5,
       70.5,
       5.5,
       9
      ]
     },
     {
      "n": "Man by the second wagon",
      "b": [
       49,
       70.5,
       2.8,
       10
      ]
     },
     {
      "n": "Rocky outcrop",
      "b": [
       0,
       54,
       14,
       8
      ]
     },
     {
      "n": "Sagebrush",
      "b": [
       83.5,
       81.5,
       12,
       14
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
      "n": "Rusty patched panels",
      "b": [
       39,
       76,
       21,
       24
      ]
     },
     {
      "n": "Envelope nose",
      "b": [
       74,
       46,
       12,
       32
      ]
     },
     {
      "n": "Brown tail fin",
      "b": [
       10.5,
       69,
       16.5,
       26
      ]
     },
     {
      "n": "Dark tail spike",
      "b": [
       9,
       63,
       14,
       8
      ]
     },
     {
      "n": "Bow spar",
      "b": [
       82,
       37,
       14,
       11
      ]
     },
     {
      "n": "Lightning flash",
      "b": [
       5,
       38,
       11.5,
       20
      ]
     },
     {
      "n": "Lightning bolt",
      "b": [
       29.5,
       35.5,
       11.5,
       27
      ]
     },
     {
      "n": "Lower lightning",
      "b": [
       1,
       62,
       13.5,
       38
      ]
     },
     {
      "n": "Distant sky ship",
      "b": [
       84.5,
       62.5,
       12,
       31
      ]
     }
    ]
   }
  ]
 }
];
/* Scene ambience: each picture gets its own procedurally built soundscape (no audio files).
   Adjust which picture plays which preset in ISPY_SCENE_SOUNDS; tweak presets in AMBIENCE_PRESETS below. */
const ISPY_SCENE_SOUNDS = {
  // image file                              : preset      // scene
  "images/jang-and-tom-wagon-masters.jpg":    "trail",     // book cover: wagons, horses, Old West trail
  "media/wagonmasters_part1of6_poster.jpg":   "livery",    // outside a livery stable / barnyard in Independence
  "images/scenes/transcon-s01.jpg":           "town",      // stagecoach rolling down a muddy frontier main street at sunset
  "images/scenes/philly-s09.jpg":             "farmyard",  // farmhouse porch, rearing horse, woman shouting
  "images/scenes/transcon-s10.jpg":           "mountain",  // stagecoach crashing on a rocky mountain road
  "images/scenes/philly-s21.jpg":             "race",      // horse race, pack of galloping riders
  "images/scenes/transcon-s21.jpg":           "stampede",  // stagecoach driving through a longhorn herd
  "images/scenes/philly-s45.jpg":             "campfire",  // night camp under the Milky Way, campfire, tin cups
  "images/scenes/transcon-s46.jpg":           "crowd",     // crowd in a half-built timber town, goat eats top hat
  "images/scenes/transcon-s57.jpg":           "riverboat", // misty river dock, paddle steamer, people waving
  "images/art/philly-s01.jpg":                "gaslight",  // foggy gaslit city street at dusk, carriage on cobbles
  "images/art/philly-s03.jpg":                "saloon",    // man with pickled-egg jar in a lamp-lit bar
  "images/art/transcon-s07.jpg":              "livery",    // stage-line livery yard, mules, coaches, windmill
  "images/art/transcon-s15.jpg":              "saloon",    // race poster inside a saloon, bottles on shelves
  "images/art/philly-s15.jpg":                "crowd",     // boardwalk crowd laughing at a shop window
  "images/art/transcon-s26.jpg":              "snowplain", // stagecoach full of geese crossing a snowy plain
  "images/art/philly-s32.jpg":                "town",      // Lightning Express freight wagons in a frontier town
  "images/art/transcon-s37.jpg":              "mountain",  // alpacas spilling from a coach on a mountainside
  "images/art/philly-s37.jpg":                "dusktrail", // rider and wagon men at sunset by the pines
  "images/art/transcon-s53.jpg":              "snowcamp",  // chuckwagon supper in the snow, cattle herd behind
  "images/art/transcon-s58.jpg":              "steamer",   // steamboat on open water at sunset, gulls
  "images/art/philly-s59.jpg":                "prairie",   // covered-wagon line crossing open prairie at sunset
  "images/rusty-stack-game.jpg":              "airship"    // Rusty Stack airship in a lightning storm
};

const ISPY_PICS = ISPY_BOOKS.flatMap(book => book.pics.map(p => Object.assign({ book: book.name, sound: book.sound }, p, { sound: ISPY_SCENE_SOUNDS[p.src] || book.sound })));
const ROUND = 5;

const Ambience = (() => {
  const LEVEL = 0.42, FADE = 1.6;
  let ctx, master, white, brown, muted = false, cur = null, kind = null;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : LEVEL;
      master.connect(ctx.destination);
      const len = ctx.sampleRate * 4;
      white = ctx.createBuffer(1, len, ctx.sampleRate);
      brown = ctx.createBuffer(1, len, ctx.sampleRate);
      const w = white.getChannelData(0), b = brown.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        w[i] = Math.random() * 2 - 1;
        last = (last + 0.02 * w[i]) / 1.02;
        b[i] = last * 3.5;
      }
      // tilt the brown noise so its ends meet: the loop seam never clicks (white noise needs no fix)
      const drift = b[len - 1] - b[0];
      for (let i = 0; i < len; i++) b[i] -= drift * i / (len - 1);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- a Scene owns a bus, its looping nodes and its event timers ---------- */
  function Scene(name) {
    const bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(master);
    return { name, bus, nodes: [], timers: [], dead: false };
  }
  function keep(S, n) { S.nodes.push(n); return n; }
  function kill(S, fade) {
    if (!S || S.dead) return;
    S.dead = true;
    S.timers.forEach(t => clearTimeout(t));
    const now = ctx.currentTime;
    S.bus.gain.cancelScheduledValues(now);
    S.bus.gain.setValueAtTime(S.bus.gain.value, now);
    S.bus.gain.linearRampToValueAtTime(0, now + fade);
    setTimeout(() => {
      S.nodes.forEach(n => { try { n.stop(); } catch (e) {} try { n.disconnect(); } catch (e) {} });
      try { S.bus.disconnect(); } catch (e) {}
    }, fade * 1000 + 120);
  }
  // randomly scheduled one-shot: fn fires every min..max seconds while the scene lives
  function every(S, min, max, fn, first) {
    const go = () => {
      if (S.dead) return;
      try { fn(); } catch (e) {}
      S.timers.push(setTimeout(go, rnd(min, max) * 1000));
    };
    S.timers.push(setTimeout(go, (first != null ? first : rnd(min * 0.3, max * 0.6)) * 1000));
  }

  /* ---------- looping beds ---------- */
  function bed(S, o) {
    // o: {buf:'white'|'brown', type, f, q, g, lfo, depth, swell, swellRate, pan}
    const src = keep(S, ctx.createBufferSource());
    src.buffer = o.buf === "brown" ? brown : white;
    src.loop = true;
    src.playbackRate.value = o.rate || 1;
    const fl = ctx.createBiquadFilter();
    fl.type = o.type || "lowpass";
    fl.frequency.value = o.f;
    fl.Q.value = o.q || 0.7;
    const amp = ctx.createGain();
    amp.gain.value = o.g;
    src.connect(fl);
    let tail = fl;
    if (o.f2) { // optional second filter stage
      const f2 = ctx.createBiquadFilter();
      f2.type = o.type2 || "highpass";
      f2.frequency.value = o.f2;
      fl.connect(f2);
      tail = f2;
    }
    tail.connect(amp);
    if (o.pan != null && ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = o.pan;
      amp.connect(p); p.connect(S.bus);
    } else amp.connect(S.bus);
    if (o.lfo) { // slow filter wander
      const l = keep(S, ctx.createOscillator()), lg = ctx.createGain();
      l.frequency.value = o.lfo * rnd(0.8, 1.2);
      lg.gain.value = o.f * (o.depth || 0.3);
      l.connect(lg); lg.connect(fl.frequency); l.start();
    }
    if (o.swell) { // slow volume swell
      const l = keep(S, ctx.createOscillator()), lg = ctx.createGain();
      l.frequency.value = (o.swellRate || 0.11) * rnd(0.8, 1.2);
      lg.gain.value = o.g * o.swell;
      l.connect(lg); lg.connect(amp.gain); l.start();
    }
    src.start(0, rnd(0, 3.5));
    return { src, fl, amp };
  }
  function drone(S, freq, type, g, cutoff, wobble, am) {
    const o = keep(S, ctx.createOscillator());
    o.type = type; o.frequency.value = freq;
    const fl = ctx.createBiquadFilter();
    fl.type = "lowpass"; fl.frequency.value = cutoff || 240;
    const amp = ctx.createGain(); amp.gain.value = g;
    o.connect(fl); fl.connect(amp); amp.connect(S.bus);
    if (wobble) {
      const l = keep(S, ctx.createOscillator()), lg = ctx.createGain();
      l.frequency.value = 0.17; lg.gain.value = freq * wobble;
      l.connect(lg); lg.connect(o.frequency); l.start();
    }
    if (am) { // amplitude beat, e.g. propeller thrum
      const l = keep(S, ctx.createOscillator()), lg = ctx.createGain();
      l.frequency.value = am; lg.gain.value = g * 0.6;
      l.connect(lg); lg.connect(amp.gain); l.start();
    }
    o.start();
  }

  /* ---------- one-shot helpers ---------- */
  function out(S, pan) {
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = pan == null ? rnd(-0.7, 0.7) : pan;
      p.connect(S.bus);
      return p;
    }
    return S.bus;
  }
  function burst(S, t, dur, f, q, g, type, dest, buf) {
    const s = ctx.createBufferSource();
    s.buffer = buf === "brown" ? brown : white;
    const fl = ctx.createBiquadFilter();
    fl.type = type || "bandpass"; fl.frequency.value = f; fl.Q.value = q;
    const a = ctx.createGain();
    a.gain.setValueAtTime(0.0001, t);
    a.gain.linearRampToValueAtTime(g, t + Math.min(0.01, dur * 0.2));
    a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(a); a.connect(dest || S.bus);
    s.start(t, rnd(0, 3)); s.stop(t + dur + 0.05);
    return fl;
  }
  function tone(S, t, f, dur, g, type, dest, attack) {
    const o = ctx.createOscillator();
    o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    const a = ctx.createGain();
    a.gain.setValueAtTime(0.0001, t);
    a.gain.linearRampToValueAtTime(g, t + (attack || 0.005));
    a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(a); a.connect(dest || S.bus);
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }

  /* ---------- sound events ---------- */
  const EV = {
    cricket(S, g = 0.03) {
      const t = ctx.currentTime, d = out(S), f = rnd(3900, 4600), n = 3 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) tone(S, t + i * 0.075, f, 0.035, g, "triangle", d, 0.008);
    },
    bird(S, g = 0.03) {
      const t = ctx.currentTime, d = out(S), base = rnd(1400, 2300), n = 1 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) {
        const o = tone(S, t + i * 0.22, base, 0.2, g, "sine", d, 0.02);
        o.frequency.exponentialRampToValueAtTime(base * rnd(1.25, 1.6), t + i * 0.22 + 0.07);
        o.frequency.exponentialRampToValueAtTime(base * 0.85, t + i * 0.22 + 0.19);
      }
    },
    meadowlark(S, g = 0.025) {
      const t = ctx.currentTime, d = out(S), notes = [2600, 2200, 3100, 2400, 1900];
      notes.slice(0, 3 + (Math.random() * 3 | 0)).forEach((f, i) => tone(S, t + i * 0.13, f * rnd(0.95, 1.05), 0.12, g, "sine", d, 0.01));
    },
    creak(S, g = 0.05) {
      const t = ctx.currentTime, fl = burst(S, t, rnd(0.35, 0.7), rnd(180, 420), 9, g, "bandpass", out(S));
      fl.frequency.exponentialRampToValueAtTime(rnd(70, 120), t + 0.55);
    },
    hooves(S, g = 0.05, steps = 6, gap = 0.28, f = 700, pan) {
      const t = ctx.currentTime, d = out(S, pan);
      for (let i = 0; i < steps; i++) {
        const tt = t + i * gap + (i % 2 ? gap * 0.35 : 0) + rnd(-0.01, 0.01);
        burst(S, tt, 0.07, f * rnd(0.85, 1.15), 3, g * rnd(0.7, 1), "bandpass", d);
      }
    },
    gallop(S, g = 0.06, bars = 6) { // three-beat gallop, low thuds
      const t = ctx.currentTime, d = out(S);
      for (let b = 0; b < bars; b++) [0, 0.09, 0.19].forEach(o => burst(S, t + b * 0.42 + o, 0.09, rnd(160, 260), 1.5, g * rnd(0.7, 1), "lowpass", d, "brown"));
    },
    wheel(S, g = 0.03) { // wagon wheel rattle and axle creak
      const t = ctx.currentTime, d = out(S);
      for (let i = 0; i < 10; i++) burst(S, t + i * 0.11 + rnd(0, 0.03), 0.05, rnd(900, 1500), 6, g * rnd(0.4, 1), "bandpass", d);
      if (Math.random() < 0.6) EV.creak(S, g * 1.3);
    },
    voices(S, g = 0.03, n = 5) { // distant indistinct talk: formant-ish noise syllables
      const t = ctx.currentTime, d = out(S);
      let tt = t;
      for (let i = 0; i < n; i++) {
        const dur = rnd(0.1, 0.25);
        burst(S, tt, dur, rnd(450, 1100), 4, g * rnd(0.5, 1), "bandpass", d);
        tt += dur + rnd(0.02, 0.12);
      }
    },
    laugh(S, g = 0.03) {
      const t = ctx.currentTime, d = out(S), f = rnd(700, 1200), n = 4 + (Math.random() * 4 | 0);
      for (let i = 0; i < n; i++) burst(S, t + i * 0.14, 0.1, f * (1 - i * 0.03), 6, g * (1 - i * 0.08), "bandpass", d);
    },
    clink(S, g = 0.03) { // glass clink
      const t = ctx.currentTime, d = out(S), f = rnd(2400, 3600);
      [1, 2.32, 3.9].forEach((m, i) => tone(S, t, f * m, 0.5 - i * 0.12, g / (i + 1), "sine", d, 0.002));
      if (Math.random() < 0.4) [1, 2.32].forEach((m, i) => tone(S, t + 0.09, f * 1.07 * m, 0.35, g * 0.6 / (i + 1), "sine", d, 0.002));
    },
    piano(S, g = 0.02) { // faint honky-tonk phrase: two slightly detuned strings per note
      const t = ctx.currentTime, d = out(S, rnd(-0.4, 0.4));
      const scale = [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3, 659.3];
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400; lp.connect(d);
      const n = 4 + (Math.random() * 5 | 0);
      let i0 = Math.random() * 5 | 0;
      for (let i = 0; i < n; i++) {
        const tt = t + i * rnd(0.22, 0.34), f = scale[i0];
        tone(S, tt, f, 0.9, g, "triangle", lp, 0.004);
        tone(S, tt, f * 1.006, 0.9, g * 0.7, "triangle", lp, 0.004);
        if (i % 2 === 0) tone(S, tt, f / 2, 1.1, g * 0.5, "triangle", lp, 0.004);
        i0 = Math.max(0, Math.min(scale.length - 1, i0 + pick([-2, -1, 1, 1, 2])));
      }
    },
    crackle(S, g = 0.05) {
      const t = ctx.currentTime, d = out(S, rnd(-0.2, 0.2)), n = 1 + (Math.random() * 4 | 0);
      for (let i = 0; i < n; i++) burst(S, t + rnd(0, 0.25), rnd(0.008, 0.03), rnd(1500, 5000), 1, g * rnd(0.3, 1), "highpass", d);
    },
    pop(S, g = 0.06) { // bigger ember pop
      burst(S, ctx.currentTime, 0.05, rnd(600, 1400), 2, g, "bandpass", out(S, rnd(-0.2, 0.2)));
    },
    owl(S, g = 0.025) {
      const t = ctx.currentTime, d = out(S);
      [0, 0.45, 0.75].forEach((o, i) => { const x = tone(S, t + o, 400 - i * 15, 0.35, g, "sine", d, 0.06); x.frequency.linearRampToValueAtTime(370 - i * 15, t + o + 0.3); });
    },
    thunder(S, g = 0.12) {
      const t = ctx.currentTime, dur = rnd(3, 5.5);
      const fl = burst(S, t, dur, rnd(90, 160), 0.7, g, "lowpass", out(S), "brown");
      fl.frequency.linearRampToValueAtTime(60, t + dur);
    },
    whistle(S, g = 0.03) { // distant steam whistle chord
      const t = ctx.currentTime, d = out(S, rnd(-0.5, 0.5)), len = rnd(1.2, 2.2);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1200; lp.connect(d);
      [311, 392, 466].forEach(f => {
        const o = ctx.createOscillator(), a = ctx.createGain();
        o.type = "sawtooth"; o.frequency.setValueAtTime(f * 0.97, t); o.frequency.linearRampToValueAtTime(f, t + 0.25);
        a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(g / 3, t + 0.25);
        a.gain.setValueAtTime(g / 3, t + len); a.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.6);
        o.connect(a); a.connect(lp); o.start(t); o.stop(t + len + 0.7);
      });
      burst(S, t, len + 0.4, 2500, 1, g * 0.4, "bandpass", d);
    },
    hiss(S, g = 0.03) { // steam release
      const t = ctx.currentTime, dur = rnd(0.8, 1.6), fl = burst(S, t, dur, 3500, 0.8, g, "highpass", out(S));
      fl.frequency.linearRampToValueAtTime(5000, t + dur);
    },
    gull(S, g = 0.025) {
      const t = ctx.currentTime, d = out(S), n = 2 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) {
        const tt = t + i * 0.28, o = tone(S, tt, 1800, 0.24, g, "sawtooth", d, 0.03);
        o.frequency.exponentialRampToValueAtTime(1100, tt + 0.22);
      }
    },
    honk(S, g = 0.03) { // goose
      const t = ctx.currentTime, d = out(S);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1100; bp.Q.value = 2; bp.connect(d);
      const n = 1 + (Math.random() * 3 | 0);
      for (let i = 0; i < n; i++) { const o = tone(S, t + i * 0.22, rnd(380, 460), 0.16, g, "sawtooth", bp, 0.01); o.frequency.linearRampToValueAtTime(330, t + i * 0.22 + 0.15); }
    },
    moo(S, g = 0.03) { // distant cattle lowing
      const t = ctx.currentTime, d = out(S), len = rnd(0.9, 1.6);
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 500; lp.connect(d);
      const o = ctx.createOscillator(), a = ctx.createGain();
      o.type = "sawtooth"; const f = rnd(95, 130);
      o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.15, t + len * 0.3); o.frequency.linearRampToValueAtTime(f * 0.85, t + len);
      a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(g, t + 0.2); a.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(a); a.connect(lp); o.start(t); o.stop(t + len + 0.1);
    },
    cluck(S, g = 0.025) { // hen
      const t = ctx.currentTime, d = out(S), n = 2 + (Math.random() * 4 | 0);
      for (let i = 0; i < n; i++) burst(S, t + i * rnd(0.12, 0.2), 0.06, rnd(900, 1400), 8, g, "bandpass", d);
    },
    snort(S, g = 0.04) { // horse snort / blow
      const t = ctx.currentTime, fl = burst(S, t, rnd(0.4, 0.7), 900, 1.2, g, "bandpass", out(S));
      fl.frequency.linearRampToValueAtTime(400, t + 0.5);
    },
    whinny(S, g = 0.02) {
      const t = ctx.currentTime, d = out(S), len = 1.1;
      const o = ctx.createOscillator(), v = ctx.createOscillator(), vg = ctx.createGain(), a = ctx.createGain();
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200; bp.Q.value = 1.5;
      o.type = "sawtooth"; o.frequency.setValueAtTime(900, t); o.frequency.linearRampToValueAtTime(1100, t + 0.2); o.frequency.exponentialRampToValueAtTime(450, t + len);
      v.frequency.value = 11; vg.gain.value = 40; v.connect(vg); vg.connect(o.frequency);
      a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(g, t + 0.08); a.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(bp); bp.connect(a); a.connect(d);
      o.start(t); v.start(t); o.stop(t + len + 0.1); v.stop(t + len + 0.1);
    },
    hammer(S, g = 0.04) { // distant carpentry
      const t = ctx.currentTime, d = out(S), n = 2 + (Math.random() * 4 | 0);
      for (let i = 0; i < n; i++) burst(S, t + i * rnd(0.35, 0.5), 0.06, rnd(500, 800), 5, g, "bandpass", d);
    },
    bell(S, g = 0.02) { // far-off church bell
      const t = ctx.currentTime, d = out(S, rnd(-0.6, 0.6)), f = rnd(210, 250);
      [1, 2.0, 2.76, 5.4].forEach((m, i) => tone(S, t, f * m, 3.5 - i * 0.6, g / (i + 1), "sine", d, 0.004));
    },
    cheer(S, g = 0.04) { // crowd swell
      const t = ctx.currentTime, dur = rnd(1.5, 2.5), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), a = ctx.createGain();
      s.buffer = white; fl.type = "bandpass"; fl.frequency.value = 1000; fl.Q.value = 0.8;
      a.gain.setValueAtTime(0.0001, t); a.gain.linearRampToValueAtTime(g, t + dur * 0.35); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(fl); fl.connect(a); a.connect(out(S)); s.start(t, rnd(0, 3)); s.stop(t + dur + 0.05);
    },
    rocks(S, g = 0.04) { // gravel skitter / small rockfall
      const t = ctx.currentTime, d = out(S), n = 5 + (Math.random() * 8 | 0);
      for (let i = 0; i < n; i++) burst(S, t + i * rnd(0.04, 0.12), 0.04, rnd(1200, 3000), 4, g * rnd(0.3, 1), "bandpass", d);
    },
    lap(S, g = 0.03) { // water lapping against pilings
      const t = ctx.currentTime, dur = rnd(0.5, 0.9), fl = burst(S, t, dur, rnd(400, 700), 1.5, g, "bandpass", out(S));
      fl.frequency.exponentialRampToValueAtTime(250, t + dur);
    },
    sizzle(S, g = 0.02) {
      burst(S, ctx.currentTime, rnd(1, 2), 5000, 0.7, g, "highpass", out(S, rnd(-0.2, 0.2)));
    },
    rigging(S, g = 0.03) { // rope/line flutter
      const t = ctx.currentTime, d = out(S);
      for (let i = 0; i < 6; i++) burst(S, t + i * 0.06, 0.05, rnd(250, 400), 5, g * rnd(0.5, 1), "bandpass", d);
    }
  };

  /* ---------- presets: beds + scheduled events ---------- */
  const AMBIENCE_PRESETS = {
    prairie(S) { // open prairie: soft rolling wind, insects, meadowlarks, far-off wagon creaks
      bed(S, { f: 480, g: 0.1, lfo: 0.07, depth: 0.3, swell: 0.35, swellRate: 0.13 });
      bed(S, { f: 1200, g: 0.025, lfo: 0.05, depth: 0.3 });
      every(S, 1.5, 3.5, () => EV.cricket(S, 0.02));
      every(S, 5, 11, () => EV.meadowlark(S));
      every(S, 7, 14, () => EV.creak(S, 0.03));
    },
    trail(S) { // wagon trail by day: light wind, rolling wheels, hooves, birds
      bed(S, { f: 420, g: 0.07, lfo: 0.06, swell: 0.3 });
      bed(S, { buf: "brown", f: 180, g: 0.08 });
      every(S, 3, 6, () => EV.hooves(S, 0.035, 8, 0.3, 650));
      every(S, 4, 8, () => EV.wheel(S, 0.022));
      every(S, 4, 9, () => EV.bird(S, 0.022));
    },
    dusktrail(S) { // sunset by the pines: breeze in trees, crickets starting, horse shifting, wagon creaks
      bed(S, { f: 900, type: "bandpass", q: 0.5, g: 0.06, lfo: 0.05, depth: 0.4, swell: 0.4, swellRate: 0.08 });
      bed(S, { f: 300, g: 0.04 });
      every(S, 1.2, 2.6, () => EV.cricket(S, 0.018));
      every(S, 6, 12, () => EV.snort(S, 0.03));
      every(S, 5, 10, () => EV.hooves(S, 0.03, 3, 0.4, 600));
      every(S, 6, 12, () => EV.creak(S, 0.035));
      every(S, 9, 18, () => EV.bird(S, 0.015));
    },
    town(S) { // frontier main street: hooves, wagon creaks, distant voices, a dog-free murmur
      bed(S, { f: 350, g: 0.075, lfo: 0.06, swell: 0.3 });
      bed(S, { f: 800, type: "bandpass", q: 0.6, g: 0.02, swell: 0.5, swellRate: 0.3 });
      every(S, 2.5, 5, () => EV.hooves(S, 0.04, 8, 0.3, 700));
      every(S, 4, 8, () => EV.wheel(S, 0.022));
      every(S, 2.5, 5.5, () => EV.voices(S, 0.018, 4 + (Math.random() * 4 | 0)));
      every(S, 10, 20, () => EV.hammer(S, 0.02));
      every(S, 8, 16, () => EV.snort(S, 0.025));
    },
    livery(S) { // livery stable yard: horses/mules stamping and snorting, hay rustle, creaking gate, birds
      bed(S, { f: 380, g: 0.075, lfo: 0.06, swell: 0.3 });
      bed(S, { f: 3000, type: "bandpass", q: 0.8, g: 0.008, swell: 0.8, swellRate: 0.2 });
      every(S, 3, 7, () => EV.hooves(S, 0.035, 2 + (Math.random() * 3 | 0), 0.35, 550));
      every(S, 4, 9, () => EV.snort(S, 0.035));
      every(S, 12, 24, () => EV.whinny(S, 0.015));
      every(S, 5, 10, () => EV.creak(S, 0.04));
      every(S, 4, 8, () => EV.bird(S, 0.02));
      every(S, 6, 12, () => EV.voices(S, 0.015, 3));
      every(S, 12, 22, () => EV.hammer(S, 0.018));
    },
    farmyard(S) { // farmhouse yard: birds, clucking hens, horse, porch creaks
      bed(S, { f: 400, g: 0.075, lfo: 0.06, swell: 0.3 });
      every(S, 2.5, 5, () => EV.bird(S, 0.022));
      every(S, 3, 7, () => EV.cluck(S, 0.022));
      every(S, 6, 12, () => EV.snort(S, 0.035));
      every(S, 10, 20, () => EV.whinny(S, 0.016));
      every(S, 5, 10, () => EV.hooves(S, 0.035, 3, 0.3, 550));
      every(S, 6, 12, () => EV.creak(S, 0.035));
    },
    race(S) { // horse race: rolling gallop, wind rush, distant cheering
      bed(S, { f: 700, g: 0.07, lfo: 0.2, depth: 0.4, swell: 0.4, swellRate: 0.25 });
      bed(S, { buf: "brown", f: 160, g: 0.09, swell: 0.3, swellRate: 0.4 });
      every(S, 0.9, 1.8, () => EV.gallop(S, 0.05, 5));
      every(S, 4, 8, () => EV.cheer(S, 0.028));
      every(S, 6, 12, () => EV.snort(S, 0.03));
    },
    stampede(S) { // longhorn herd: low rumble, many hooves, lowing, coach rattle
      bed(S, { buf: "brown", f: 140, g: 0.13, lfo: 0.15, swell: 0.3, swellRate: 0.2 });
      bed(S, { f: 600, g: 0.04, lfo: 0.1 });
      every(S, 0.6, 1.3, () => EV.gallop(S, 0.04, 4));
      every(S, 2, 4.5, () => EV.moo(S, 0.03));
      every(S, 3, 6, () => EV.wheel(S, 0.025));
    },
    mountain(S) { // rocky mountain road: gusty wind, gravel skitter, rattling coach, hooves
      bed(S, { f: 600, g: 0.09, lfo: 0.09, depth: 0.45, swell: 0.55, swellRate: 0.1 });
      bed(S, { f: 1800, type: "bandpass", q: 1.5, g: 0.012, lfo: 0.07, depth: 0.3, swell: 0.6 });
      every(S, 3, 7, () => EV.rocks(S, 0.03));
      every(S, 3, 6, () => EV.wheel(S, 0.025));
      every(S, 4, 8, () => EV.hooves(S, 0.035, 6, 0.25, 650));
      every(S, 10, 20, () => EV.bird(S, 0.012));
    },
    campfire(S) { // night camp: crickets, crackling fire, faint breeze, far owl
      bed(S, { f: 300, g: 0.035, lfo: 0.05, swell: 0.3 });
      bed(S, { buf: "brown", f: 400, g: 0.04, swell: 0.4, swellRate: 0.5 }); // fire breath
      every(S, 0.12, 0.6, () => EV.crackle(S, 0.035), 0.2);
      every(S, 3, 8, () => EV.pop(S, 0.035));
      every(S, 0.8, 1.8, () => EV.cricket(S, 0.02));
      every(S, 14, 28, () => EV.owl(S, 0.02));
      every(S, 12, 24, () => EV.snort(S, 0.02));
    },
    snowcamp(S) { // chuckwagon supper in the snow: cold wind, fire crackle and sizzling pan, cattle lowing
      bed(S, { f: 700, g: 0.06, lfo: 0.07, depth: 0.4, swell: 0.4 });
      bed(S, { buf: "brown", f: 400, g: 0.03, swell: 0.4, swellRate: 0.5 });
      every(S, 0.15, 0.7, () => EV.crackle(S, 0.03), 0.2);
      every(S, 2.5, 5, () => EV.sizzle(S, 0.014));
      every(S, 4, 9, () => EV.moo(S, 0.025));
      every(S, 6, 12, () => EV.clink(S, 0.012));
      every(S, 7, 14, () => EV.hooves(S, 0.025, 4, 0.35, 450));
    },
    snowplain(S) { // coach across a snowy plain: cold whistling wind, muffled hooves, geese
      bed(S, { f: 550, g: 0.08, lfo: 0.08, depth: 0.4, swell: 0.5, swellRate: 0.09 });
      bed(S, { f: 2200, type: "bandpass", q: 4, g: 0.012, lfo: 0.06, depth: 0.25, swell: 0.7, swellRate: 0.07 });
      every(S, 2.5, 5, () => EV.hooves(S, 0.03, 8, 0.28, 400));
      every(S, 3, 7, () => EV.honk(S, 0.022));
      every(S, 5, 10, () => EV.creak(S, 0.03));
    },
    saloon(S) { // saloon: crowd murmur, clinking glasses, faint honky-tonk piano, occasional laugh
      bed(S, { f: 600, type: "bandpass", q: 0.9, g: 0.05, lfo: 0.3, depth: 0.25, swell: 0.4, swellRate: 0.6 });
      bed(S, { f: 1100, type: "bandpass", q: 1.2, g: 0.02, lfo: 0.4, depth: 0.2, swell: 0.6, swellRate: 0.9 });
      bed(S, { buf: "brown", f: 200, g: 0.04 });
      every(S, 1.5, 4, () => EV.clink(S, 0.018));
      every(S, 1.5, 3.5, () => EV.voices(S, 0.018, 3 + (Math.random() * 4 | 0)));
      every(S, 5, 10, () => EV.piano(S, 0.012), 1.5);
      every(S, 8, 16, () => EV.laugh(S, 0.018));
      every(S, 10, 20, () => EV.creak(S, 0.025));
    },
    crowd(S) { // outdoor crowd: murmur, bursts of laughter, a few calls; hammering on a half-built town
      bed(S, { f: 700, type: "bandpass", q: 0.8, g: 0.05, lfo: 0.3, depth: 0.25, swell: 0.4, swellRate: 0.5 });
      bed(S, { f: 350, g: 0.03, lfo: 0.06 });
      every(S, 1, 2.5, () => EV.voices(S, 0.02, 3 + (Math.random() * 5 | 0)));
      every(S, 4, 9, () => EV.laugh(S, 0.022));
      every(S, 6, 12, () => EV.hammer(S, 0.02));
      every(S, 8, 16, () => EV.hooves(S, 0.03, 4, 0.3, 650));
    },
    gaslight(S) { // foggy gaslit city street at dusk: carriage on cobbles, soft drizzle, distant bell
      bed(S, { f: 5000, type: "highpass", g: 0.012, swell: 0.3, swellRate: 0.07 }); // drizzle
      bed(S, { buf: "brown", f: 220, g: 0.05, lfo: 0.05, swell: 0.3 });           // city hush
      every(S, 3, 6, () => EV.hooves(S, 0.04, 8, 0.26, 1100));
      every(S, 5, 10, () => EV.wheel(S, 0.02));
      every(S, 18, 32, () => EV.bell(S, 0.02), 4);
      every(S, 7, 14, () => EV.voices(S, 0.012, 3));
    },
    riverboat(S) { // misty river dock: lapping water, paddlewheel churn, steam hiss, whistle, gulls
      bed(S, { buf: "brown", f: 500, g: 0.08, lfo: 0.12, depth: 0.35, swell: 0.4, swellRate: 0.2 });
      const churn = bed(S, { f: 900, type: "bandpass", q: 0.8, g: 0.02 });
      const l = keep(S, ctx.createOscillator()), lg = ctx.createGain(); // paddle rhythm
      l.frequency.value = 1.4; lg.gain.value = 0.012; l.connect(lg); lg.connect(churn.amp.gain); l.start();
      drone(S, 55, "sine", 0.03, 180, 0.01);
      every(S, 1.5, 3.5, () => EV.lap(S, 0.03));
      every(S, 6, 12, () => EV.hiss(S, 0.012));
      every(S, 18, 35, () => EV.whistle(S, 0.022), 5);
      every(S, 5, 10, () => EV.gull(S, 0.014));
      every(S, 5, 10, () => EV.voices(S, 0.014, 4));
      every(S, 7, 14, () => EV.creak(S, 0.03));
    },
    steamer(S) { // steamboat on open water at sunset: waves, engine chug, gulls, sea breeze
      bed(S, { buf: "brown", f: 600, g: 0.09, lfo: 0.09, depth: 0.4, swell: 0.5, swellRate: 0.12 });
      bed(S, { f: 900, g: 0.03, lfo: 0.06, swell: 0.4 });
      const chug = bed(S, { f: 300, g: 0.02 });
      const l = keep(S, ctx.createOscillator()), lg = ctx.createGain(); // steam engine chug
      l.type = "square"; l.frequency.value = 1.8; lg.gain.value = 0.016; l.connect(lg); lg.connect(chug.amp.gain); l.start();
      every(S, 2.5, 6, () => EV.gull(S, 0.018));
      every(S, 20, 40, () => EV.whistle(S, 0.018), 8);
      every(S, 8, 16, () => EV.hiss(S, 0.01));
    },
    airship(S) { // Rusty Stack airship: engine drone, propeller thrum, rushing wind, rigging creaks, far thunder
      drone(S, 49, "sine", 0.09, 220, 0.01);
      drone(S, 73.5, "triangle", 0.045, 220, 0.01, 7.5);  // propeller thrum
      drone(S, 98, "sawtooth", 0.012, 260, 0.006, 15);
      bed(S, { f: 700, g: 0.07, lfo: 0.08, depth: 0.4, swell: 0.4, swellRate: 0.1 }); // wind rushing past
      bed(S, { f: 2500, type: "bandpass", q: 2, g: 0.01, lfo: 0.05, depth: 0.3, swell: 0.6 });
      every(S, 2.5, 5, () => EV.creak(S, 0.045));
      every(S, 4, 8, () => EV.rigging(S, 0.02));
      every(S, 14, 28, () => EV.thunder(S, 0.07), 6);
    }
  };

  function start(next) {
    if (!ac()) return;
    if (!AMBIENCE_PRESETS[next]) next = "prairie";
    if (kind === next && cur && !cur.dead) return;
    kill(cur, FADE); // crossfade: old scene fades out while the new one fades in
    kind = next;
    const S = Scene(next);
    AMBIENCE_PRESETS[next](S);
    const now = ctx.currentTime;
    S.bus.gain.setValueAtTime(0, now);
    S.bus.gain.linearRampToValueAtTime(1, now + FADE);
    cur = S;
    if (window.console) console.info("[I Spy] ambience preset:", next);
  }
  return {
    unlock() { ac(); },
    play(next) { start(next); },
    stop() { if (ctx) kill(cur, 0.6); cur = null; kind = null; },
    toggle() {
      muted = !muted;
      if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : LEVEL, ctx.currentTime, 0.04);
      else if (master) master.gain.value = muted ? 0 : LEVEL;
      return muted;
    },
    get muted() { return muted; },
    get running() { return !!kind; },
    get kind() { return kind; },
    presets: Object.keys(AMBIENCE_PRESETS),
    get _ctx() { return ctx; },
    get _master() { return master; }
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
    const tol = 2;
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
