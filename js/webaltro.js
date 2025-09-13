const SUITS = Object.freeze({
  HEART: "Heart",
  SPADE: "Spade",
  DIAMOND: "Diamond",
  CLUB: "Club"
});

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];

const HAND_TYPES = Object.freeze({
  HIGH_CARD: "High Card",
  PAIR: "Pair",
  TWO_PAIR: "Two Pair",
  THREE_OF_A_KIND: "Three of a Kind",
  STRAIGHT: "Straight",
  FLUSH: "Flush",
  FULL_HOUSE: "Full House",
  FOUR_OF_A_KIND: "Four of a Kind",
  STRAIGHT_FLUSH: "Straight Flush",
  ROYAL_FLUSH: "Royal Flush"
});

const RANK_VALUE = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "Jack": 10,
  "Queen": 10,
  "King": 10,
  "Ace": 11
};

const HAND_BASE_VALUES = {
  "High Card": { chips: 5, mult: 1 },
  "Pair": { chips: 10, mult: 2 },
  "Two Pair": { chips: 20, mult: 2 },
  "Three of a Kind": { chips: 30, mult: 3 },
  "Straight": { chips: 30, mult: 4 },
  "Flush": { chips: 35, mult: 4 },
  "Full House": { chips: 40, mult: 4 },
  "Four of a Kind": { chips: 60, mult: 7 },
  "Straight Flush": { chips: 100, mult: 8 },
  "Royal Flush": { chips: 100, mult: 8 }
};

/*****************************************************************************************/
//CLASSES

class Card {
  constructor(suit, rank, enhancement = null, edition = null, seal = null) {
    this.suit = suit;
    this.rank = rank;
    this.enhancement = enhancement;
    this.edition = edition;
    this.seal = seal;
  }

  getValue() {
    return RANK_VALUE[this.rank];
  }
};

/*****************************************************************************************/

class Deck {
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (let suit of Object.values(SUITS)) {
      for (let rank of RANKS) {
        var newCard = new Card(suit, rank);
        this.cards.push(newCard);
        console.log("Added new card to deck: " + newCard.rank + " of " + newCard.suit + "s.");
      }
    }

    updateDeckVisual(this.size());
    console.log("Finished resetting deck! (deck size: " + this.cards.length + ")");
  }

  shuffle() {
    for (let discardedCard of this.discardPile) {
      this.cards.push(discardedCard);
    }
    let currIndex = this.cards.length;
    while (currIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currIndex);
      currIndex--;
      [this.cards[currIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currIndex]];
    }
  }

  draw() {
    if (this.isEmpty()) {
      return null;
    }

    let drawnCard = this.cards.pop();
    this.discardPile.push(drawnCard);
    updateDeckVisual(this.size());
    return drawnCard;
  }

  size() {
    return this.cards.length;
  }

  isEmpty() {
    return this.cards.length == 0;
  }

  displayDeck() {
    let count = 0;
    console.log(`
|******************************************
|Displaying all cards currently in deck:        
|------------------------------------------`);
    for (let card of this.cards) {
      count++;
      console.log("| " + count + ". " + card.rank + " of " + card.suit + "s.");
    }

    console.log(`|******************************************`);
  }
};

/*****************************************************************************************/

class Hand {
  constructor(handSize = 8) {
    this.cards = [];
    this.handSize = handSize;
    this.currSelectedCards = [];
    this.maxSelectedCards = 5;
  }

  draw(deck) {
    let drawnCard = null;
    if (deck && !deck.isEmpty()) {
      drawnCard = deck.draw();
      if (drawnCard) {
        this.cards.push(drawnCard);
      }
    }
    return drawnCard;
  }

  drawFullHand(deck) {
    let drawnCards = [];
    for (let i = this.cards.length; i < this.handSize; i++) {
      let drawnCard = this.draw(deck);
      drawnCards.push(drawnCard);
    }

    return drawnCards;
  }

  selectCard(index) {
    let i = this.currSelectedCards.indexOf(index);
    if (i !== -1) {
      this.currSelectedCards.splice(i, 1);
    } else if (this.currSelectedCards.length < this.maxSelectedCards) {
      this.currSelectedCards.push(index);
    }

    this.evaluateHandType();
  }

