export default async (waitTime) => {
  return new Promise((resolve) => {
    setTimeout(resolve, waitTime);
  });
};
