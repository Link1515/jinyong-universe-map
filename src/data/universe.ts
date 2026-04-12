import { novels } from "./novels";
import { characters as aDeadlySecretCharacters, relationships as aDeadlySecretRelationships } from "./works/aDeadlySecret";
import { characters as bloodSwordCharacters, relationships as bloodSwordRelationships } from "./works/bloodSword";
import { characters as bookSwordCharacters, relationships as bookSwordRelationships } from "./works/bookSword";
import { characters as deerCauldronCharacters, relationships as deerCauldronRelationships } from "./works/deerCauldron";
import { characters as demigodsSemidemonsCharacters, relationships as demigodsSemidemonsRelationships } from "./works/demigodsSemidemons";
import { characters as flyingFoxSnowCharacters, relationships as flyingFoxSnowRelationships } from "./works/flyingFoxSnow";
import { characters as heavenSwordDragonSaberCharacters, relationships as heavenSwordDragonSaberRelationships } from "./works/heavenSwordDragonSaber";
import { characters as legendCondorCharacters, relationships as legendCondorRelationships } from "./works/legendCondor";
import { characters as mandarinDucksBladesCharacters, relationships as mandarinDucksBladesRelationships } from "./works/mandarinDucksBlades";
import { characters as odeGallantryCharacters, relationships as odeGallantryRelationships } from "./works/odeGallantry";
import { characters as returnCondorCharacters, relationships as returnCondorRelationships } from "./works/returnCondor";
import { characters as sideStoryFlyingFoxCharacters, relationships as sideStoryFlyingFoxRelationships } from "./works/sideStoryFlyingFox";
import { characters as smilingProudWandererCharacters, relationships as smilingProudWandererRelationships } from "./works/smilingProudWanderer";
import { characters as swordOfYueMaidenCharacters, relationships as swordOfYueMaidenRelationships } from "./works/swordOfYueMaiden";
import { characters as whiteHorseWestWindCharacters, relationships as whiteHorseWestWindRelationships } from "./works/whiteHorseWestWind";
import type { Character, Relationship, UniverseData } from "../types";

export const characters: Character[] = [
  ...bookSwordCharacters,
  ...bloodSwordCharacters,
  ...legendCondorCharacters,
  ...flyingFoxSnowCharacters,
  ...returnCondorCharacters,
  ...sideStoryFlyingFoxCharacters,
  ...mandarinDucksBladesCharacters,
  ...whiteHorseWestWindCharacters,
  ...heavenSwordDragonSaberCharacters,
  ...aDeadlySecretCharacters,
  ...demigodsSemidemonsCharacters,
  ...odeGallantryCharacters,
  ...smilingProudWandererCharacters,
  ...deerCauldronCharacters,
  ...swordOfYueMaidenCharacters
];

export const relationships: Relationship[] = [
  ...bookSwordRelationships,
  ...bloodSwordRelationships,
  ...legendCondorRelationships,
  ...flyingFoxSnowRelationships,
  ...returnCondorRelationships,
  ...sideStoryFlyingFoxRelationships,
  ...mandarinDucksBladesRelationships,
  ...whiteHorseWestWindRelationships,
  ...heavenSwordDragonSaberRelationships,
  ...aDeadlySecretRelationships,
  ...demigodsSemidemonsRelationships,
  ...odeGallantryRelationships,
  ...smilingProudWandererRelationships,
  ...deerCauldronRelationships,
  ...swordOfYueMaidenRelationships
];

export const universe: UniverseData = { novels, characters, relationships };
