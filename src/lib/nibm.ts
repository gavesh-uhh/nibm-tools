const getDay = (currentDate: Date | undefined, offset: number): string => {
  if (currentDate == undefined) return "Weirday";
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + offset);
  return newDate.toLocaleDateString("en-US", { weekday: "long" });
};

const getRandomQuote = () => {
  const quotes = [
    'Why hurry? Your lecturer will start 10 minutes late anyway.',
    'Fun fact: This page is as reliable as the Wi-Fi in the lecture halls.',
    'Almost there... or maybe not.',
    'If this takes too long, blame the admin department.',
    'Loading... because skipping class isn’t an option. Or is it?',
    'Still loading... unlike the uni elevators.',
    'If you can read this, you’re probably not in a lecture.',
    'Not saying names, but someone should stop watching kids through CCTVs',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};



export {
  getDay,
  getRandomQuote
}
