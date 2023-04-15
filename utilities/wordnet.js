import wordnet from "wordnet";

let isLoaded = false;

export const startWordnet = async () => {
  return await wordnet
    .init()
    .then(() => {
      isLoaded = true;
      return true;
    })
    .catch((error) => {
      console.error(error);
      return false;
    });
};

export default async (word) => {
  return wordnet.lookup(word);
};