  evaluateHandType() {
    const handSize = this.currSelectedCards.length;
    if (handSize == 0) {
      displayHandType(null);
      return null;
    }
    if (handSize == 1) {
      displayHandType(HAND_TYPES.HIGH_CARD);
      return HAND_TYPES.HIGH_CARD;
    }

    const selectedCards = playerHand.currSelectedCards.map(i => playerHand.cards[i]);
    const suits = selectedCards.map(card => card.suit);
    const ranks = selectedCards.map(card => card.rank);

    let rankOccurrences = Object.values(this.countAllOccurrences(ranks));
    rankOccurrences = rankOccurrences.sort((a, b) => b - a);
    let flush = false;
    let straight = false;
    if (handSize === 5) {
      const suitOccurrences = Object.values(this.countAllOccurrences(suits));
      flush = suitOccurrences.length === 1;
      straight = this.isStraight(ranks);
    }

    console.log(rankOccurrences);

    let handType = HAND_TYPES.HIGH_CARD;

    if (straight && flush) {
      handType = HAND_TYPES.STRAIGHT_FLUSH;
    } else if (rankOccurrences[0] === 4) {
      handType = HAND_TYPES.FOUR_OF_A_KIND;
    } else if (rankOccurrences[0] === 3 && rankOccurrences[1] === 2) {
      handType = HAND_TYPES.FULL_HOUSE;
    } else if (flush) {
      handType = HAND_TYPES.FLUSH;
    } else if (straight) {
      handType = HAND_TYPES.STRAIGHT;
    } else if (rankOccurrences[0] === 3) {
      handType = HAND_TYPES.THREE_OF_A_KIND;
    } else if (rankOccurrences[0] === 2 && rankOccurrences[1] === 2) {
      handType = HAND_TYPES.TWO_PAIR;
    } else if (rankOccurrences[0] === 2) {
      handType = HAND_TYPES.PAIR;
    }

    displayHandType(handType);
    return handType;
  }

  countAllOccurrences(array) {
    const occurrences = {};
    for (let value of array) {
      if (occurrences[value]) {
        occurrences[value] += 1;
      } else {
        occurrences[value] = 1;
      }
    }

    return occurrences;
  }

  isStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)];
    const sortedRanks = uniqueRanks.sort((a, b) => RANKS.indexOf(a) - RANKS.indexOf(b));

    if (sortedRanks.length < 5) {
      return false;
    }
    //checks that each rank follows the last
    for (let i = 0; i < sortedRanks.length - 1; i++) {
      let currIndex = RANKS.indexOf(sortedRanks[i]);
      let nextIndex = RANKS.indexOf(sortedRanks[i + 1]);
      if (nextIndex !== currentIndex + 1) {
        return false;
      }

      return true;
    }
  }

  sortByRank() {
    this.cards.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
  }

  sortBySuit() {
    this.sortByRank();
    this.cards.sort((a, b) => Object.values(SUITS).indexOf(a.suit) - Object.values(SUITS).indexOf(b.suit));
  }

  getCardByIndex(index = 0) {
    return this.cards[index];
  }

  getAllCards() {
    return this.cards;
  }

  size() {
    return this.cards.length;
  }

  display() {
    let count = 0;
    console.log(`
|=================
|Current Hand:        
|-----------------`);
    for (let card of this.cards) {
      count++;
      console.log("| " + count + ". " + card.rank + " of " + card.suit + "s.");
    }

    console.log(`|******************************************`);
  }
}

/*****************************************************************************************/
//FUNCTIONS

function renderHand(hand) {
  const container = document.getElementById("handContainer");
  container.innerHTML = "";

  for (let i = 0; i < hand.size(); i++) {
    const cardDiv = document.createElement("div");
    cardDiv.id = "cardInHand" + i;
    cardDiv.className = "card";
    cardDiv.appendChild(document.createTextNode(hand.getCardByIndex(i).rank + " of " + hand.getCardByIndex(i).suit + "s"));
    cardDiv.dataset.index = i;
    container.appendChild(cardDiv);
  }
}

function updateDeckVisual(amount) {
  document.getElementById("deck").innerHTML = "Deck: " + amount;
}

function displayHandType(handType) {
  if (handType == null) {
    handType = "---"
  }
  document.getElementById("currentHandType").innerHTML = handType;
}

/*****************************************************************************************/
//GAME PROCESS

function init() {
  playerDeck.shuffle();
  playerHand.drawFullHand(playerDeck);
  playerHand.sortBySuit();
  renderHand(playerHand);
}

let playerDeck = new Deck();
let playerHand = new Hand();

init();

/*****************************************************************************************/
//EVENT LISTENERS

//card selection
const handContainer = document.getElementById("handContainer");
handContainer.addEventListener("click", (event) => {
  const cardDiv = event.target.closest(".card");
  if (!cardDiv) {
    return;
  }

  let index = cardDiv.dataset.index;
  playerHand.selectCard(index);
  cardDiv.classList.toggle("selected", playerHand.currSelectedCards.includes(index))
});
//

const buttonSortHandBySuit = document.getElementById("buttonSortHandBySuit");
buttonSortHandBySuit.addEventListener("click", function () {
  playerHand.sortBySuit();
  renderHand(playerHand);
});
const buttonSortHandByRank = document.getElementById("buttonSortHandByRank");
buttonSortHandByRank.addEventListener("click", function () {
  playerHand.sortByRank();
  renderHand(playerHand);
});
