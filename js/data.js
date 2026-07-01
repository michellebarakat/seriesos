// SeriesOS — Curated Collection Data
// This file holds ONLY original/curated content (Michelle's own picks, categories, blurbs, reviews).
// Poster images, release year, and official rating are fetched live from TMDB at runtime and merged in.

class CuratedItem {
  constructor(id, title, category, yourBlurb, yourReview) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.yourBlurb = yourBlurb;
    this.yourReview = yourReview;
  }
}

const curatedCollection = [
  // Crime & Thrillers
  new CuratedItem(1, "Breaking Bad", "Crime & Thrillers",
    "Slow-burn descent from teacher to kingpin.",
    "One of the best character arcs ever written for TV. Every season raises the stakes."),
  new CuratedItem(2, "Dexter", "Crime & Thrillers",
    "A serial killer with a code, and a city full of reasons to break it.",
    "The internal monologue concept is so well done, you root for him despite everything."),
  new CuratedItem(3, "You", "Crime & Thrillers",
    "Obsession dressed up as romance.",
    "Unsettling because it makes you understand the logic of someone you know is wrong."),
  new CuratedItem(4, "Criminal Minds", "Crime & Thrillers",
    "Profiling the worst of humanity, one case at a time.",
    "Great for marathon watching — formulaic in a way that's comforting, not boring."),
  new CuratedItem(5, "Money Heist", "Crime & Thrillers",
    "A heist too big and too bold to fail.",
    "The early seasons are some of the tensest heist writing on TV."),
  new CuratedItem(23, "The Night Agent", "Crime & Thrillers",
    "A low-level FBI agent, a White House conspiracy, and no one left to trust.",
    "Super bingeable — fast paced from episode one, doesn't let up."),
  new CuratedItem(24, "The Punisher", "Crime & Thrillers",
    "A one-man war against everyone who wronged him.",
    "Darker and more grounded than most Marvel shows, Jon Bernthal carries every scene."),

  // K-Dramas
  new CuratedItem(6, "Queen of Tears", "K-Dramas",
    "A marriage on the rocks, chaebol drama at full volume.",
    "Goes from comedy to genuinely emotional faster than you expect."),
  new CuratedItem(7, "My Demon", "K-Dramas",
    "A demon, a chaebol heiress, and a contract neither expected to need.",
    "Fun premise, great chemistry between leads, very rewatchable."),
  new CuratedItem(8, "Business Proposal", "K-Dramas",
    "A fake dating scheme that doesn't stay fake for long.",
    "Lighthearted, funny, exactly what you want from a rom-com drama."),

  // Reality & Competition
  new CuratedItem(9, "Love is Blind", "Reality & Competition",
    "Love, sight unseen.",
    "Equal parts compelling and chaotic — hard to stop watching once you start."),
  new CuratedItem(10, "Too Hot to Handle", "Reality & Competition",
    "The prize is self-control, and almost nobody wins it.",
    "Guilty pleasure reality TV done right."),
  new CuratedItem(11, "Selling Sunset", "Reality & Competition",
    "Real estate drama with more shade than square footage.",
    "Watch for the houses, stay for the drama."),
  new CuratedItem(12, "The Circle", "Reality & Competition",
    "Strangers, screens, and a popularity contest with real stakes.",
    "Surprisingly strategic — more interesting than it sounds on paper."),
  new CuratedItem(25, "Love Island", "Reality & Competition",
    "A villa full of strangers trying to couple up and stay in.",
    "Addictive format, you'll have strong opinions about people you've never met."),

  // Teen & Young Adult
  new CuratedItem(13, "Outer Banks", "Teen & Young Adult",
    "Treasure hunting with a side of class warfare.",
    "Pure popcorn entertainment, easy to binge in a weekend."),
  new CuratedItem(14, "Riverdale", "Teen & Young Adult",
    "Small-town murder mystery that spirals into something stranger.",
    "Starts grounded, ends up somewhere completely different — wild ride."),
  new CuratedItem(15, "Never Have I Ever", "Teen & Young Adult",
    "Growing up, grieving, and getting it wrong in real time.",
    "Funnier and more emotional than expected, great coming-of-age writing."),
  new CuratedItem(16, "Maxton Hall", "Teen & Young Adult",
    "Elite school, impossible rules, undeniable chemistry.",
    "Great slow-burn enemies-to-lovers dynamic."),

  // Must-Watch / OG Classics
  new CuratedItem(17, "Friends", "Must-Watch / OG Classics",
    "The sitcom that defined a generation of TV.",
    "Comfort show — always rewatchable no matter how many times you've seen it."),
  new CuratedItem(18, "Brooklyn Nine-Nine", "Must-Watch / OG Classics",
    "A precinct full of chaos, run with surprising heart.",
    "Consistently funny with a cast that has incredible chemistry."),
  new CuratedItem(19, "The Good Place", "Must-Watch / OG Classics",
    "A comedy about ethics that somehow makes you cry.",
    "Smart, funny, and has one of the best twists in TV history."),
  new CuratedItem(20, "Lost", "Must-Watch / OG Classics",
    "A plane crash, an island, and questions that took six seasons to answer.",
    "A defining mystery-box show — frustrating and brilliant in equal measure."),
  new CuratedItem(26, "Suits", "Must-Watch / OG Classics",
    "A brilliant college dropout bluffing his way through a top law firm.",
    "Slick, fast-talking, and impossible to stop watching. Harvey Specter is iconic."),
  new CuratedItem(27, "Desperate Housewives", "Must-Watch / OG Classics",
    "Secrets, scandals, and murder — all behind white picket fences.",
    "Ahead of its time. Equal parts dark comedy and thriller, never boring for a second."),
  new CuratedItem(28, "How I Met Your Mother", "Must-Watch / OG Classics",
    "A nine-season love story told completely out of order.",
    "Genuinely funny for most of its run — the journey is worth it even if the finale isn't."),
  new CuratedItem(29, "Lucifer", "Must-Watch / OG Classics",
    "The devil quits Hell, opens a nightclub in LA, and becomes a police consultant.",
    "Ridiculous premise executed with so much charm you just go with it completely."),

  // Superhero / Action
  new CuratedItem(21, "Daredevil", "Superhero / Action",
    "A blind lawyer, a city that needs saving, and a line he keeps crossing.",
    "One of the best live-action superhero adaptations, period."),
  new CuratedItem(22, "The Witcher", "Superhero / Action",
    "Monsters, politics, and a man who'd rather be left alone.",
    "Great worldbuilding, even better when you stop trying to track the timeline."),
];

export { CuratedItem, curatedCollection };